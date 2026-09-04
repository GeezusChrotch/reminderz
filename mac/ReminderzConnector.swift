import AppKit
import CoreImage
import EventKit
import Foundation
import Network
import Security
import ServiceManagement

private let localPort: NWEndpoint.Port = 7843
private let servePort = "10447"
private let connectorVersion = "1.1.0"

private struct HTTPRequest {
    let method: String
    let path: String
    let headers: [String: String]
    let body: Data
}

private struct PairingCode {
    let origin: String
    let expires: Date
}

private final class ReminderServer {
    private let store: EKEventStore
    private let token: String
    private let queue = DispatchQueue(label: "org.reminderz.http")
    private var listener: NWListener?
    private var pairingCodes: [String: PairingCode] = [:]

    init(store: EKEventStore, token: String) {
        self.store = store
        self.token = token
    }

    func start(completion: @escaping (Result<Void, Error>) -> Void) {
        do {
            let parameters = NWParameters.tcp
            parameters.requiredLocalEndpoint = .hostPort(host: "127.0.0.1", port: localPort)
            let listener = try NWListener(using: parameters)
            listener.stateUpdateHandler = { state in
                if case .ready = state { DispatchQueue.main.async { completion(.success(())) } }
                if case let .failed(error) = state { DispatchQueue.main.async { completion(.failure(error)) } }
            }
            listener.newConnectionHandler = { [weak self] connection in self?.accept(connection) }
            self.listener = listener
            listener.start(queue: queue)
        } catch { completion(.failure(error)) }
    }

    func stop(completion: @escaping () -> Void) {
        queue.async {
            self.pairingCodes.removeAll()
            guard let listener = self.listener else {
                DispatchQueue.main.async(execute: completion)
                return
            }
            self.listener = nil
            listener.stateUpdateHandler = { state in
                if case .cancelled = state {
                    DispatchQueue.main.async(execute: completion)
                }
            }
            listener.cancel()
        }
    }

    func makePairingURL(origin: String) -> URL? {
        var bytes = [UInt8](repeating: 0, count: 18)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { return nil }
        let code = Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
        queue.sync {
            let now = Date()
            pairingCodes = pairingCodes.filter { $0.value.expires > now }
            pairingCodes[code] = PairingCode(origin: origin, expires: now.addingTimeInterval(10 * 60))
        }
        var components = URLComponents(string: origin + "/pair")
        components?.queryItems = [URLQueryItem(name: "code", value: code)]
        return components?.url
    }

    private func accept(_ connection: NWConnection) {
        connection.start(queue: queue)
        receive(connection, accumulated: Data())
    }

    private func receive(_ connection: NWConnection, accumulated: Data) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 65_536) { [weak self] data, _, complete, error in
            guard let self else { return }
            var buffer = accumulated
            if let data { buffer.append(data) }
            if let request = self.parse(buffer) {
                if request.method == "GET", self.requestPath(request.path) == "/pair" {
                    let page = self.redeemPairingPage(request.path)
                    self.respondHTML(connection, status: page == nil ? 410 : 200,
                                     html: page ?? self.expiredPairingPage())
                    return
                }
                self.route(request) { status, value in self.respond(connection, status: status, value: value) }
            } else if error == nil && !complete && buffer.count < 65_536 {
                self.receive(connection, accumulated: buffer)
            } else {
                self.respond(connection, status: 400, value: ["error": "Invalid request"])
            }
        }
    }

    private func requestPath(_ target: String) -> String {
        target.split(separator: "?", maxSplits: 1).first.map(String.init) ?? target
    }

    private func queryValue(named name: String, in target: String) -> String? {
        guard let components = URLComponents(string: "https://reminderz.invalid\(target)") else { return nil }
        return components.queryItems?.first(where: { $0.name == name })?.value
    }

    private func redeemPairingPage(_ target: String) -> String? {
        guard let code = queryValue(named: "code", in: target),
              let pairing = pairingCodes.removeValue(forKey: code), pairing.expires > Date() else { return nil }
        let payload = ["gatewayURL": pairing.origin, "gatewayToken": token]
        guard !payload["gatewayURL", default: ""].isEmpty,
              let data = try? JSONSerialization.data(withJSONObject: payload) else { return nil }
        let encoded = data.base64EncodedString()
        return pairingPage(encodedPayload: encoded)
    }

    private func pairingPage(encodedPayload: String) -> String {
        """
        <!doctype html><html lang="en"><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
        <title>Pair Reminderz</title><style>
        body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;background:#f2f2f7;color:#111}
        main{max-width:34rem;margin:3rem auto;padding:1.5rem}section{background:white;border-radius:18px;padding:1.5rem;box-shadow:0 8px 30px #0002}
        h1{margin-top:0}button{font:inherit;font-weight:600;width:100%;padding:.9rem;border:0;border-radius:12px;background:#087cff;color:white}
        textarea{box-sizing:border-box;width:100%;height:7rem;margin:.8rem 0;padding:.7rem;border:1px solid #bbb;border-radius:10px;font-family:ui-monospace,monospace;font-size:.75rem}
        #done{color:#187a39;font-weight:600}.steps{line-height:1.45;color:#444}
        </style></head><body><main><section><h1>Pair Reminderz</h1>
        <p>This one-time page keeps the pairing details on your iPhone.</p>
        <textarea id="payload" readonly></textarea><button id="copy">Copy pairing details</button>
        <p id="done" hidden>Copied on this iPhone.</p>
        <p class="steps">Now open Pebble → Reminderz → Settings, paste into <b>Pairing details</b>, select <b>Test connection</b>, then save.</p>
        </section></main><script>
        const value=atob('\(encodedPayload)');const box=document.getElementById('payload');box.value=value;
        document.getElementById('copy').onclick=async()=>{try{await navigator.clipboard.writeText(value)}catch(e){box.focus();box.select();document.execCommand('copy')}document.getElementById('done').hidden=false};
        </script></body></html>
        """
    }

    private func expiredPairingPage() -> String {
        """
        <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Pair Reminderz</title></head><body style="font-family:-apple-system;margin:3rem">
        <h1>This pairing code has expired</h1><p>On your Mac, choose Connect Phone again to make a fresh one-time QR code.</p>
        </body></html>
        """
    }

    private func parse(_ data: Data) -> HTTPRequest? {
        guard let marker = data.range(of: Data("\r\n\r\n".utf8)),
              let headerText = String(data: data[..<marker.lowerBound], encoding: .utf8) else { return nil }
        let lines = headerText.components(separatedBy: "\r\n")
        guard let first = lines.first else { return nil }
        let parts = first.split(separator: " ")
        guard parts.count >= 2 else { return nil }
        var headers: [String: String] = [:]
        for line in lines.dropFirst() {
            let pair = line.split(separator: ":", maxSplits: 1).map(String.init)
            if pair.count == 2 { headers[pair[0].lowercased()] = pair[1].trimmingCharacters(in: .whitespaces) }
        }
        let bodyStart = marker.upperBound
        let length = Int(headers["content-length"] ?? "0") ?? 0
        guard data.count >= bodyStart + length else { return nil }
        return HTTPRequest(method: String(parts[0]), path: String(parts[1]), headers: headers,
                           body: data.subdata(in: bodyStart..<(bodyStart + length)))
    }

    private func route(_ request: HTTPRequest, completion: @escaping (Int, [String: Any]) -> Void) {
        if request.method == "OPTIONS" { completion(200, ["ok": true]); return }
        guard request.headers["authorization"] == "Bearer \(token)" else {
            completion(401, ["error": "Pair this phone again in Reminderz Settings"]); return
        }
        let path = requestPath(request.path)
        if request.method == "GET" && path == "/v1/health" {
            completion(200, ["ok": true, "reminders": Self.remindersAllowed,
                             "apiVersion": 1, "connectorVersion": connectorVersion]); return
        }
        guard Self.remindersAllowed else {
            completion(503, ["error": "Allow Reminders access in Reminderz Connector"]); return
        }
        if request.method == "GET" && path == "/v1/lists" {
            DispatchQueue.main.async { self.listCalendars(completion) }; return
        }
        let components = path.split(separator: "/").map { String($0).removingPercentEncoding ?? String($0) }
        if request.method == "POST", components.count == 4,
           components[0] == "v1", components[1] == "reminders", components[3] == "delete" {
            DispatchQueue.main.async {
                self.deleteReminder(identifier: components[2], body: request.body, completion: completion)
            }; return
        }
        if request.method == "GET", components.count == 4,
           components[0] == "v1", components[1] == "lists", components[3] == "reminders" {
            DispatchQueue.main.async { self.listReminders(calendarID: components[2], completion: completion) }; return
        }
        if request.method == "POST", components.count == 4,
           components[0] == "v1", components[1] == "lists", components[3] == "reminders" {
            DispatchQueue.main.async {
                self.createReminder(calendarID: components[2], body: request.body, completion: completion)
            }; return
        }
        if request.method == "POST", components.count == 4,
           components[0] == "v1", components[1] == "reminders", components[3] == "completed" {
            DispatchQueue.main.async {
                self.setReminderCompleted(identifier: components[2], body: request.body, completion: completion)
            }; return
        }
        completion(404, ["error": "Not found"])
    }

    private static var remindersAllowed: Bool {
        EKEventStore.authorizationStatus(for: .reminder) == .fullAccess
    }

    private func listCalendars(_ completion: @escaping (Int, [String: Any]) -> Void) {
        let predicate = store.predicateForReminders(in: nil)
        store.fetchReminders(matching: predicate) { [weak self] reminders in
            guard let self else { return }
            let grouped = Dictionary(grouping: reminders ?? [], by: { $0.calendar.calendarIdentifier })
            let calendars = self.store.calendars(for: .reminder).sorted {
                $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending
            }.map { calendar -> [String: Any] in
                let items = grouped[calendar.calendarIdentifier] ?? []
                let completed = items.reduce(0) { $0 + ($1.isCompleted ? 1 : 0) }
                return ["id": calendar.calendarIdentifier, "title": calendar.title,
                        "incompleteCount": items.count - completed, "completedCount": completed]
            }
            completion(200, ["lists": calendars])
        }
    }

    private func listReminders(calendarID: String, completion: @escaping (Int, [String: Any]) -> Void) {
        guard let calendar = store.calendar(withIdentifier: calendarID) else {
            completion(404, ["error": "That reminder list no longer exists"]); return
        }
        let predicate = store.predicateForReminders(in: [calendar])
        store.fetchReminders(matching: predicate) { reminders in
            let sorted = (reminders ?? []).sorted { left, right in
                if left.isCompleted != right.isCompleted { return !left.isCompleted }
                if left.isCompleted, right.isCompleted {
                    return (left.completionDate ?? .distantPast) > (right.completionDate ?? .distantPast)
                }
                if left.priority != right.priority { return left.priority > right.priority }
                let leftDate = left.dueDateComponents?.date ?? .distantFuture
                let rightDate = right.dueDateComponents?.date ?? .distantFuture
                if leftDate != rightDate { return leftDate < rightDate }
                return left.title.localizedCaseInsensitiveCompare(right.title) == .orderedAscending
            }.map { reminder -> [String: Any] in
                var item: [String: Any] = ["id": reminder.calendarItemIdentifier,
                                           "title": reminder.title ?? "Untitled",
                                           "completed": reminder.isCompleted]
                if let due = reminder.dueDateComponents?.date {
                    item["due"] = ISO8601DateFormatter().string(from: due)
                }
                return item
            }
            completion(200, ["reminders": sorted])
        }
    }

    private func createReminder(calendarID: String, body: Data,
                                completion: @escaping (Int, [String: Any]) -> Void) {
        guard let calendar = store.calendar(withIdentifier: calendarID) else {
            completion(404, ["error": "That reminder list no longer exists"]); return
        }
        guard let object = try? JSONSerialization.jsonObject(with: body) as? [String: Any],
              let rawTitle = object["title"] as? String else {
            completion(400, ["error": "A reminder title is required"]); return
        }
        let title = rawTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !title.isEmpty, title.count <= 500 else {
            completion(400, ["error": "The reminder title is empty or too long"]); return
        }
        let reminder = EKReminder(eventStore: store)
        reminder.calendar = calendar
        reminder.title = title
        do {
            try store.save(reminder, commit: true)
            completion(201, ["ok": true, "id": reminder.calendarItemIdentifier])
        } catch { completion(500, ["error": "Apple Reminders could not save that item"] ) }
    }

    private func setReminderCompleted(identifier: String, body: Data,
                                      completion: @escaping (Int, [String: Any]) -> Void) {
        guard let reminder = store.calendarItem(withIdentifier: identifier) as? EKReminder else {
            completion(404, ["error": "That reminder has already changed"]); return
        }
        guard let object = try? JSONSerialization.jsonObject(with: body) as? [String: Any],
              let completed = object["completed"] as? Bool else {
            completion(400, ["error": "A completed state is required"]); return
        }
        reminder.isCompleted = completed
        reminder.completionDate = completed ? Date() : nil
        do {
            try store.save(reminder, commit: true)
            completion(200, ["ok": true, "completed": completed])
        } catch { completion(500, ["error": "Apple Reminders could not update that item"] ) }
    }

    private func deleteReminder(identifier: String, body: Data,
                                completion: @escaping (Int, [String: Any]) -> Void) {
        guard let object = try? JSONSerialization.jsonObject(with: body) as? [String: Any],
              object["confirmed"] as? Bool == true else {
            completion(400, ["error": "Confirm deletion on your watch first"]); return
        }
        guard let reminder = store.calendarItem(withIdentifier: identifier) as? EKReminder else {
            completion(404, ["error": "That reminder has already changed"]); return
        }
        do {
            try store.remove(reminder, commit: true)
            completion(200, ["ok": true])
        } catch { completion(500, ["error": "Apple Reminders could not delete that item"]) }
    }

    private func respond(_ connection: NWConnection, status: Int, value: [String: Any]) {
        let body = (try? JSONSerialization.data(withJSONObject: value)) ?? Data("{}".utf8)
        let reason = [200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized",
                      404: "Not Found", 500: "Server Error", 503: "Unavailable"][status] ?? "OK"
        let headers = "HTTP/1.1 \(status) \(reason)\r\nContent-Type: application/json\r\n" +
            "Content-Length: \(body.count)\r\nAccess-Control-Allow-Origin: *\r\n" +
            "Access-Control-Allow-Headers: Authorization, Content-Type\r\n" +
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\nConnection: close\r\n\r\n"
        var response = Data(headers.utf8)
        response.append(body)
        connection.send(content: response, completion: .contentProcessed { _ in connection.cancel() })
    }

    private func respondHTML(_ connection: NWConnection, status: Int, html: String) {
        let body = Data(html.utf8)
        let reason = status == 200 ? "OK" : "Gone"
        let headers = "HTTP/1.1 \(status) \(reason)\r\nContent-Type: text/html; charset=utf-8\r\n" +
            "Content-Length: \(body.count)\r\nCache-Control: no-store\r\n" +
            "Referrer-Policy: no-referrer\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n"
        var response = Data(headers.utf8)
        response.append(body)
        connection.send(content: response, completion: .contentProcessed { _ in connection.cancel() })
    }
}

private final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    private let store = EKEventStore()
    private var server: ReminderServer!
    private var window: NSWindow!
    private var reminderStatus: NSTextField!
    private var connectorStatus: NSTextField!
    private var privateStatus: NSTextField!
    private var loginStatus: NSTextField!
    private var loginButton: NSButton!
    private var summary: NSTextField!
    private var token = ""
    private var serviceBusy = true
    private var serviceStopped = false
    private var serviceButton: NSButton!
    private var restartButton: NSButton!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        ProcessInfo.processInfo.disableAutomaticTermination("Reminderz keeps syncing with its window closed")
        buildWindow()
        summary.stringValue = "Unlocking the Connector token…"
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            let token = TokenStore.token()
            DispatchQueue.main.async {
                guard let self else { return }
                self.token = token
                self.startService()
            }
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        sender.orderOut(nil)
        return false
    }

    private func startService() {
        guard !token.isEmpty else { return }
        serviceBusy = true
        updateServiceButtons()
        server = ReminderServer(store: store, token: token)
        server.start { [weak self] result in
            guard let self else { return }
            self.serviceBusy = false
            switch result {
            case .success:
                self.serviceStopped = false
                self.refresh()
            case .failure(let error):
                self.serviceStopped = true
                self.refresh()
                self.setStatus(self.connectorStatus, ok: false, text: "Mac service: \(error.localizedDescription)")
            }
        }
    }

    private func updateServiceButtons() {
        serviceButton?.title = serviceStopped ? "Start Service" : "Stop Service"
        serviceButton?.isEnabled = !serviceBusy && !token.isEmpty
        restartButton?.isEnabled = !serviceBusy && !token.isEmpty
    }

    @objc private func toggleService() {
        guard !serviceBusy else { return }
        if serviceStopped { startService(); return }
        stopService(restart: false)
    }

    @objc private func restartService() {
        guard !serviceBusy else { return }
        stopService(restart: true)
    }

    private func stopService(restart: Bool) {
        serviceBusy = true
        updateServiceButtons()
        guard let server else {
            if restart { startService() }
            else { serviceBusy = false; refresh() }
            return
        }
        server.stop { [weak self] in
            guard let self else { return }
            self.server = nil
            self.serviceStopped = true
            if restart { self.startService() }
            else {
                self.serviceBusy = false
                self.refresh()
            }
        }
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        refresh()
        return true
    }

    private func buildWindow() {
        let content = NSView()
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 640, height: 760),
                          styleMask: [.titled, .closable, .miniaturizable], backing: .buffered, defer: false)
        window.title = "Reminderz Connector"
        window.isReleasedWhenClosed = false
        window.delegate = self
        window.center()
        window.contentView = content
        let stack = NSStackView()
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = 14
        stack.translatesAutoresizingMaskIntoConstraints = false
        content.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 28),
            stack.trailingAnchor.constraint(equalTo: content.trailingAnchor, constant: -28),
            stack.topAnchor.constraint(equalTo: content.topAnchor, constant: 26)
        ])
        let title = NSTextField(labelWithString: "Reminderz Connector")
        title.font = .systemFont(ofSize: 26, weight: .bold)
        stack.addArrangedSubview(title)
        let intro = label("Keeps your Pebble synced with Apple Reminders anywhere through your private Tailscale network.")
        intro.textColor = .secondaryLabelColor
        stack.addArrangedSubview(intro)
        summary = label("Checking setup…")
        summary.font = .systemFont(ofSize: 18, weight: .semibold)
        stack.addArrangedSubview(summary)
        reminderStatus = statusLabel("Reminders access: Checking…")
        connectorStatus = statusLabel("Mac service: Starting…")
        privateStatus = statusLabel("Private sync: Checking Tailscale…")
        loginStatus = statusLabel("Start at login: Checking…")
        [reminderStatus, connectorStatus, privateStatus, loginStatus].forEach(stack.addArrangedSubview)
        stack.addArrangedSubview(actionRow("Allow Reminders", #selector(requestReminders),
                                          "Lets Reminderz read lists, add items, and mark items complete."))
        stack.addArrangedSubview(actionRow("Start Private Sync", #selector(startPrivateSync),
                                          "Creates a tailnet-only HTTPS route. It never enables public Funnel access."))
        stack.addArrangedSubview(actionRow("Stop Private Sync", #selector(stopPrivateSync),
                                          "Removes only Reminderz port 10447 and preserves other Tailscale routes."))
        stack.addArrangedSubview(actionRow("Connect Phone", #selector(connectPhone),
                                          "Shows a one-time QR code so pairing starts directly on your iPhone."))
        let loginRow = actionRow("Start at Login", #selector(toggleStartAtLogin),
                                 "Keeps remote sync available after you sign in to this Mac.")
        loginButton = loginRow.arrangedSubviews.first as? NSButton
        stack.addArrangedSubview(loginRow)
        stack.addArrangedSubview(actionRow("Test Everything", #selector(refreshAction),
                                          "Checks permission, the local service, and the Tailscale route."))
        let serviceRow = actionRow("Stop Service", #selector(toggleService),
                                   "Pauses reminder sync. Use Start Service to resume.")
        serviceButton = serviceRow.arrangedSubviews.first as? NSButton
        stack.addArrangedSubview(serviceRow)
        let restartRow = actionRow("Restart Service", #selector(restartService),
                                   "Restarts sync using your existing pairing and permissions.")
        restartButton = restartRow.arrangedSubviews.first as? NSButton
        stack.addArrangedSubview(restartRow)
        updateServiceButtons()
        stack.addArrangedSubview(label("Closing this window keeps sync running. Reopen Reminderz Connector from Applications to manage the service."))
        let footer = label("Reminder titles travel only between your Apple devices and your private tailnet. The access token is stored in macOS Keychain. Connector \(connectorVersion).")
        footer.font = .systemFont(ofSize: 12)
        footer.textColor = .secondaryLabelColor
        stack.addArrangedSubview(footer)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func label(_ text: String) -> NSTextField {
        let value = NSTextField(wrappingLabelWithString: text)
        value.maximumNumberOfLines = 0
        value.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        return value
    }

    private func statusLabel(_ text: String) -> NSTextField {
        let value = label("○  \(text)")
        value.font = .systemFont(ofSize: 16, weight: .medium)
        return value
    }

    private func actionRow(_ title: String, _ action: Selector, _ explanation: String) -> NSStackView {
        let button = NSButton(title: title, target: self, action: action)
        button.bezelStyle = .rounded
        button.widthAnchor.constraint(equalToConstant: 175).isActive = true
        let detail = label(explanation)
        detail.font = .systemFont(ofSize: 13)
        detail.textColor = .secondaryLabelColor
        let row = NSStackView(views: [button, detail])
        row.orientation = .horizontal
        row.alignment = .centerY
        row.spacing = 14
        return row
    }

    private func setStatus(_ field: NSTextField?, ok: Bool, text: String) {
        field?.stringValue = "\(ok ? "●" : "⚠")  \(text)"
        field?.textColor = ok ? .systemGreen : .systemOrange
    }

    @objc private func requestReminders() {
        store.requestFullAccessToReminders { [weak self] granted, error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.refresh()
                if !granted {
                    let detail = error?.localizedDescription ??
                        "Open System Settings → Privacy & Security → Reminders and allow Reminderz Connector."
                    self.showAlert("Reminders access was not granted", detail)
                }
            }
        }
    }

    @objc private func startPrivateSync() {
        let result = Self.runTailscale(["serve", "--bg", "--yes", "--https=\(servePort)",
                                        "http://127.0.0.1:\(localPort.rawValue)"])
        if result.status != 0 { showAlert("Tailscale could not start private sync", result.output) }
        refresh()
    }

    @objc private func stopPrivateSync() {
        let alert = NSAlert()
        alert.messageText = "Stop private Reminderz sync?"
        alert.informativeText = "This removes only the Reminderz HTTPS route on port \(servePort). Other Tailscale Serve routes stay unchanged."
        alert.addButton(withTitle: "Stop Sync")
        alert.addButton(withTitle: "Cancel")
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        let result = Self.runTailscale(["serve", "--yes", "--https=\(servePort)", "off"])
        if result.status != 0 { showAlert("Tailscale could not stop private sync", result.output) }
        refresh()
    }

    @objc private func toggleStartAtLogin() {
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            showAlert("Start at Login could not change", error.localizedDescription)
        }
        refresh()
        if SMAppService.mainApp.status == .requiresApproval {
            showAlert("Approve Reminderz in Login Items",
                      "Open System Settings → General → Login Items, then allow Reminderz Connector.")
        }
    }

    @objc private func connectPhone() {
        guard !serviceStopped && !serviceBusy else {
            showAlert("Start the service first", "Choose Start Service, then connect your phone.")
            return
        }
        guard !token.isEmpty else {
            showAlert("Connector token is still locked", "Approve the macOS Keychain prompt, then try again.")
            return
        }
        guard let origin = Self.privateOrigin() else {
            showAlert("Private sync is not ready", "Choose Start Private Sync first, then make sure Tailscale is connected.")
            return
        }
        guard let pairingURL = server?.makePairingURL(origin: origin),
              let qrImage = Self.qrImage(for: pairingURL.absoluteString) else {
            showAlert("Could not create a pairing code", "Choose Connect Phone again.")
            return
        }
        let payload = ["gatewayURL": origin, "gatewayToken": token]
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let text = String(data: data, encoding: .utf8) else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        showPairingAlert(qrImage: qrImage)
    }

    @objc private func refreshAction() { refresh() }

    private func refresh() {
        let allowed = EKEventStore.authorizationStatus(for: .reminder) == .fullAccess
        setStatus(reminderStatus, ok: allowed,
                  text: allowed ? "Reminders access: Allowed" : "Reminders access: Select Allow Reminders")
        let local = !token.isEmpty && Self.localHealth(token: token)
        setStatus(connectorStatus, ok: local, text: local ? "Mac service: Running" : serviceStopped ? "Mac service: Stopped — select Start Service" : "Mac service: Not reachable")
        updateServiceButtons()
        let origin = Self.privateOrigin()
        setStatus(privateStatus, ok: origin != nil,
                  text: origin.map { "Private sync: \($0)" } ?? "Private sync: Select Start Private Sync")
        let loginEnabled = SMAppService.mainApp.status == .enabled
        setStatus(loginStatus, ok: loginEnabled,
                  text: loginEnabled ? "Start at login: Enabled" : "Start at login: Optional")
        loginButton?.title = loginEnabled ? "Stop Starting at Login" : "Start at Login"
        let ready = allowed && local && origin != nil
        summary.stringValue = ready ? "Sync is running — you can close this window" : serviceStopped ? "Sync is paused — select Start Service" : "Finish the highlighted setup steps"
        summary.textColor = ready ? .systemGreen : .labelColor
    }

    private func showAlert(_ title: String, _ message: String) {
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.runModal()
    }

    private func showPairingAlert(qrImage: NSImage) {
        let imageView = NSImageView(frame: NSRect(x: 0, y: 0, width: 248, height: 248))
        imageView.image = qrImage
        imageView.imageScaling = .scaleProportionallyUpOrDown
        let alert = NSAlert()
        alert.messageText = "Scan with your iPhone"
        alert.informativeText = "Open Camera and scan this one-time code within 10 minutes. On the page, copy the pairing details, then paste them into Pebble → Reminderz → Settings.\n\nA Mac-only clipboard copy is also available as a backup."
        alert.accessoryView = imageView
        alert.addButton(withTitle: "Done")
        alert.runModal()
    }

    private static func qrImage(for value: String) -> NSImage? {
        guard let filter = CIFilter(name: "CIQRCodeGenerator") else { return nil }
        filter.setValue(Data(value.utf8), forKey: "inputMessage")
        filter.setValue("Q", forKey: "inputCorrectionLevel")
        guard let output = filter.outputImage?.transformed(by: CGAffineTransform(scaleX: 10, y: 10)) else {
            return nil
        }
        let context = CIContext(options: [.useSoftwareRenderer: false])
        guard let cgImage = context.createCGImage(output, from: output.extent) else { return nil }
        return NSImage(cgImage: cgImage, size: NSSize(width: 248, height: 248))
    }

    private static func tailscalePath() -> String? {
        ["/Applications/Tailscale.app/Contents/MacOS/Tailscale", "/opt/homebrew/bin/tailscale",
         "/usr/local/bin/tailscale"].first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    private static func runTailscale(_ arguments: [String]) -> (status: Int32, output: String) {
        guard let executable = tailscalePath() else { return (-1, "Install and sign in to Tailscale first.") }
        let process = Process(), pipe = Pipe()
        process.executableURL = URL(fileURLWithPath: executable)
        process.arguments = arguments
        process.standardOutput = pipe
        process.standardError = pipe
        var environment = ProcessInfo.processInfo.environment
        if environment["TERM"] == nil { environment["TERM"] = "dumb" }
        process.environment = environment
        do { try process.run(); process.waitUntilExit() } catch { return (-1, error.localizedDescription) }
        let output = String(decoding: pipe.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
        return (process.terminationStatus, output.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    private static func privateOrigin() -> String? {
        let result = runTailscale(["serve", "status", "--json"])
        guard result.status == 0, let data = result.output.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let web = object["Web"] as? [String: Any] else { return nil }
        for (host, rawConfig) in web {
            guard host.hasSuffix(":\(servePort)"),
                  let config = rawConfig as? [String: Any],
                  let handlers = config["Handlers"] as? [String: Any] else { continue }
            for (_, rawHandler) in handlers {
                guard let handler = rawHandler as? [String: Any],
                      let proxy = handler["Proxy"] as? String,
                      proxy.contains("127.0.0.1:\(localPort.rawValue)") else { continue }
                return "https://\(host)"
            }
        }
        return nil
    }

    private static func localHealth(token: String) -> Bool {
        guard let url = URL(string: "http://127.0.0.1:\(localPort.rawValue)/v1/health") else { return false }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let semaphore = DispatchSemaphore(value: 0)
        var ok = false
        URLSession.shared.dataTask(with: request) { _, response, _ in
            ok = (response as? HTTPURLResponse)?.statusCode == 200
            semaphore.signal()
        }.resume()
        _ = semaphore.wait(timeout: .now() + 1)
        return ok
    }
}

private enum TokenStore {
    private static let service = "org.reminderz.connector.credentials"
    private static let account = "gateway-token"

    static func token() -> String {
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                    kSecAttrService as String: service,
                                    kSecAttrAccount as String: account,
                                    kSecReturnData as String: true]
        var item: CFTypeRef?
        if SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
           let data = item as? Data, let value = String(data: data, encoding: .utf8) { return value }
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        let value = Data(bytes).base64EncodedString()
        let add: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                  kSecAttrService as String: service,
                                  kSecAttrAccount as String: account,
                                  kSecValueData as String: Data(value.utf8)]
        SecItemAdd(add as CFDictionary, nil)
        return value
    }
}

private let application = NSApplication.shared
private let delegate = AppDelegate()
application.delegate = delegate
application.run()

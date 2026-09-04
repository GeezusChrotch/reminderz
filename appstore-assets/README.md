# Store artwork

- `reminderz-icon-master.png` — 1254×1254 transparent generated master
- `reminderz-icon.png` — 512×512 general-purpose master
- `reminderz-icon-large.png` — 144×144 Rebble large icon
- `reminderz-icon-small.png` — 80×80 Rebble small icon
- `reminderz-menu-icon.png` — 25×25 watch launcher copy
- `reminderz-marketing-banner.png` — 720×320 final banner with exact composited text
- `reminderz-banner-art-master.png` — generated banner artwork before final crop and text
- `screenshots/basalt/basalt_01_lists.png` — privacy-safe Basalt list preview
- `screenshots/basalt/basalt_02_checkboxes.png` — privacy-safe Basalt checkbox preview
- `screenshots/emery/emery_01_lists.png` — privacy-safe Emery list preview
- `screenshots/emery/emery_02_checkboxes.png` — privacy-safe Emery checkbox preview

The banner's exact text is: “Reminderz” and “Apple Reminders, right on your wrist.” Keep important
art away from the bottom center, where appstore page indicators may appear.

The icon and banner artwork were created with the built-in OpenAI image-generation tool. Final prompt
specs are recorded below so the visual family can be reproduced without relying on hidden state.

## Icon prompt

```text
Use case: logo-brand
Asset type: master app icon artwork for a Pebble reminder-list watch app
Primary request: Create a polished, instantly recognizable square app icon showing a simple rounded checklist card with three horizontal list lines and one bold checked checkbox, subtly shaped like a friendly classic smartwatch screen without copying any branded hardware.
Scene/backdrop: centered isolated icon, genuinely transparent background outside the icon silhouette
Style/medium: crisp flat vector-like raster illustration, premium indie app identity, bold geometric shapes, strong silhouette, minimal detail that remains legible at 25x25 pixels
Composition/framing: centered, symmetrical, generous safe margin, no cropping
Color palette: warm amber and coral highlights, deep midnight navy outlines, small cream accents
Lighting/mood: bright, capable, friendly, organized
Constraints: no words, no letters, no numbers, no logos, no trademarked Apple Reminders icon, no Pebble or Tailscale branding, no photorealism, actual transparent background, no shadow outside the icon silhouette, no watermark
Avoid: tiny details, gradients that become muddy when downscaled, red notification badges, generic calendar imagery
```

## Banner prompt

```text
Use case: ads-marketing
Asset type: Pebble appstore marketing banner background, final crop 720 by 320 pixels
Primary request: Create a polished wide hero illustration for a reminder-list smartwatch app. On the right third, show a friendly classic rectangular smartwatch with an amber/coral strap and deep navy case; its screen shows three clean checklist rows with one checked box. Across the deep navy background, add a few subtle floating rounded checkbox and list-line motifs that lead the eye toward the watch.
Scene/backdrop: wide deep midnight navy field with soft amber-to-coral glow and subtle layered geometric shapes
Style/medium: crisp premium vector-like raster illustration, modern indie software branding, playful but professional
Composition/framing: very wide horizontal composition; reserve the entire left half as calm negative space for later title and headline; keep the watch entirely within the right 40 percent; generous safe margins; important elements away from bottom-center page indicator area
Lighting/mood: optimistic, capable, organized
Color palette: deep midnight navy, warm amber, vivid coral, cream and restrained slate blue
Constraints: no text, no words, no letters, no numbers, no logos, no trademarks, no Apple Reminders icon, no Tailscale or Pebble branding, no watermark
Avoid: photorealism, clutter, tiny detail, purple-dominant palette, calendar pages, notification badges
```

Final banner typography was composited deterministically after generation.

Store screenshots are native-resolution, unframed captures from the running app and contain only
invented reminder data. Two representative screenshots are included for each supported platform;
the additional ideas in `APPSTORE_LISTING.md` can be added in a future listing update.

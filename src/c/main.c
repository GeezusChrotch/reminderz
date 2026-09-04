#include <pebble.h>

#define MAX_LISTS 30
#define MAX_REMINDERS 50
#define MAX_TITLE 96
#define MAX_LIST_ID 128
#define MAX_DICTATION 192
#define MARQUEE_STEP_PIXELS 2
#define MARQUEE_FRAME_MS 80
#define MARQUEE_PAUSE_MS 900

enum {
  COMMAND_LOAD_LISTS = 1,
  COMMAND_LOAD_REMINDERS = 2,
  COMMAND_TOGGLE_REMINDER = 3,
  COMMAND_CREATE_REMINDER = 4,
  COMMAND_TOGGLE_PIN = 5,
  COMMAND_DELETE_REMINDER = 6
};

enum { ITEM_KIND_LIST = 1, ITEM_KIND_REMINDER = 2 };
enum {
  PERSIST_THEME_BACKGROUND = 20,
  PERSIST_THEME_TEXT,
  PERSIST_THEME_SELECTION,
  PERSIST_THEME_SELECTION_TEXT,
  PERSIST_THEME_FONT,
  PERSIST_THEME_SIZE
};

typedef struct {
  char title[MAX_TITLE];
  char id[MAX_LIST_ID];
  bool pinned;
  uint16_t open_count;
  uint16_t completed_count;
} ReminderList;

typedef struct {
  char title[MAX_TITLE];
  char id[MAX_LIST_ID];
  bool completed;
} ReminderItem;

static Window *s_lists_window;
static Window *s_reminders_window;
static MenuLayer *s_lists_menu;
static MenuLayer *s_reminders_menu;
static Window *s_delete_window;
static MenuLayer *s_delete_menu;
static char s_delete_id[MAX_LIST_ID];
static char s_delete_title[MAX_TITLE];
static uint32_t s_buttons_lists = 1 | (5 << 3) | (3 << 6) | (4 << 9) | (2 << 12);
static uint32_t s_buttons_reminders = 1 | (5 << 3) | (6 << 6) | (4 << 9) | (2 << 12) | (7 << 15);
static ReminderList s_lists[MAX_LISTS];
static ReminderItem s_reminders[MAX_REMINDERS];
static uint16_t s_list_count;
static uint16_t s_reminder_count;
static uint16_t s_selected_list;
static bool s_loading_lists = true;
static bool s_loading_reminders;
static bool s_reminders_error;
static bool s_lists_has_appeared;
static char s_list_focus_id[MAX_LIST_ID];
static char s_status[64] = "Connecting to Mac…";
static char s_dictation_text[MAX_DICTATION];
static DictationSession *s_dictation;
static AppTimer *s_marquee_timer;
static int16_t s_marquee_offset;
static int16_t s_marquee_max;
static bool s_marquee_at_end;

static GColor s_theme_background = GColorWhite;
static GColor s_theme_text = GColorBlack;
static GColor s_theme_selection = GColorBlack;
static GColor s_theme_selection_text = GColorWhite;
static uint8_t s_theme_font;
static uint8_t s_theme_size = 24;
#if defined(PBL_PLATFORM_EMERY)
static GFont s_custom_font;
static uint8_t s_custom_font_id = 255;
static uint8_t s_custom_font_size;
#endif

static bool send_command(uint8_t command, int32_t index, const char *voice_text) {
  DictionaryIterator *iterator;
  AppMessageResult result = app_message_outbox_begin(&iterator);
  if (result != APP_MSG_OK || !iterator) {
    snprintf(s_status, sizeof(s_status), "Phone unavailable");
    vibes_double_pulse();
    return false;
  }
  dict_write_uint8(iterator, MESSAGE_KEY_COMMAND, command);
  if (index >= 0) dict_write_int32(iterator, MESSAGE_KEY_ITEM_INDEX, index);
  if (command == COMMAND_TOGGLE_REMINDER && index >= 0 && index < s_reminder_count)
    dict_write_cstring(iterator, MESSAGE_KEY_ITEM_ID, s_reminders[index].id);
  if (index >= 0 && index < s_list_count &&
      (command == COMMAND_LOAD_REMINDERS || command == COMMAND_CREATE_REMINDER || command == COMMAND_TOGGLE_PIN)) {
    dict_write_cstring(iterator, MESSAGE_KEY_ITEM_ID, s_lists[index].id);
  }
  if (voice_text) dict_write_cstring(iterator, MESSAGE_KEY_VOICE_TEXT, voice_text);
  dict_write_end(iterator);
  return app_message_outbox_send() == APP_MSG_OK;
}

#if defined(PBL_PLATFORM_EMERY)
static void unload_custom_font(void) {
  if (s_custom_font) fonts_unload_custom_font(s_custom_font);
  s_custom_font = NULL;
  s_custom_font_id = 255;
  s_custom_font_size = 0;
}

static uint8_t custom_size_index(void) {
  if (s_theme_size <= 14) return 0;
  if (s_theme_size <= 18) return 1;
  if (s_theme_size <= 22) return 2;
  if (s_theme_size <= 26) return 3;
  return 4;
}

static GFont time2_font(void) {
  static const uint32_t resources[5][5] = {
    {RESOURCE_ID_INTER_14, RESOURCE_ID_INTER_18, RESOURCE_ID_INTER_22,
     RESOURCE_ID_INTER_26, RESOURCE_ID_INTER_30},
    {RESOURCE_ID_ROBOTO_14, RESOURCE_ID_ROBOTO_18, RESOURCE_ID_ROBOTO_22,
     RESOURCE_ID_ROBOTO_26, RESOURCE_ID_ROBOTO_30},
    {RESOURCE_ID_OPEN_SANS_14, RESOURCE_ID_OPEN_SANS_18, RESOURCE_ID_OPEN_SANS_22,
     RESOURCE_ID_OPEN_SANS_26, RESOURCE_ID_OPEN_SANS_30},
    {RESOURCE_ID_MONTSERRAT_14, RESOURCE_ID_MONTSERRAT_18, RESOURCE_ID_MONTSERRAT_22,
     RESOURCE_ID_MONTSERRAT_26, RESOURCE_ID_MONTSERRAT_30},
    {RESOURCE_ID_POPPINS_14, RESOURCE_ID_POPPINS_18, RESOURCE_ID_POPPINS_22,
     RESOURCE_ID_POPPINS_26, RESOURCE_ID_POPPINS_30}
  };
  uint8_t family = s_theme_font - 5;
  uint8_t size_index = custom_size_index();
  uint8_t actual_size = (uint8_t[]){14, 18, 22, 26, 30}[size_index];
  if (s_custom_font && s_custom_font_id == s_theme_font &&
      s_custom_font_size == actual_size) return s_custom_font;
  unload_custom_font();
  s_custom_font = fonts_load_custom_font(resource_get_handle(resources[family][size_index]));
  s_custom_font_id = s_theme_font;
  s_custom_font_size = actual_size;
  return s_custom_font ? s_custom_font : fonts_get_system_font(FONT_KEY_GOTHIC_24);
}
#endif

static GFont theme_font(void) {
#if defined(PBL_PLATFORM_EMERY)
  if (s_theme_font >= 5 && s_theme_font <= 9) return time2_font();
  unload_custom_font();
#endif
  if (s_theme_font == 2) return fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21);
  if (s_theme_font == 3) return fonts_get_system_font(FONT_KEY_DROID_SERIF_28_BOLD);
  if (s_theme_font == 4) return fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
  if (s_theme_font == 1) {
    if (s_theme_size <= 14) return fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
    if (s_theme_size <= 18) return fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
    if (s_theme_size >= 28) return fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
    return fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);
  }
  if (s_theme_size <= 14) return fonts_get_system_font(FONT_KEY_GOTHIC_14);
  if (s_theme_size <= 18) return fonts_get_system_font(FONT_KEY_GOTHIC_18);
  if (s_theme_size >= 28) return fonts_get_system_font(FONT_KEY_GOTHIC_28);
  return fonts_get_system_font(FONT_KEY_GOTHIC_24);
}

static int16_t row_height(void) {
  if (s_theme_size <= 14) return 32;
  if (s_theme_size <= 18) return 38;
  if (s_theme_size <= 21) return 42;
  if (s_theme_size <= 24) return 46;
  if (s_theme_size <= 28) return 52;
  return 56;
}

static MenuLayer *active_menu(void) {
  Window *top = window_stack_get_top_window();
  if (top == s_lists_window) return s_lists_menu;
  if (top == s_reminders_window) return s_reminders_menu;
  return NULL;
}

static void marquee_tick(void *context);

static void marquee_schedule(uint32_t delay_ms) {
  if (s_marquee_timer) app_timer_cancel(s_marquee_timer);
  s_marquee_timer = app_timer_register(delay_ms, marquee_tick, NULL);
}

static void marquee_reset(void) {
  s_marquee_offset = 0;
  s_marquee_max = 0;
  s_marquee_at_end = false;
  MenuLayer *menu = active_menu();
  if (menu) layer_mark_dirty(menu_layer_get_layer(menu));
  marquee_schedule(MARQUEE_PAUSE_MS);
}

static void marquee_tick(void *context) {
  s_marquee_timer = NULL;
  MenuLayer *menu = active_menu();
  if (!menu || s_marquee_max <= 0) return;
  if (s_marquee_at_end) {
    s_marquee_offset = 0;
    s_marquee_at_end = false;
    layer_mark_dirty(menu_layer_get_layer(menu));
    marquee_schedule(MARQUEE_PAUSE_MS);
    return;
  }
  s_marquee_offset += MARQUEE_STEP_PIXELS;
  if (s_marquee_offset >= s_marquee_max) {
    s_marquee_offset = s_marquee_max;
    s_marquee_at_end = true;
    marquee_schedule(MARQUEE_PAUSE_MS);
  } else {
    marquee_schedule(MARQUEE_FRAME_MS);
  }
  layer_mark_dirty(menu_layer_get_layer(menu));
}

static void marquee_selection_changed(MenuLayer *menu_layer, MenuIndex new_index,
                                      MenuIndex old_index, void *context) {
  marquee_reset();
}

static void menu_window_appear(Window *window) {
  marquee_reset();
}

static void lists_window_appear(Window *window) {
  marquee_reset();
  if (s_lists_has_appeared) send_command(COMMAND_LOAD_LISTS, -1, NULL);
  s_lists_has_appeared = true;
}

static void draw_row_title(GContext *ctx, const char *title, GFont font,
                           int16_t x, int16_t y, int16_t width, int16_t height,
                           bool highlighted) {
  if (!highlighted) {
    graphics_draw_text(ctx, title, font, GRect(x, y, width, height),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
    return;
  }
  GSize content = graphics_text_layout_get_content_size(
      title, font, GRect(0, 0, 1000, height), GTextOverflowModeFill, GTextAlignmentLeft);
  s_marquee_max = content.w > width ? content.w - width + 6 : 0;
  if (s_marquee_max <= 0) {
    s_marquee_offset = 0;
    s_marquee_at_end = false;
    graphics_draw_text(ctx, title, font, GRect(x, y, width, height),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
    return;
  }
  if (!s_marquee_timer) marquee_schedule(MARQUEE_PAUSE_MS);
  graphics_draw_text(ctx, title, font,
                     GRect(x - s_marquee_offset, y, content.w + 4, height),
                     GTextOverflowModeFill, GTextAlignmentLeft, NULL);
}

static void draw_row(GContext *ctx, const Layer *cell_layer, const char *title,
                     const char *subtitle) {
  GRect bounds = layer_get_bounds(cell_layer);
  bool highlighted = menu_cell_layer_is_highlighted(cell_layer);
  graphics_context_set_text_color(ctx, highlighted ? s_theme_selection_text : s_theme_text);
  int16_t title_y = subtitle ? -5 : (bounds.size.h - (s_theme_size + 8)) / 2 - 1;
  draw_row_title(ctx, title, theme_font(), 6, title_y, bounds.size.w - 12,
                 s_theme_size + 10, highlighted);
  if (subtitle) {
    graphics_draw_text(ctx, subtitle, fonts_get_system_font(FONT_KEY_GOTHIC_14),
                       GRect(6, s_theme_size + 1, bounds.size.w - 12, 20),
                       GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  }
}

static void draw_checkbox_row(GContext *ctx, const Layer *cell_layer, const char *title,
                              bool completed) {
  GRect bounds = layer_get_bounds(cell_layer);
  bool highlighted = menu_cell_layer_is_highlighted(cell_layer);
  GColor ink = highlighted ? s_theme_selection_text : s_theme_text;
  int16_t box_size = 16;
  int16_t box_y = (bounds.size.h - box_size) / 2;
  GRect box = GRect(7, box_y, box_size, box_size);
  graphics_context_set_text_color(ctx, ink);
  int16_t title_y = (bounds.size.h - (s_theme_size + 8)) / 2 - 1;
  draw_row_title(ctx, title, theme_font(), 30, title_y, bounds.size.w - 35,
                 s_theme_size + 10, highlighted);
  graphics_context_set_fill_color(ctx, highlighted ? s_theme_selection : s_theme_background);
  graphics_fill_rect(ctx, GRect(0, 0, 29, bounds.size.h), 0, GCornerNone);
  graphics_context_set_stroke_color(ctx, ink);
  graphics_context_set_fill_color(ctx, ink);
  graphics_context_set_stroke_width(ctx, 2);
  graphics_draw_rect(ctx, box);
  if (completed) {
    graphics_draw_line(ctx, GPoint(10, box_y + 8), GPoint(14, box_y + 12));
    graphics_draw_line(ctx, GPoint(14, box_y + 12), GPoint(21, box_y + 4));
  }
}

static void draw_header(GContext *ctx, const Layer *cell_layer, const char *title) {
  GRect bounds = layer_get_bounds(cell_layer);
  graphics_context_set_fill_color(ctx, s_theme_selection);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
  graphics_context_set_text_color(ctx, s_theme_selection_text);
  graphics_draw_text(ctx, title, fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD),
                     GRect(6, -2, bounds.size.w - 12, bounds.size.h + 2),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
}

static uint16_t one_section(MenuLayer *menu_layer, void *context) { return 1; }
static int16_t header_height(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  return 22;
}
static int16_t cell_height(MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  return row_height();
}

static uint16_t lists_rows(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  return s_list_count ? s_list_count : 1;
}

static void lists_header(GContext *ctx, const Layer *cell_layer, uint16_t section_index,
                         void *context) {
  draw_header(ctx, cell_layer, "Reminderz");
}

static void lists_row(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index,
                      void *context) {
  if (!s_list_count) {
    draw_row(ctx, cell_layer, s_loading_lists ? "Syncing…" : s_status, NULL);
    return;
  }
  char subtitle[40];
  uint16_t open = s_lists[cell_index->row].open_count;
  uint16_t done = s_lists[cell_index->row].completed_count;
  snprintf(subtitle, sizeof(subtitle), "%s%u open · %u done",
           s_lists[cell_index->row].pinned ? "PIN · " : "", open, done);
  draw_row(ctx, cell_layer, s_lists[cell_index->row].title, subtitle);
}

static void load_selected_list(void) {
  s_reminder_count = 0;
  s_loading_reminders = true;
  s_reminders_error = false;
  snprintf(s_status, sizeof(s_status), "Loading…");
  window_stack_push(s_reminders_window, true);
  send_command(COMMAND_LOAD_REMINDERS, s_selected_list, NULL);
}

static void lists_select(MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  if (s_loading_lists) return;
  if (!s_list_count || cell_index->row >= s_list_count) {
    s_loading_lists = true;
    snprintf(s_status, sizeof(s_status), "Connecting to Mac…");
    menu_layer_reload_data(s_lists_menu);
    send_command(COMMAND_LOAD_LISTS, -1, NULL);
    return;
  }
  s_selected_list = cell_index->row;
  load_selected_list();
}

static void lists_long_select(MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  if (s_loading_lists || cell_index->row >= s_list_count) return;
  if (send_command(COMMAND_TOGGLE_PIN, cell_index->row, NULL)) {
    s_loading_lists = true;
    vibes_short_pulse();
  }
}

static uint16_t reminders_rows(MenuLayer *menu_layer, uint16_t section_index, void *context) {
  if (s_loading_reminders || (s_reminders_error && !s_reminder_count)) return 1;
  return s_reminder_count + 1;
}

static void reminders_header(GContext *ctx, const Layer *cell_layer, uint16_t section_index,
                             void *context) {
  draw_header(ctx, cell_layer, s_lists[s_selected_list].title);
}

static void reminders_row(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index,
                          void *context) {
  if (s_reminders_error && !s_reminder_count) {
    draw_row(ctx, cell_layer, s_status, "Select to retry");
  } else if (s_loading_reminders) {
    draw_row(ctx, cell_layer, s_status, NULL);
  } else if (cell_index->row == s_reminder_count) {
    draw_row(ctx, cell_layer, "+ Add reminder", "Dictate a new item");
  } else {
    draw_checkbox_row(ctx, cell_layer, s_reminders[cell_index->row].title,
                      s_reminders[cell_index->row].completed);
  }
}

static void dictation_callback(DictationSession *session, DictationSessionStatus status,
                               char *transcription, void *context) {
  if (status != DictationSessionStatusSuccess || !transcription || !transcription[0]) return;
  snprintf(s_dictation_text, sizeof(s_dictation_text), "%s", transcription);
  snprintf(s_status, sizeof(s_status), "Adding…");
  s_loading_reminders = true;
  menu_layer_reload_data(s_reminders_menu);
  send_command(COMMAND_CREATE_REMINDER, s_selected_list, s_dictation_text);
}

static void reminders_select(MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  if (s_loading_reminders) return;
  if (s_reminders_error && !s_reminder_count) {
    s_reminders_error = false;
    s_loading_reminders = true;
    snprintf(s_status, sizeof(s_status), "Loading…");
    menu_layer_reload_data(s_reminders_menu);
    send_command(COMMAND_LOAD_REMINDERS, s_selected_list, NULL);
    return;
  }
  if (cell_index->row == s_reminder_count) {
    if (!s_dictation) {
      snprintf(s_status, sizeof(s_status), "Dictation unavailable");
      vibes_double_pulse();
      return;
    }
    dictation_session_start(s_dictation);
    return;
  }
  if (cell_index->row >= s_reminder_count) return;
  uint16_t toggled = cell_index->row;
  s_loading_reminders = true;
  snprintf(s_status, sizeof(s_status), s_reminders[toggled].completed ? "Reopening…" : "Completing…");
  menu_layer_reload_data(s_reminders_menu);
  vibes_short_pulse();
  send_command(COMMAND_TOGGLE_REMINDER, toggled, NULL);
}

static uint16_t delete_rows(MenuLayer *menu, uint16_t section, void *context) { return 2; }
static int16_t delete_header_height(MenuLayer *menu, uint16_t section, void *context) { return 86; }
static int16_t delete_row_height(MenuLayer *menu, MenuIndex *index, void *context) { return 32; }
static void delete_header(GContext *ctx, const Layer *layer, uint16_t section, void *context) {
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_text_color(ctx, s_theme_text);
  graphics_draw_text(ctx, "Delete reminder?", fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
                     GRect(5, 0, bounds.size.w-10, 25), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  graphics_draw_text(ctx, s_delete_title, fonts_get_system_font(FONT_KEY_GOTHIC_14),
                     GRect(5, 26, bounds.size.w-10, 58), GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
}
static void delete_row(GContext *ctx, const Layer *layer, MenuIndex *index, void *context) {
  menu_cell_basic_draw(ctx, layer, index->row ? "Delete" : "Cancel", NULL, NULL);
}
static void delete_select(MenuLayer *menu, MenuIndex *index, void *context) {
  if (index->row == 1 && s_delete_id[0]) {
    DictionaryIterator *iterator;
    if (app_message_outbox_begin(&iterator) != APP_MSG_OK || !iterator) return;
    dict_write_uint8(iterator, MESSAGE_KEY_COMMAND, COMMAND_DELETE_REMINDER);
    dict_write_cstring(iterator, MESSAGE_KEY_ITEM_ID, s_delete_id);
    dict_write_uint8(iterator, MESSAGE_KEY_CONFIRMED, 1);
    dict_write_end(iterator);
    if (app_message_outbox_send() != APP_MSG_OK) return;
    s_loading_reminders = true;
    snprintf(s_status, sizeof(s_status), "Deleting…");
    menu_layer_reload_data(s_reminders_menu);
  }
  s_delete_id[0] = '\0';
  window_stack_pop(true);
}
static void delete_window_load(Window *window) {
  Layer *root = window_get_root_layer(window);
  s_delete_menu = menu_layer_create(layer_get_bounds(root));
  menu_layer_set_callbacks(s_delete_menu, NULL, (MenuLayerCallbacks){
    .get_num_sections=one_section, .get_num_rows=delete_rows,
    .get_header_height=delete_header_height, .get_cell_height=delete_row_height,
    .draw_header=delete_header, .draw_row=delete_row, .select_click=delete_select
  });
  menu_layer_set_normal_colors(s_delete_menu, s_theme_background, s_theme_text);
  menu_layer_set_highlight_colors(s_delete_menu, s_theme_selection, s_theme_selection_text);
  menu_layer_set_click_config_onto_window(s_delete_menu, window);
  layer_add_child(root, menu_layer_get_layer(s_delete_menu));
}
static void delete_window_unload(Window *window) {
  menu_layer_destroy(s_delete_menu); s_delete_menu = NULL; s_delete_id[0] = '\0';
}

static void button_action(MenuLayer *menu, uint8_t action) {
  bool lists_screen = menu == s_lists_menu;
  MenuIndex index = menu_layer_get_selected_index(menu);
  if (action == 1 || action == 2) {
    menu_layer_set_selected_next(menu, action == 1, MenuRowAlignCenter, true); return;
  }
  if ((lists_screen && s_loading_lists) || (!lists_screen && s_loading_reminders)) return;
  if (action == 3 && lists_screen) { lists_select(menu, &index, NULL); return; }
  if (action == 6 && !lists_screen) { reminders_select(menu, &index, NULL); return; }
  if (action == 4) {
    if (lists_screen) lists_long_select(menu, &index, NULL);
    else if (s_selected_list < s_list_count) send_command(COMMAND_TOGGLE_PIN, s_selected_list, NULL);
  } else if (action == 5) {
    if (!s_dictation || !s_list_count) return;
    if (lists_screen) {
      if (index.row >= s_list_count) return;
      s_selected_list = index.row;
      load_selected_list();
    }
    dictation_session_start(s_dictation);
  } else if (action == 7 && !lists_screen && index.row < s_reminder_count) {
    snprintf(s_delete_id, sizeof(s_delete_id), "%s", s_reminders[index.row].id);
    snprintf(s_delete_title, sizeof(s_delete_title), "%s", s_reminders[index.row].title);
    window_stack_push(s_delete_window, true);
    menu_layer_set_selected_index(s_delete_menu, (MenuIndex){.section=0,.row=0}, MenuRowAlignTop, false);
  }
}
static void handle_button(ClickRecognizerRef recognizer, void *context, bool long_press) {
  ButtonId button = click_recognizer_get_button_id(recognizer);
  uint8_t index = (button == BUTTON_ID_UP ? 0 : button == BUTTON_ID_SELECT ? 2 : 4) + (long_press ? 1 : 0);
  uint32_t actions = context == s_lists_menu ? s_buttons_lists : s_buttons_reminders;
  button_action((MenuLayer *)context, (actions >> (index * 3)) & 7);
}
static void short_button(ClickRecognizerRef recognizer, void *context) { handle_button(recognizer, context, false); }
static void long_button(ClickRecognizerRef recognizer, void *context) { handle_button(recognizer, context, true); }
static void button_config(void *context) {
  for (ButtonId button = BUTTON_ID_UP; button <= BUTTON_ID_DOWN; button++) {
    window_single_click_subscribe(button, short_button);
    window_long_click_subscribe(button, 600, long_button, NULL);
  }
}

static void apply_theme(void) {
  Window *windows[] = {s_lists_window, s_reminders_window};
  MenuLayer *menus[] = {s_lists_menu, s_reminders_menu};
  for (size_t i = 0; i < ARRAY_LENGTH(windows); i++) {
    if (windows[i]) window_set_background_color(windows[i], s_theme_background);
  }
  for (size_t i = 0; i < ARRAY_LENGTH(menus); i++) {
    if (!menus[i]) continue;
    menu_layer_set_normal_colors(menus[i], s_theme_background, s_theme_text);
    menu_layer_set_highlight_colors(menus[i], s_theme_selection, s_theme_selection_text);
    menu_layer_reload_data(menus[i]);
  }
}

static void receive_theme(DictionaryIterator *iterator) {
  Tuple *tuple;
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_BACKGROUND))) {
    s_theme_background.argb = tuple->value->uint8;
    persist_write_int(PERSIST_THEME_BACKGROUND, s_theme_background.argb);
  }
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_TEXT))) {
    s_theme_text.argb = tuple->value->uint8;
    persist_write_int(PERSIST_THEME_TEXT, s_theme_text.argb);
  }
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_SELECTION))) {
    s_theme_selection.argb = tuple->value->uint8;
    persist_write_int(PERSIST_THEME_SELECTION, s_theme_selection.argb);
  }
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_SELECTION_TEXT))) {
    s_theme_selection_text.argb = tuple->value->uint8;
    persist_write_int(PERSIST_THEME_SELECTION_TEXT, s_theme_selection_text.argb);
  }
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_FONT))) {
    s_theme_font = (uint8_t)tuple->value->int32;
    persist_write_int(PERSIST_THEME_FONT, s_theme_font);
  }
  if ((tuple = dict_find(iterator, MESSAGE_KEY_THEME_SIZE))) {
    s_theme_size = tuple->value->uint8;
    persist_write_int(PERSIST_THEME_SIZE, s_theme_size);
  }
  apply_theme();
}

static void inbox_received(DictionaryIterator *iterator, void *context) {
  receive_theme(iterator);
  Tuple *buttons = dict_find(iterator, MESSAGE_KEY_BUTTONS_LISTS);
  if (buttons) { s_buttons_lists = buttons->value->uint32; persist_write_int(30, s_buttons_lists); }
  buttons = dict_find(iterator, MESSAGE_KEY_BUTTONS_REMINDERS);
  if (buttons) { s_buttons_reminders = buttons->value->uint32; persist_write_int(31, s_buttons_reminders); }
  Tuple *status = dict_find(iterator, MESSAGE_KEY_STATUS);
  if (status && status->value->int32 == 2) {
    Tuple *id = dict_find(iterator, MESSAGE_KEY_ITEM_ID), *pin = dict_find(iterator, MESSAGE_KEY_ITEM_PINNED);
    for (uint16_t row = 0; id && pin && row < s_list_count; row++)
      if (strcmp(s_lists[row].id, id->value->cstring) == 0) s_lists[row].pinned = pin->value->int32 != 0;
  }
  if (status && status->value->int32 == 1) {
    MenuIndex selected = menu_layer_get_selected_index(s_lists_menu);
    snprintf(s_list_focus_id, sizeof(s_list_focus_id), "%s",
             selected.row < s_list_count ? s_lists[selected.row].id : "");
    s_loading_lists = true;
  }
  Tuple *error = dict_find(iterator, MESSAGE_KEY_ERROR);
  if (error) {
    snprintf(s_status, sizeof(s_status), "%s", error->value->cstring);
    s_loading_lists = false;
    s_loading_reminders = false;
    s_reminders_error = true;
    if (s_lists_menu) menu_layer_reload_data(s_lists_menu);
    if (s_reminders_menu) menu_layer_reload_data(s_reminders_menu);
    return;
  }
  Tuple *kind_tuple = dict_find(iterator, MESSAGE_KEY_ITEM_KIND);
  Tuple *index_tuple = dict_find(iterator, MESSAGE_KEY_ITEM_INDEX);
  Tuple *title_tuple = dict_find(iterator, MESSAGE_KEY_ITEM_TITLE);
  if (kind_tuple && index_tuple && title_tuple) {
    uint8_t kind = kind_tuple->value->uint8;
    uint16_t index = (uint16_t)index_tuple->value->int32;
    if (kind == ITEM_KIND_LIST && index < MAX_LISTS) {
      Tuple *id = dict_find(iterator, MESSAGE_KEY_ITEM_ID);
      Tuple *pinned = dict_find(iterator, MESSAGE_KEY_ITEM_PINNED);
      snprintf(s_lists[index].id, sizeof(s_lists[index].id), "%s", id ? id->value->cstring : "");
      s_lists[index].pinned = pinned && pinned->value->int32 != 0;
      snprintf(s_lists[index].title, sizeof(s_lists[index].title), "%s", title_tuple->value->cstring);
      Tuple *count = dict_find(iterator, MESSAGE_KEY_ITEM_COUNT);
      Tuple *done = dict_find(iterator, MESSAGE_KEY_ITEM_DONE);
      s_lists[index].open_count = count ? (uint16_t)count->value->int32 : 0;
      s_lists[index].completed_count = done ? (uint16_t)done->value->int32 : 0;
      if (index >= s_list_count) s_list_count = index + 1;
    } else if (kind == ITEM_KIND_REMINDER && index < MAX_REMINDERS) {
      Tuple *id = dict_find(iterator, MESSAGE_KEY_ITEM_ID);
      snprintf(s_reminders[index].id, sizeof(s_reminders[index].id), "%s", id ? id->value->cstring : "");
      snprintf(s_reminders[index].title, sizeof(s_reminders[index].title), "%s",
               title_tuple->value->cstring);
      Tuple *done = dict_find(iterator, MESSAGE_KEY_ITEM_DONE);
      s_reminders[index].completed = done && done->value->int32 != 0;
      if (index >= s_reminder_count) s_reminder_count = index + 1;
    }
  }
  Tuple *done = dict_find(iterator, MESSAGE_KEY_LIST_DONE);
  if (done) {
    Tuple *final_count = dict_find(iterator, MESSAGE_KEY_ITEM_COUNT);
    if (done->value->uint8 == ITEM_KIND_LIST) {
      if (final_count) s_list_count = (uint16_t)final_count->value->int32;
      s_loading_lists = false;
      snprintf(s_status, sizeof(s_status), s_list_count ? "Up to date" : "No reminder lists");
      menu_layer_reload_data(s_lists_menu);
      Tuple *focus = dict_find(iterator, MESSAGE_KEY_ITEM_ID);
      const char *focus_id = focus ? focus->value->cstring : s_list_focus_id;
      for (uint16_t row = 0; row < s_list_count; row++) {
        if (focus_id[0] && strcmp(s_lists[row].id, focus_id) == 0) {
          menu_layer_set_selected_index(s_lists_menu, (MenuIndex){.section=0,.row=row}, MenuRowAlignCenter, false);
          break;
        }
      }
      s_list_focus_id[0] = '\0';
    } else if (done->value->uint8 == ITEM_KIND_REMINDER) {
      if (final_count) s_reminder_count = (uint16_t)final_count->value->int32;
      s_loading_reminders = false;
      s_reminders_error = false;
      snprintf(s_status, sizeof(s_status), "Up to date");
      menu_layer_reload_data(s_reminders_menu);
    }
  }
}

static void outbox_failed(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  snprintf(s_status, sizeof(s_status), "Phone connection failed");
  s_loading_lists = false;
  s_loading_reminders = false;
  vibes_double_pulse();
  if (s_lists_menu) menu_layer_reload_data(s_lists_menu);
  if (s_reminders_menu) menu_layer_reload_data(s_reminders_menu);
}

static void load_saved_theme(void) {
  if (persist_exists(PERSIST_THEME_BACKGROUND))
    s_theme_background.argb = (uint8_t)persist_read_int(PERSIST_THEME_BACKGROUND);
  if (persist_exists(PERSIST_THEME_TEXT))
    s_theme_text.argb = (uint8_t)persist_read_int(PERSIST_THEME_TEXT);
  if (persist_exists(PERSIST_THEME_SELECTION))
    s_theme_selection.argb = (uint8_t)persist_read_int(PERSIST_THEME_SELECTION);
  if (persist_exists(PERSIST_THEME_SELECTION_TEXT))
    s_theme_selection_text.argb = (uint8_t)persist_read_int(PERSIST_THEME_SELECTION_TEXT);
  if (persist_exists(PERSIST_THEME_FONT)) s_theme_font = persist_read_int(PERSIST_THEME_FONT);
  if (persist_exists(PERSIST_THEME_SIZE)) s_theme_size = persist_read_int(PERSIST_THEME_SIZE);
}

static void lists_window_load(Window *window) {
  Layer *root = window_get_root_layer(window);
  s_lists_menu = menu_layer_create(layer_get_bounds(root));
  menu_layer_set_callbacks(s_lists_menu, NULL, (MenuLayerCallbacks) {
    .get_num_sections = one_section,
    .get_num_rows = lists_rows,
    .get_header_height = header_height,
    .get_cell_height = cell_height,
    .draw_header = lists_header,
    .draw_row = lists_row,
    .select_click = lists_select,
    .select_long_click = lists_long_select,
    .selection_changed = marquee_selection_changed
  });
  window_set_click_config_provider_with_context(window, button_config, s_lists_menu);
  layer_add_child(root, menu_layer_get_layer(s_lists_menu));
  apply_theme();
}

static void reminders_window_load(Window *window) {
  Layer *root = window_get_root_layer(window);
  s_reminders_menu = menu_layer_create(layer_get_bounds(root));
  menu_layer_set_callbacks(s_reminders_menu, NULL, (MenuLayerCallbacks) {
    .get_num_sections = one_section,
    .get_num_rows = reminders_rows,
    .get_header_height = header_height,
    .get_cell_height = cell_height,
    .draw_header = reminders_header,
    .draw_row = reminders_row,
    .select_click = reminders_select,
    .selection_changed = marquee_selection_changed
  });
  window_set_click_config_provider_with_context(window, button_config, s_reminders_menu);
  layer_add_child(root, menu_layer_get_layer(s_reminders_menu));
  apply_theme();
}

static void lists_window_unload(Window *window) {
  menu_layer_destroy(s_lists_menu);
  s_lists_menu = NULL;
}

static void reminders_window_unload(Window *window) {
  menu_layer_destroy(s_reminders_menu);
  s_reminders_menu = NULL;
}

static void init(void) {
  load_saved_theme();
  if (persist_exists(30)) s_buttons_lists = persist_read_int(30);
  if (persist_exists(31)) s_buttons_reminders = persist_read_int(31);
  s_lists_window = window_create();
  s_reminders_window = window_create();
  s_delete_window = window_create();
  window_set_window_handlers(s_delete_window, (WindowHandlers){.load=delete_window_load, .unload=delete_window_unload});
  window_set_window_handlers(s_lists_window, (WindowHandlers) {
    .load = lists_window_load, .appear = lists_window_appear, .unload = lists_window_unload
  });
  window_set_window_handlers(s_reminders_window, (WindowHandlers) {
    .load = reminders_window_load, .appear = menu_window_appear, .unload = reminders_window_unload
  });
  s_dictation = dictation_session_create(sizeof(s_dictation_text), dictation_callback, NULL);
  if (s_dictation) dictation_session_enable_confirmation(s_dictation, true);
  app_message_register_inbox_received(inbox_received);
  app_message_register_outbox_failed(outbox_failed);
  app_message_open(2048, 512);
  window_stack_push(s_lists_window, true);
}

static void deinit(void) {
  if (s_marquee_timer) {
    app_timer_cancel(s_marquee_timer);
    s_marquee_timer = NULL;
  }
  if (s_dictation) dictation_session_destroy(s_dictation);
#if defined(PBL_PLATFORM_EMERY)
  unload_custom_font();
#endif
  window_destroy(s_reminders_window);
  window_destroy(s_delete_window);
  window_destroy(s_lists_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}

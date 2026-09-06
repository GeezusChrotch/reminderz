# Reminderz phone settings

The settings page follows the shared Organik layout based on Pome: **Setup, Themes, Shortcuts**.

Setup retains pairing import, connection testing and auto-refresh. Shortcuts retains separate list/reminder button actions and their navigation validation.

## Themes

Choose a built-in preset or adjust the available colors, font, and size. Color swatches open the 64-color Pebble palette, with Pome's watch-color approximation. The watch preview updates while editing. Only fonts and sizes supported by this app are offered; preview fonts can fall back to a similar browser font.

Named custom themes can be saved, selected and deleted in the theme card. They are stored on the phone only after **Save & Apply to Watch** completes. Selecting a custom theme previews it; the final save applies it. Up to 20 custom themes are supported. Built-in presets remain available and cannot be deleted.

Switching tabs keeps unsaved edits. Save applies the app's settings together, including connection details and app-specific controls. Closing without saving discards edits. No new pairing is required solely for this layout update.

## Implementation and validation

The dependency-free shared UI is vendored inside the page generator between `BEGIN ORGANIK SETTINGS UI` / `END ORGANIK SETTINGS UI` markers. The app's original controls remain the source of truth and its existing save handler produces the Pebble callback. Coordinate shared UI updates across the other Organik Pebble apps.

Verified with generated-page browser checks on 320px and 390px viewports, Time/Time 2 configuration variants, palette interactions, and before/after save-payload comparisons. New custom theme libraries were checked through phone storage and reopening. Hardware installation and public release are separate from these source changes.

## Basic touch navigation

Swipe through lists and reminders; tap an item to focus it, then tap the focused item to activate it. Next/Previous page rows use the same two-step behavior. Deletion confirmation keeps its button controls. Touch-capable watches must have touch enabled under Settings → Display → Touch. Wake the watch before using touch navigation. All existing physical-button controls remain available; non-touch watches keep their existing behavior.

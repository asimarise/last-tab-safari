# Last Tab Switcher

A lightweight Safari extension that switches back to the previously active tab with **Option+Q**.

- No content scripts, no site access, no tracking
- Only permission: `storage` (to keep a per-window tab history)
- Pressing the shortcut repeatedly toggles between your last two tabs

## Project structure

```
last-tab-safari/
├── manifest.json
├── background.js
└── images/            # icon-16 … icon-512 PNGs
```

Safari wraps this WebExtension in a macOS app, generated with Xcode's converter.

## Requirements

- macOS 11+
- Xcode 12+ (full app, not just Command Line Tools)
- Safari 15+

## Build and run

1. Generate the Xcode project:
   ```bash
   xcrun safari-web-extension-converter ./last-tab-safari --macos-only
   ```
2. Xcode opens the generated project. Press **⌘R** to build and run.
3. In Safari, enable **Settings → Advanced → Show features for web developers**.
4. Open **Develop → Developer Settings…** and check **Allow unsigned extensions** (resets on every Safari restart).
5. Go to **Safari → Settings → Extensions** and enable **Last Tab Switcher**.

## Usage

| Shortcut | Action |
|----------|--------|
| Option+Q | Switch to the previously active tab |

## How it works

- `tabs.onActivated` records tabs in a most-recently-used list per window.
- `tabs.onRemoved` drops closed tabs from the list.
- On the shortcut, the extension activates the most recent tab that still exists.
- The list is stored in `storage.session` (falls back to `storage.local`) because the non-persistent background script is suspended when idle.

## Icons

- **Extension icon:** declared under `icons` in `manifest.json`.
- **App icon:** set in Xcode under `Assets.xcassets → AppIcon`.

Generate sizes from a 1024×1024 `icon.png`:

```bash
for s in 16 32 48 64 96 128 256 512; do
  sips -z $s $s icon.png --out last-tab/images/icon-$s.png
done
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `safari-web-extension-converter` not found | Install full Xcode, then `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` |
| Xcode asks for first launch | `sudo xcodebuild -runFirstLaunch` |
| Extension not listed in Safari | Keep the Xcode app running (⌘R) and enable unsigned extensions |
| Option+Q does nothing | Check for shortcut conflicts in System Settings → Keyboard → Keyboard Shortcuts. Shortcuts don't fire while the address bar is focused. |
| Icon not updating | Quit Safari, clear DerivedData, rebuild |

## Checking resource usage

- **Activity Monitor:** search for `Last Tab Switcher` and check CPU, Memory and Energy.
- **Safari:** Develop → Web Extension Background Content → Last Tab Switcher opens Web Inspector for the background script.

Idle CPU should be ~0% and memory a few MB.

## License

MIT
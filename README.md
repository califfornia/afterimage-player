# AFTERIMAGE

A system for exploring moving images: a **Video.js 10 skin** (`<afterimage-skin>`) and a demo page that uses it.

```sh
npm install
npm run dev          # demo at http://localhost:5173 (or the port Vite prints)
npm run build        # typecheck + build the demo
npm run build:skin   # typecheck + build the skin alone → dist-skin/afterimage-skin.js
```

## Layout

| Path | Role |
| --- | --- |
| `src/skin/` | **The skin.** Everything another project needs. See [src/skin/README.md](src/skin/README.md). |
| `src/skin/afterimage-skin.ts` | `<afterimage-skin>`: shadow-root template, behaviour, styles |
| `src/skin/afterimage-catalogue.ts` | `<afterimage-catalogue>`: optional archive record (data only) |
| `src/skin/template.ts` | The skin's markup, built from Video.js UI components |
| `src/skin/elements/` | AFTERIMAGE parts that read Video.js state (`PlayerController`) |
| `src/skin/styles/` | Tokens and styles, adopted into the shadow root |
| `src/main.ts`, `index.html` | The demo page: player + skin + this reel's catalogue record |
| `src/demo/page.css` | Demo page basics: background, skip link, full-window player. The darkroom (safelight glow, grain) is in the skin. |
| `examples/` | The skin on a foreign light page, two players at once, from source and from the built bundle |
| `public/chapters.vtt` | Sample chapters for the demo reel |

Video.js owns playback and the accessible controls: play, seek, mute, volume, time, speed menu, fullscreen, the time slider that *is* the frame index, hotkeys, error dialog, buffering indicator and status announcer. AFTERIMAGE adds:

- **Frame index:** a contact sheet and chapter ruler drawn inside `<media-time-slider>`. When idle, it folds to its sprocket edge and the picture takes the space.
- **Pause is inspection:** paused, the picture shows frame number, timecode and frame rate, and the reel steps by frame (buttons, `,` `.`, or `←` `→` while paused).
- **Viewer layout:** fullscreen, and phones held sideways.

## Honest limits

- **Stills** are real frames from the host's storyboard. Without one, the frame index shows numbered empty frames.
- **Frame rate** is measured from presented frames (`requestVideoFrameCallback`) and snapped to a standard rate. Until then it is **24 fps, labelled assumed**. Steps are frame-exact only for constant-frame-rate encodes with a measured rate.
- **Timecode** is non-drop-frame (`HH:MM:SS:FF`).
- **Copy** is English and lives in the template and elements; Video.js controls keep their translated labels.
- **Touch volume** is left to the hardware buttons; mute stays.

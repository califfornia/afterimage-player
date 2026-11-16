# AFTERIMAGE skin for Video.js 10

`<afterimage-skin>` is a Video.js 10 skin for HTML custom elements: the AFTERIMAGE interface around any Video.js media element. Like Video.js's packaged skins, it renders into a shadow root with a `<media-container>` as its root, and the page's media element is slotted into it. Its styles stay inside the skin, and the page's styles stay out.

Built for `@videojs/html@10.4.0`.

## Use it in a project

**1. Install Video.js and add the skin.**

```sh
npm install @videojs/html@10.4.0
```

Copy `dist-skin/afterimage-skin.js` into the project, or copy the `src/skin/` folder if the project builds with Vite. Run `npm run build:skin` in this repository to produce `dist-skin/`.

**2. Register a player and the skin.**

```js
import '@videojs/html/video/player';
import './afterimage-skin.js'; // or: import './skin' with the source folder
```

**3. Write the markup.**

```html
<video-player>
  <afterimage-skin>
    <video src="reel.mp4" crossorigin="anonymous" playsinline preload="metadata">
      <!-- Stills for the frame index and the hover preview (required for thumbnails) -->
      <track kind="metadata" label="thumbnails" src="storyboard.vtt" default />
      <!-- Chapter ruler (optional) -->
      <track kind="chapters" src="chapters.vtt" default />
    </video>

    <!-- Catalogue record (optional; every field is optional) -->
    <afterimage-catalogue
      title="The Last Light"
      archive-id="REEL 001"
      collection="COLLECTION 04"
      format="Digital Video"
      source="Where the footage comes from"
    >
      A short editorial description.
    </afterimage-catalogue>
  </afterimage-skin>
</video-player>
```

## What the skin owns, and what the project gives it

| Part | Owner |
| --- | --- |
| Header, viewing surface, frame index, control deck, pause/inspect read-out, settings, loading/buffering/error states, phone viewer layout | Skin |
| Catalogue card: the panel, opening and closing, focus, duration, measured frame rate, key list | Skin |
| Title, archive ID, collection, format, description, source | Project, via `<afterimage-catalogue>`. Missing fields are hidden. |
| Media source, storyboard track, chapters track | Project, on its `<video>` |
| Player and features | Project: `@videojs/html/video/player` |
| Fonts | Project (see below) |

## Media requirements

- **Stills:** a `kind="metadata" label="thumbnails"` WebVTT storyboard. Mux generates one at `https://image.mux.com/{PLAYBACK_ID}/storyboard.vtt`. Without it, the frame index shows numbered empty frames and says *Stills unavailable*.
- **CORS:** the media and the storyboard need CORS headers, and the `<video>` needs `crossorigin="anonymous"`.
- **Chapters:** optional. Without them, the chapter ruler is empty.
- **Frame rate:** measured in the browser during playback. Until then, the skin assumes 24 fps and labels it *assumed*.

Other Video.js media elements (`<hls-video>`, `<mux-video>`) slot in the same way. `<mux-video>` supplies its own storyboard from the playback ID. Frame rate is measured from the native `<video>` inside them.

## Attributes

| Element | Attribute | Effect |
| --- | --- | --- |
| `afterimage-skin` | `layout="overlay"` | Controls float over the picture inside the host's box, with no header (it returns in fullscreen). Size the host, e.g. a 16:9 frame. Small boxes get a compact deck. For apps that show the record's title themselves. |
| `afterimage-skin` | `viewer="off"` | Keep the stacked layout on phones held sideways. By default, short landscape viewports get the full-screen viewer. |
| `afterimage-catalogue` | `title`, `archive-id`, `collection`, `format`, `source`, text content | Catalogue record |

## Styling from the page

Tokens are custom properties on the skin host, so a page can override them:

```css
afterimage-skin {
  --ai-accent: #ff4b2e;        /* position, selection, focus, active */
  --ai-accent-rgb: 255 75 46;  /* same colour as an RGB triple, for glows */
  --ai-surround: #000;         /* room colour around the instrument (default: --ai-bg) */
  --ai-min-height: 100svh;     /* make the instrument fill the window */
  --ai-surface-max: 70svh;     /* cap the picture height */
}
```

The full list is in `styles/tokens.css`.

**Fonts.** The tokens ask for Fraunces (display) and Space Mono (timecode). A font face cannot be declared inside a shadow root, so the page loads them; the demo uses `@fontsource-variable/fraunces` and `@fontsource/space-mono`. Without them, the skin falls back to system serif and monospace fonts.

## Several players on a page

Each skin keeps its own inspect, frame-rate and preference state, so players on the same page do not affect each other. See `examples/two-players.html`.

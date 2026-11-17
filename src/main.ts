/**
 * AFTERIMAGE demo page.
 * Uses the skin exactly as another project would: register a Video.js player,
 * register the skin, then write the markup in index.html.
 */
import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import './skin';

// Typefaces the skin's tokens ask for. Pages that skip them fall back to system fonts.
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';

// Page basics for the demo (background, skip link, full-window player).
import './demo/page.css';

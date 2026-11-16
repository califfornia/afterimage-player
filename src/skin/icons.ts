import { registerIcons } from '@videojs/html/icons';

/**
 * AFTERIMAGE icon set. One 18 × 18 grid, a 1.5 stroke with square caps and
 * mitred joins. Transport glyphs (play, pause) are solid so the primary
 * action reads first; everything else is drawn in line.
 */
const svg = (body: string) =>
  `<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${body}</svg>`;

export const afterimageIcons = {
  play: svg('<path d="M5 3.25v11.5L14.25 9z" fill="currentColor" stroke="none"/>'),
  pause: svg(
    '<path d="M4.5 3.5h3v11h-3zM10.5 3.5h3v11h-3z" fill="currentColor" stroke="none"/>',
  ),
  restart: svg('<path d="M3.75 9a5.25 5.25 0 1 0 1.54-3.71"/><path d="M3.75 2.75v3h3"/>'),
  'seek-back': svg('<path d="M8.25 4.75 4 9l4.25 4.25M14 4.75 9.75 9 14 13.25"/>'),
  'seek-forward': svg('<path d="M9.75 4.75 14 9l-4.25 4.25M4 4.75 8.25 9 4 13.25"/>'),
  'volume-high': svg(
    '<path d="M2.75 6.75h2.5L9 3.75v10.5l-3.75-3H2.75z"/><path d="M11.75 6.75a3.25 3.25 0 0 1 0 4.5M13.75 4.75a6 6 0 0 1 0 8.5"/>',
  ),
  'volume-low': svg('<path d="M2.75 6.75h2.5L9 3.75v10.5l-3.75-3H2.75z"/><path d="M11.75 6.75a3.25 3.25 0 0 1 0 4.5"/>'),
  'volume-off': svg('<path d="M2.75 6.75h2.5L9 3.75v10.5l-3.75-3H2.75z"/><path d="m12 7 4 4m0-4-4 4"/>'),
  'fullscreen-enter': svg('<path d="M2.75 6.5V2.75H6.5M11.5 2.75h3.75V6.5M15.25 11.5v3.75H11.5M6.5 15.25H2.75V11.5"/>'),
  'fullscreen-exit': svg('<path d="M6.5 2.75V6.5H2.75M15.25 6.5H11.5V2.75M11.5 15.25V11.5h3.75M2.75 11.5H6.5v3.75"/>'),
  settings: svg('<path d="M2.75 5.5h3.5M9.75 5.5h5.5M2.75 12.5h7.5M13.75 12.5h1.5M6.25 4h3.5v3h-3.5zM10.25 11h3.5v3h-3.5z"/>'),
  info: svg('<path d="M2.75 2.75h12.5v12.5H2.75z"/><path d="M9 8.25v4.5M9 5.25v.5"/>'),
  inspect: svg('<circle cx="9" cy="9" r="4"/><path d="M9 1.75v3.5M9 12.75v3.5M1.75 9h3.5M12.75 9h3.5"/>'),
  'frame-prev': svg('<path d="M4.25 3.75v10.5"/><path d="M14 4.5 7.5 9l6.5 4.5z"/>'),
  'frame-next': svg('<path d="M13.75 3.75v10.5"/><path d="M4 4.5 10.5 9 4 13.5z"/>'),
  rotate: svg('<path d="M6.25 2.75h5.5v12.5h-5.5z"/><path d="M14.25 6.5a4.5 4.5 0 0 1 0 5M15.75 11.5l-1.5 0v-1.5"/>'),
  close: svg('<path d="m4.25 4.25 9.5 9.5m0-9.5-9.5 9.5"/>'),
  check: svg('<path d="m3.75 9.5 3.25 3.25 7.25-7.75"/>'),
  chevron: svg('<path d="M7 4.5 11.5 9 7 13.5"/>'),
  'chevron-back': svg('<path d="M11 4.5 6.5 9l4.5 4.5"/>'),
};

registerIcons('afterimage', afterimageIcons);

/**
 * AFTERIMAGE — a Video.js 10 skin.
 *
 * Importing this module registers <afterimage-skin>, <afterimage-catalogue>
 * and the parts they use. It does not register a player: import the Video.js
 * player you need alongside it, for example `@videojs/html/video/player`.
 */

// Video.js UI parts the skin composes.
import '@videojs/html/ui/container';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time-separator';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/time-slider-chapter-title';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-separator';
import '@videojs/html/ui/menu-checkbox-item';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/status-announcer';

// AFTERIMAGE parts, then the skin and its catalogue.
import './icons';
import './elements/ai-status';
import './elements/ai-contact-sheet';
import './elements/ai-chapters';
import './elements/ai-timecode';
import './elements/ai-inspect';

export { AfterimageCatalogueElement, type CatalogueRecord } from './afterimage-catalogue';
export { AfterimageSkinElement } from './afterimage-skin';
export { afterimageIcons } from './icons';

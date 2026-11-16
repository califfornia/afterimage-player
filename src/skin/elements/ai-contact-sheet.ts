import { UIElement, type MediaTextCue } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { select } from '../lib/store';
import { sessionOf } from '../lib/session';

interface Still {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const sheetSizes = new Map<string, Promise<{ width: number; height: number }>>();

function loadSheet(url: string) {
  let pending = sheetSizes.get(url);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
    sheetSizes.set(url, pending);
  }
  return pending;
}

function parseStill(cue: MediaTextCue, base: string | null): Still | null {
  const text = cue.text.trim();
  if (!text) return null;
  const [path, fragment] = text.split('#');
  const url = new URL(path, base ?? location.href).href;
  const match = fragment?.match(/xywh=(\d+),(\d+),(\d+),(\d+)/);
  if (!match) return { url, x: 0, y: 0, w: 0, h: 0 };
  const [, x, y, w, h] = match.map(Number);
  return { url, x, y, w, h };
}

/**
 * The contact sheet inside the frame index: one cell per equal slice of the
 * reel, each showing the storyboard still from the middle of its slice.
 * Cells map linearly onto the time slider, so the Video.js playhead lands on
 * the cell that is playing. Stills come from the media's thumbnails track, so
 * every image is a real frame from the encode. Without that track the cells
 * stay empty and numbered.
 *
 * Purely visual: the enclosing <media-time-slider> owns seeking, dragging and
 * keyboard input, so this element is hidden from assistive technology.
 */
export class AfterimageContactSheetElement extends UIElement {
  readonly #media = new PlayerController(this, select((s) => ({
    duration: s.duration,
    track: s.thumbnailsTrack,
  })));
  readonly #time = new PlayerController(this, select((s) => ({ currentTime: s.currentTime })));

  #cells: HTMLElement[] = [];
  #observer: ResizeObserver | null = null;
  #unsubscribe: (() => void) | null = null;
  #layoutKey = '';
  #renderToken = 0;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
    this.#observer = new ResizeObserver(() => this.#layout());
    this.#observer.observe(this);
    this.#unsubscribe = sessionOf(this).subscribe(() => this.#layout());
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    super.disconnectedCallback();
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    this.#layout();
    this.#mark();
  }

  get #count(): number {
    const target = parseFloat(getComputedStyle(this).getPropertyValue('--ai-frame-target')) || 104;
    return Math.max(4, Math.round(this.clientWidth / target));
  }

  #layout() {
    const media = this.#media.value;
    const duration = media?.duration ?? 0;
    const cues = media?.track?.cues ?? [];
    const stills = sessionOf(this).get().stills && cues.length > 0;
    const count = this.#count;
    const key = `${count}|${duration}|${cues.length}|${stills}|${this.clientHeight}`;
    if (key === this.#layoutKey) return;
    this.#layoutKey = key;

    this.style.setProperty('--ai-frame-count', String(count));
    this.toggleAttribute('data-stills', stills);

    while (this.#cells.length < count) {
      const cell = document.createElement('div');
      cell.className = 'ai-cell';
      cell.innerHTML = '<div class="ai-cell__image"></div><span class="ai-cell__edge"></span>';
      this.append(cell);
      this.#cells.push(cell);
    }
    while (this.#cells.length > count) this.#cells.pop()!.remove();

    const token = ++this.#renderToken;
    this.#cells.forEach((cell, index) => {
      const edge = cell.lastElementChild as HTMLElement;
      edge.textContent = String(index + 1).padStart(2, '0');
      const image = cell.firstElementChild as HTMLElement;
      image.style.backgroundImage = '';
      if (!stills || !duration) return;

      const time = ((index + 0.5) * duration) / count;
      const cue = cues.find((c) => time >= c.startTime && time < c.endTime) ?? cues[cues.length - 1];
      const still = cue && parseStill(cue, media?.track?.src ?? null);
      if (still) this.#paint(image, still, token);
    });
    this.#mark();
  }

  async #paint(image: HTMLElement, still: Still, token: number) {
    try {
      const sheet = await loadSheet(still.url);
      if (token !== this.#renderToken) return;
      const frameW = still.w || sheet.width;
      const frameH = still.h || sheet.height;
      const boxW = image.clientWidth;
      const boxH = image.clientHeight;
      // Cover the cell, cropping the frame from its centre.
      const scale = Math.max(boxW / frameW, boxH / frameH);
      const offsetX = -still.x * scale - (frameW * scale - boxW) / 2;
      const offsetY = -still.y * scale - (frameH * scale - boxH) / 2;
      image.style.backgroundImage = `url("${still.url}")`;
      image.style.backgroundSize = `${sheet.width * scale}px ${sheet.height * scale}px`;
      image.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    } catch {
      // A missing sheet leaves the numbered empty frame in place.
    }
  }

  /** Mark the playing cell and the cells already passed ("developed"). */
  #mark() {
    const duration = this.#media.value?.duration ?? 0;
    const time = this.#time.value?.currentTime ?? 0;
    const count = this.#cells.length;
    const current = duration > 0 ? Math.min(count - 1, Math.floor((time / duration) * count)) : -1;
    this.#cells.forEach((cell, index) => {
      cell.toggleAttribute('data-current', index === current);
      cell.toggleAttribute('data-exposed', index < current);
    });
  }
}

customElements.define('ai-contact-sheet', AfterimageContactSheetElement);

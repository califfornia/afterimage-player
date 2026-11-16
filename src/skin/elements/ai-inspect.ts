import { UIElement } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { select } from '../lib/store';
import { sessionOf } from '../lib/session';
import { describeFrame, formatRate, frameAt, timeOfFrame } from '../lib/timecode';

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
/** Keys that belong to a focused Video.js widget (sliders, menus) and must not be stolen. */
const OWNS_ARROWS = '[role="slider"], [role="menu"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';

/**
 * Pause is inspection. Whenever the reel is paused (after playback has
 * started, and before the end), the interface shows the inspection read-out
 * and the reel can be stepped one frame at a time:
 *
 *   , .      previous / next frame (pauses first if playing)
 *   ← →      previous / next frame while paused (5 s seeks while playing)
 *
 * Frame stepping seeks to the middle of the neighbouring frame at the session
 * frame rate. Browsers seek to the nearest decodable position, so steps are
 * accurate to the frame only when the rate is measured and the encode has a
 * constant frame rate; the interface says which rate it is using.
 *
 * Markup (light DOM, provided by the page):
 *   <ai-inspect>
 *     <button data-action="prev">…</button>
 *     … frame counter …
 *     <button data-action="next">…</button>
 *     <span data-part="announcer" role="status"></span>
 *   </ai-inspect>
 */
export class AfterimageInspectElement extends UIElement {
  readonly #playback = new PlayerController(
    this,
    select((s) => ({ paused: s.paused, started: s.started, ended: s.ended, canPlay: s.canPlay, error: s.error })),
  );
  readonly #time = new PlayerController(this, select((s) => ({ currentTime: s.currentTime, duration: s.duration })));
  readonly #store = new PlayerController(this);

  #abort: AbortController | null = null;
  #unsubscribe: (() => void) | null = null;
  #pendingFrame: number | null = null;
  #announceTimer = 0;

  connectedCallback() {
    super.connectedCallback();
    this.#abort?.abort();
    this.#abort = new AbortController();
    const { signal } = this.#abort;

    this.addEventListener('click', this.#onClick, { signal });
    this.#container?.addEventListener('keydown', this.#onKeydown, { signal });
    this.#unsubscribe = sessionOf(this).subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.#abort?.abort();
    this.#abort = null;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    clearTimeout(this.#announceTimer);
    super.disconnectedCallback();
  }

  get #container() {
    return this.closest<HTMLElement>('.ai');
  }

  /** Frames can be stepped whenever the reel is paused and playable. */
  get #steppable(): boolean {
    const p = this.#playback.value;
    return !!p && p.paused && p.canPlay && !p.error;
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    const p = this.#playback.value;

    // The inspection read-out belongs to a deliberate pause, not to the
    // untouched first frame or the end of the reel.
    const inspecting = !!p && p.paused && p.started && !p.ended && p.canPlay && !p.error;
    sessionOf(this).set({ inspecting });
    if (!p?.paused) this.#pendingFrame = null;

    const steppable = this.#steppable;
    const time = this.#time.value;
    const frame = this.#pendingFrame ?? frameAt(time?.currentTime ?? 0, sessionOf(this).get().fps);
    const last = this.#lastFrame;

    const prev = this.querySelector<HTMLButtonElement>('[data-action="prev"]');
    const next = this.querySelector<HTMLButtonElement>('[data-action="next"]');
    if (prev) prev.disabled = !steppable || frame <= 0;
    if (next) next.disabled = !steppable || frame >= last;

    this.toggleAttribute('data-active', inspecting);
    this.#container?.toggleAttribute('data-inspecting', inspecting);
    for (const hotkey of this.#container?.querySelectorAll<HTMLElement>('media-hotkey[data-inspect-yields]') ?? []) {
      hotkey.toggleAttribute('disabled', steppable);
    }
  }

  get #lastFrame(): number {
    const duration = this.#time.value?.duration ?? 0;
    return Math.max(0, frameAt(Math.max(0, duration - 0.001), sessionOf(this).get().fps));
  }

  step(delta: number) {
    const store = this.#store.value;
    const time = this.#time.value;
    const p = this.#playback.value;
    if (!store || !time || !p?.canPlay || p.error) return;
    if (!p.paused) store.pause();

    const { fps } = sessionOf(this).get();
    const from = this.#pendingFrame ?? frameAt(time.currentTime, fps);
    const frame = Math.min(this.#lastFrame, Math.max(0, from + delta));
    if (frame === from) return;
    this.#seekToFrame(frame);
    clearTimeout(this.#announceTimer);
    this.#announceTimer = window.setTimeout(() => this.#announce(describeFrame(frame, timeOfFrame(frame, fps))), 350);
  }

  async #seekToFrame(frame: number) {
    const store = this.#store.value;
    if (!store) return;
    this.#pendingFrame = frame;
    this.requestUpdate();
    try {
      await store.seek(timeOfFrame(frame, sessionOf(this).get().fps));
    } finally {
      if (this.#pendingFrame === frame) this.#pendingFrame = null;
      this.requestUpdate();
    }
  }

  #announce(message: string) {
    const region = this.querySelector('[data-part="announcer"]');
    if (!region) return;
    // Clear first so repeating the same message is still announced.
    region.textContent = '';
    window.setTimeout(() => (region.textContent = message), 30);
  }

  #onClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
    if (!button || button.disabled) return;
    if (button.dataset.action === 'prev') this.step(-1);
    else if (button.dataset.action === 'next') this.step(1);
  };

  #onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as Element;
    if (target.closest(EDITABLE)) return;

    switch (event.key) {
      case ',':
        this.step(-1);
        break;
      case '.':
        this.step(1);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (!this.#steppable || target.closest(OWNS_ARROWS)) return;
        this.step(event.key === 'ArrowLeft' ? -1 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  };
}

/** "23.976 FPS · measured" / "24 FPS · assumed". */
export class AfterimageFrameRateElement extends UIElement {
  #unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.#unsubscribe = sessionOf(this).subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    super.disconnectedCallback();
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    const { fps, fpsSource } = sessionOf(this).get();
    this.dataset.source = fpsSource;
    const text = `${formatRate(fps)} FPS · ${fpsSource}`;
    if (this.textContent !== text) this.textContent = text;
    this.title =
      fpsSource === 'measured'
        ? 'Measured from frames the browser presented during playback.'
        : 'Assumed until the frame rate can be measured during playback. Frame numbers may be approximate.';
  }
}

customElements.define('ai-inspect', AfterimageInspectElement);
customElements.define('ai-frame-rate', AfterimageFrameRateElement);

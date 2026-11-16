import { UIElement } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { select } from '../lib/store';
import { sessionOf } from '../lib/session';
import { formatFrameNumber, formatTimecode, frameAt } from '../lib/timecode';

/**
 * Timecode or frame-number readout tied to the player clock.
 *
 *   <ai-timecode>                 current position, HH:MM:SS:FF
 *   <ai-timecode type="duration"> total length, HH:MM:SS:FF
 *   <ai-timecode format="frame">  current frame, 000000
 *
 * Frames use the session frame rate (measured, or the documented fallback).
 * The text is presentational; each instance carries an accessible label
 * from its `label` attribute.
 */
export class AfterimageTimecodeElement extends UIElement {
  readonly #time = new PlayerController(this, select((s) => ({ currentTime: s.currentTime, duration: s.duration })));
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
    const time = this.#time.value;
    const { fps } = sessionOf(this).get();
    const seconds = this.getAttribute('type') === 'duration' ? (time?.duration ?? 0) : (time?.currentTime ?? 0);
    const known = this.getAttribute('type') !== 'duration' || seconds > 0;
    let text: string;
    if (this.getAttribute('format') === 'frame') {
      text = known ? formatFrameNumber(frameAt(seconds, fps)) : '––––––';
    } else {
      text = known ? formatTimecode(seconds, fps) : '––:––:––:––';
    }
    if (this.textContent !== text) this.textContent = text;
    this.toggleAttribute('data-unavailable', !known);
  }
}

customElements.define('ai-timecode', AfterimageTimecodeElement);

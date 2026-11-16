import { UIElement } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { select } from '../lib/store';

export type PlayerStatus = 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

const LABELS: Record<PlayerStatus, string> = {
  loading: 'Loading',
  playing: 'Playing',
  paused: 'Paused',
  buffering: 'Buffering',
  ended: 'End of reel',
  error: 'Error',
};

/**
 * Header status readout. Derives one status from the Video.js store, shows it, and mirrors it to `data-status` on the player
 * container so the rest of the interface can style each state.
 */
export class AfterimageStatusElement extends UIElement {
  readonly #playback = new PlayerController(this, select((s) => ({
    paused: s.paused,
    ended: s.ended,
    waiting: s.waiting,
    canPlay: s.canPlay,
    started: s.started,
    error: s.error,
  })));

  #label: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.#label) {
      this.innerHTML = '<span class="ai-status__mark" aria-hidden="true"></span><span class="ai-status__label"></span>';
      this.#label = this.querySelector('.ai-status__label');
    }
  }

  get status(): PlayerStatus {
    const s = this.#playback.value;
    if (!s) return 'loading';
    if (s.error) return 'error';
    if (s.ended) return 'ended';
    if (!s.canPlay && !s.started) return 'loading';
    if (s.waiting && !s.paused) return 'buffering';
    return s.paused ? 'paused' : 'playing';
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    const status = this.status;
    this.dataset.status = status;
    if (this.#label) this.#label.textContent = LABELS[status];
    this.closest<HTMLElement>('.ai')?.setAttribute('data-status', status);
  }
}

customElements.define('ai-status', AfterimageStatusElement);

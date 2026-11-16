import { UIElement } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { select } from '../lib/store';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Chapter ruler drawn above the contact sheet: a tick and short label at each
 * chapter start, with the playing chapter brought forward. Visual only; the
 * slider's chapter title element announces chapters to assistive technology.
 */
export class AfterimageChapterRulerElement extends UIElement {
  readonly #chapters = new PlayerController(this, select((s) => ({ cues: s.chaptersCues, duration: s.duration })));
  readonly #time = new PlayerController(this, select((s) => ({ currentTime: s.currentTime })));
  #key = '';

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    const cues = this.#chapters.value?.cues ?? [];
    const duration = this.#chapters.value?.duration ?? 0;
    const key = `${cues.length}|${duration}`;

    if (key !== this.#key) {
      this.#key = key;
      this.replaceChildren();
      this.toggleAttribute('data-empty', !cues.length || !duration);
      if (duration > 0) {
        cues.forEach((cue, index) => {
          const mark = document.createElement('span');
          mark.className = 'ai-chapter';
          mark.style.setProperty('--start', `${(cue.startTime / duration) * 100}%`);
          mark.style.setProperty('--end', `${(Math.min(cue.endTime, duration) / duration) * 100}%`);
          mark.innerHTML = `<span class="ai-chapter__num">${pad(index + 1)}</span><span class="ai-chapter__title"></span>`;
          mark.querySelector('.ai-chapter__title')!.textContent = cue.text;
          this.append(mark);
        });
      }
    }

    const time = this.#time.value?.currentTime ?? 0;
    Array.from(this.children).forEach((mark, index) => {
      const cue = cues[index];
      mark.toggleAttribute('data-active', !!cue && time >= cue.startTime && time < cue.endTime);
    });
  }
}

/** "CH 03 · Arcade": the playing chapter, for the frame index header. */
export class AfterimageChapterLabelElement extends UIElement {
  readonly #chapters = new PlayerController(this, select((s) => ({ cues: s.chaptersCues })));
  readonly #time = new PlayerController(this, select((s) => ({ currentTime: s.currentTime })));

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    const cues = this.#chapters.value?.cues ?? [];
    const time = this.#time.value?.currentTime ?? 0;
    const index = cues.findIndex((cue) => time >= cue.startTime && time < cue.endTime);
    const text = index >= 0 ? `CH ${pad(index + 1)} · ${cues[index].text}` : '';
    if (this.textContent !== text) this.textContent = text;
    this.hidden = !text;
  }
}

customElements.define('ai-chapter-ruler', AfterimageChapterRulerElement);
customElements.define('ai-chapter-label', AfterimageChapterLabelElement);

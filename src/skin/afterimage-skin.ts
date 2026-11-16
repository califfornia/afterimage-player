import { UIElement } from '@videojs/html';
import { PlayerController } from '@videojs/html/video';
import { AfterimageCatalogueElement, CATALOGUE_CHANGE, type CatalogueRecord } from './afterimage-catalogue';
import { measureFrameRate } from './lib/frame-rate';
import { setupInfoPanel } from './lib/info-panel';
import { select } from './lib/store';
import { createSession, FALLBACK_FPS, type Session } from './lib/session';
import { template } from './template';
import skinCss from './styles/index.css?inline';

const skinSheet = new CSSStyleSheet();
skinSheet.replaceSync(skinCss);

/** Page-level rules the skin needs, adopted into the document once. */
const GLOBAL_CSS = `
afterimage-catalogue { display: none; }
`;
let globalAdopted = false;
function adoptGlobalStyles() {
  if (globalAdopted) return;
  globalAdopted = true;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(GLOBAL_CSS);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

const ROTATE_KEY = 'afterimage:rotate-hint-dismissed';
const STAGE_QUERY = '(orientation: landscape) and (max-height: 520px)';

type CheckboxItem = HTMLElement & { checked?: boolean };

/**
 * <afterimage-skin>: the AFTERIMAGE player interface for Video.js 10.
 *
 * Like Video.js's packaged skins, it renders its UI into a shadow root around
 * a <media-container>, and the page's media element is slotted into it:
 *
 *   <video-player>
 *     <afterimage-skin>
 *       <video src="…" crossorigin="anonymous" playsinline>
 *         <track kind="metadata" label="thumbnails" src="storyboard.vtt" default>
 *         <track kind="chapters" src="chapters.vtt" default>
 *       </video>
 *       <afterimage-catalogue title="…" archive-id="…">Description</afterimage-catalogue>
 *     </afterimage-skin>
 *   </video-player>
 *
 * Attributes
 *   layout="overlay"  controls float over the picture inside the host's box, with
 *                     no header: for apps that frame the player and show the
 *                     record's title themselves. Size the host (e.g. a 16:9 box).
 *   viewer="off"      keep the stacked layout on phones held sideways
 *                     (default: the full-screen viewer layout in short landscape viewports)
 */
export class AfterimageSkinElement extends UIElement {
  static tagName = 'afterimage-skin';
  static observedAttributes = ['layout'];

  /** Inspect / frame-rate / preference state for this player only. */
  readonly afterimageSession: Session = createSession();

  readonly #store = new PlayerController(this);
  /** Whether the player has storyboard stills, whatever kind of media supplies them. */
  readonly #storyboard = new PlayerController(this, select((s) => ({ stills: (s.thumbnailsTrack?.cues.length ?? 0) > 0 })));
  #abort: AbortController | null = null;
  #mediaAbort: AbortController | null = null;
  #media: HTMLMediaElement | null = null;
  #resize: ResizeObserver | null = null;

  constructor() {
    super();
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = template;
      root.adoptedStyleSheets = [skinSheet];
    }
  }

  /** The skin's root <media-container>. */
  get container(): HTMLElement {
    return this.#q('.ai')!;
  }

  /** The catalogue record currently shown (empty fields when none is given). */
  get record(): CatalogueRecord {
    const catalogue = this.querySelector('afterimage-catalogue');
    return catalogue instanceof AfterimageCatalogueElement
      ? catalogue.record
      : { title: '', archiveId: '', collection: '', format: '', source: '', description: '' };
  }

  connectedCallback() {
    super.connectedCallback();
    adoptGlobalStyles();
    this.#abort?.abort();
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    const session = this.afterimageSession;

    // Media: re-bind whenever the slotted element changes.
    const mediaSlot = this.#q<HTMLSlotElement>('slot.ai-media-slot')!;
    mediaSlot.addEventListener('slotchange', () => this.#bindMedia(), { signal });
    this.#bindMedia();

    // Catalogue: header, card and labels follow the <afterimage-catalogue> element.
    this.addEventListener(CATALOGUE_CHANGE, () => this.#renderRecord(), { signal });
    this.#q<HTMLSlotElement>('slot[name="catalogue"]')!.addEventListener('slotchange', () => this.#renderRecord(), {
      signal,
    });
    this.#renderRecord();

    // Settings menu.
    const loopItem = this.#q<CheckboxItem>('#setting-loop')!;
    loopItem.addEventListener(
      'checked-change',
      () => {
        if (this.#media) this.#media.loop = !!loopItem.checked;
      },
      { signal },
    );
    const stillsItem = this.#q<CheckboxItem>('#setting-stills')!;
    stillsItem.addEventListener('checked-change', () => session.set({ stills: !!stillsItem.checked }), { signal });
    signal.addEventListener('abort', session.subscribe(() => this.#renderStillsSource()));

    // Error: retry reloads the source and resumes.
    this.#q('#error-retry')!.addEventListener(
      'click',
      () => {
        const store = this.#store.value;
        store?.dismissError();
        this.#media?.load();
        store?.play().catch(() => {});
      },
      { signal },
    );

    // Catalogue card.
    setupInfoPanel({
      trigger: this.#q<HTMLButtonElement>('#info-trigger')!,
      close: this.#q<HTMLButtonElement>('#info-close')!,
      panel: this.#q<HTMLElement>('#archive-info')!,
      heading: this.#q<HTMLElement>('#archive-info-heading')!,
      container: this.container,
      signal,
    });

    // Pointer on the picture: click plays/pauses, double-click toggles fullscreen.
    // Scoped to the viewing surface so clicks on the header, index or deck never
    // change playback. Touch keeps the Video.js tap-to-show-controls gesture.
    const surface = this.#q('.ai-surface')!;
    const onPicture = (event: Event) => !(event.target as Element).closest('media-error-dialog, button');
    surface.addEventListener(
      'click',
      (event) => {
        const store = this.#store.value;
        if (!store || (event as PointerEvent).pointerType === 'touch' || !onPicture(event)) return;
        store.paused ? store.play().catch(() => {}) : store.pause();
      },
      { signal },
    );
    surface.addEventListener(
      'dblclick',
      (event) => {
        const store = this.#store.value;
        if (!store || !onPicture(event)) return;
        (store.isFullscreen ? store.exitFullscreen() : store.requestFullscreen()).catch(() => {});
      },
      { signal },
    );

    // Overlay layout, and its compact form for small boxes.
    this.#applyLayout();
    this.#resize?.disconnect();
    this.#resize = new ResizeObserver(() => this.#updateCompact());
    this.#resize.observe(this.container);

    // Phone held sideways: the viewer layout (opt out with viewer="off").
    const stage = window.matchMedia(STAGE_QUERY);
    const applyStage = () =>
      this.container.toggleAttribute('data-stage', stage.matches && this.getAttribute('viewer') !== 'off');
    stage.addEventListener('change', applyStage, { signal });
    applyStage();

    // Portrait phones: a dismissible invitation to turn sideways (never forced).
    const hint = this.#q<HTMLElement>('#rotate-hint')!;
    let dismissed = this.getAttribute('viewer') === 'off';
    try {
      dismissed ||= localStorage.getItem(ROTATE_KEY) === '1';
    } catch {
      /* storage unavailable: show the hint */
    }
    hint.hidden = dismissed;
    this.#q('#rotate-dismiss')!.addEventListener(
      'click',
      () => {
        hint.hidden = true;
        this.container.focus();
        try {
          localStorage.setItem(ROTATE_KEY, '1');
        } catch {
          /* ignore */
        }
      },
      { signal },
    );
  }

  disconnectedCallback() {
    this.#abort?.abort();
    this.#abort = null;
    this.#mediaAbort?.abort();
    this.#mediaAbort = null;
    this.#resize?.disconnect();
    this.#resize = null;
    super.disconnectedCallback();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'layout') this.#applyLayout();
  }

  /** layout="overlay": viewer layout in the host's box; compact when that box is small. */
  #applyLayout() {
    const container = this.shadowRoot?.querySelector<HTMLElement>('.ai');
    if (!container) return;
    const overlay = this.getAttribute('layout') === 'overlay';
    if (overlay) container.dataset.layout = 'overlay';
    else delete container.dataset.layout;
    this.#updateCompact();
  }

  #updateCompact() {
    const container = this.shadowRoot?.querySelector<HTMLElement>('.ai');
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const compact = container.dataset.layout === 'overlay' && (width < 640 || height < 400);
    container.toggleAttribute('data-compact', compact);
  }

  #q<T extends Element = HTMLElement>(selector: string): T | null {
    return this.shadowRoot!.querySelector<T>(selector);
  }

  /** Wire the slotted media: intrinsic aspect ratio, frame-rate measurement, stills label, loop. */
  #bindMedia() {
    this.#mediaAbort?.abort();
    this.#mediaAbort = new AbortController();
    const { signal } = this.#mediaAbort;
    const session = this.afterimageSession;

    const slot = this.#q<HTMLSlotElement>('slot.ai-media-slot')!;
    const media =
      slot
        .assignedElements()
        .find((el): el is HTMLMediaElement => el instanceof HTMLMediaElement || /-(video|audio)$/.test(el.localName)) ??
      null;
    this.#media = media;
    if (!media) return;

    const loopItem = this.#q<CheckboxItem>('#setting-loop');
    if (loopItem) loopItem.checked = !!media.loop;

    // Fit the surface to the film, not to 16:9.
    const applyRatio = () => {
      const video = media as HTMLVideoElement;
      if (video.videoWidth && video.videoHeight) {
        this.container.style.setProperty('--ai-media-ratio', `${video.videoWidth} / ${video.videoHeight}`);
      }
    };
    media.addEventListener('loadedmetadata', applyRatio, { signal });
    applyRatio();

    // Frame rate: measured from presented frames, else the labelled fallback.
    const remeasure = () => {
      session.set({ fps: FALLBACK_FPS, fpsSource: 'assumed' });
    };
    media.addEventListener('emptied', remeasure, { signal });
    // Media elements such as <mux-video> wrap a native <video>; measure that one.
    const nativeVideo = (): HTMLVideoElement | null =>
      media instanceof HTMLVideoElement
        ? media
        : (media.querySelector('video') ?? (media.shadowRoot?.querySelector('video') as HTMLVideoElement | null) ?? null);
    let stop = () => {};
    const measure = () => {
      stop();
      const video = nativeVideo();
      stop = video ? measureFrameRate(video, (fps) => session.set({ fps, fpsSource: 'measured' })) : () => {};
    };
    media.addEventListener('emptied', measure, { signal });
    media.addEventListener('loadedmetadata', () => nativeVideo() && measure(), { signal, once: true });
    measure();
    signal.addEventListener('abort', () => stop());

    this.#renderStillsSource();
  }

  update(changed: Parameters<UIElement['update']>[0]) {
    super.update(changed);
    this.#renderStillsSource();
  }

  #renderStillsSource() {
    const label = this.shadowRoot?.querySelector('#stills-source');
    if (!label) return;
    const hasStills = !!this.#storyboard.value?.stills;
    label.textContent = !this.afterimageSession.get().stills
      ? 'Stills hidden'
      : hasStills
        ? 'Stills from storyboard'
        : 'Stills unavailable';
  }

  /** Fill header, card and labels from <afterimage-catalogue>; hide what is missing. */
  #renderRecord() {
    const record = this.record;
    const values: Record<string, string> = {
      ...record,
      loadingName: record.archiveId || 'reel',
    };
    for (const node of this.shadowRoot!.querySelectorAll<HTMLElement>('[data-bind]')) {
      node.textContent = values[node.dataset.bind!] ?? '';
    }
    const present: Record<string, boolean> = {
      id: !!(record.archiveId || record.collection),
      title: !!record.title,
      archiveId: !!record.archiveId,
      collection: !!record.collection,
      format: !!record.format,
      description: !!record.description,
      source: !!record.source,
    };
    for (const node of this.shadowRoot!.querySelectorAll<HTMLElement>('[data-field]')) {
      node.hidden = !present[node.dataset.field!];
    }
    // The slash only separates two identifiers.
    const slash = this.#q('.ai-record__slash');
    if (slash) slash.hidden = !(record.archiveId && record.collection);
    this.container.setAttribute('aria-label', record.title ? `AFTERIMAGE player, ${record.title}` : 'AFTERIMAGE player');
  }
}

if (!customElements.get(AfterimageSkinElement.tagName)) {
  customElements.define(AfterimageSkinElement.tagName, AfterimageSkinElement);
}

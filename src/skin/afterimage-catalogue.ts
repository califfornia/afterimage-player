/** The archive record a project hands to the skin. Every field is optional. */
export interface CatalogueRecord {
  title: string;
  archiveId: string;
  collection: string;
  format: string;
  source: string;
  /** Plain text: the element's own text content. */
  description: string;
}

export const CATALOGUE_CHANGE = 'afterimage-catalogue-change';

/**
 * <afterimage-catalogue>: archive metadata for the reel in an <afterimage-skin>.
 * Data only. The skin reads it, fills its header and catalogue card, and
 * hides any field that is not given. It renders nothing itself.
 *
 *   <afterimage-catalogue
 *     title="The Last Light"
 *     archive-id="REEL 001"
 *     collection="COLLECTION 04"
 *     format="Digital Video"
 *     source="Where the footage comes from">
 *     A short editorial description.
 *   </afterimage-catalogue>
 */
export class AfterimageCatalogueElement extends HTMLElement {
  static observedAttributes = ['title', 'archive-id', 'collection', 'format', 'source'];

  #observer: MutationObserver | null = null;

  get record(): CatalogueRecord {
    const attr = (name: string) => this.getAttribute(name)?.trim() ?? '';
    return {
      title: attr('title'),
      archiveId: attr('archive-id'),
      collection: attr('collection'),
      format: attr('format'),
      source: attr('source'),
      description: (this.textContent ?? '').replace(/\s+/g, ' ').trim(),
    };
  }

  connectedCallback() {
    // Sent to the skin's hidden data slot.
    if (!this.slot) this.slot = 'catalogue';
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => this.#notify());
    this.#observer.observe(this, { childList: true, subtree: true, characterData: true });
    this.#notify();
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback() {
    this.#notify();
  }

  #notify() {
    if (this.isConnected) this.dispatchEvent(new Event(CATALOGUE_CHANGE, { bubbles: true }));
  }
}

if (!customElements.get('afterimage-catalogue')) {
  customElements.define('afterimage-catalogue', AfterimageCatalogueElement);
}

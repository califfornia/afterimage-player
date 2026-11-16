interface InfoPanelParts {
  trigger: HTMLButtonElement;
  close: HTMLButtonElement;
  panel: HTMLElement;
  heading: HTMLElement;
  container: HTMLElement;
  /** Removes the listeners when aborted. */
  signal?: AbortSignal;
}

/**
 * Disclosure for the catalogue card. It is a non-modal panel beside (or below)
 * the reel, so playback continues and the rest of the player stays usable.
 *
 * - The trigger reports state with aria-expanded.
 * - Opening moves focus to the panel heading; closing returns it to the trigger.
 * - Escape inside the panel closes it.
 * - While closed the panel is inert, so its contents leave the tab order.
 */
export function setupInfoPanel({ trigger, close, panel, heading, container, signal }: InfoPanelParts) {
  const setOpen = (open: boolean, { restoreFocus = true } = {}) => {
    trigger.setAttribute('aria-expanded', String(open));
    panel.dataset.open = String(open);
    panel.inert = !open;
    container.toggleAttribute('data-info-open', open);
    if (open) {
      heading.focus({ preventScroll: true });
    } else if (restoreFocus && panel.contains((panel.getRootNode() as Document | ShadowRoot).activeElement)) {
      trigger.focus();
    }
  };

  trigger.addEventListener('click', () => setOpen(trigger.getAttribute('aria-expanded') !== 'true'), { signal });
  close.addEventListener('click', () => setOpen(false), { signal });
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
  }, { signal });
}

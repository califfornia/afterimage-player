/**
 * Skin-level state that Video.js does not track: whether the reel is being
 * inspected (paused), the frame rate the interface steps by, and viewer
 * preferences. Playback state itself always comes from the Video.js store.
 *
 * Each <afterimage-skin> owns one session, so several players can share a page.
 */

export type FrameRateSource = 'measured' | 'assumed';

export interface SessionState {
  inspecting: boolean;
  /** Frames per second used for frame numbers, timecode and frame stepping. */
  fps: number;
  fpsSource: FrameRateSource;
  /** Show storyboard stills in the frame index. */
  stills: boolean;
}

/**
 * Used until the frame rate is measured from decoded frames. 24 fps is the
 * cinema convention; the interface labels it as assumed.
 */
export const FALLBACK_FPS = 24;

type Listener = (state: SessionState) => void;

export interface Session {
  get(): SessionState;
  set(patch: Partial<SessionState>): void;
  subscribe(listener: Listener): () => void;
}

export function createSession(): Session {
  let state: SessionState = {
    inspecting: false,
    fps: FALLBACK_FPS,
    fpsSource: 'assumed',
    stills: true,
  };
  const listeners = new Set<Listener>();

  return {
    get: () => state,
    set(patch) {
      const next = { ...state, ...patch };
      const changed = (Object.keys(patch) as (keyof SessionState)[]).some((key) => next[key] !== state[key]);
      if (!changed) return;
      state = next;
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Elements used outside a skin still work, against a shared fallback session. */
const detached = createSession();

/** The session of the <afterimage-skin> whose shadow root holds `element`. */
export function sessionOf(element: Element): Session {
  const root = element.getRootNode();
  const host = root instanceof ShadowRoot ? (root.host as Element & { afterimageSession?: Session }) : null;
  return host?.afterimageSession ?? detached;
}

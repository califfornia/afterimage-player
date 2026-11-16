import type { VideoPlayerStore } from '@videojs/html';

/** Snapshot of the Video.js video-preset store. */
export type VideoState = VideoPlayerStore['state'];

/**
 * Typed selector for PlayerController. The preset controller's selector
 * parameter resolves the state as `unknown` in 10.4.0, so this narrows it
 * to the video preset's state once, here, instead of at every call site.
 */
export const select =
  <Result>(fn: (state: VideoState) => Result) =>
  (state: unknown): Result =>
    fn(state as VideoState);

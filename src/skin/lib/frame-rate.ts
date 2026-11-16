/**
 * Measures the frame rate of a playing <video> from the frames the browser
 * actually presents (requestVideoFrameCallback). Media elements do not expose
 * a frame rate, so this is the most reliable signal available in the browser.
 *
 * The estimate is the median interval between consecutively presented frames,
 * snapped to a standard rate when it is within 0.5% of one. Until enough
 * frames have been seen, or where the API is missing, the caller keeps its
 * fallback and labels it as assumed.
 */

const STANDARD_RATES = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60];
const SAMPLES_NEEDED = 24;

type FrameCallbackVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number; presentedFrames: number }) => void,
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

export function snapToStandardRate(fps: number): number | null {
  for (const rate of STANDARD_RATES) {
    if (Math.abs(fps - rate) / rate < 0.005) return rate;
  }
  return null;
}

export function measureFrameRate(video: HTMLVideoElement, onMeasured: (fps: number) => void): () => void {
  const target = video as FrameCallbackVideo;
  if (typeof target.requestVideoFrameCallback !== 'function') return () => {};

  const intervals: number[] = [];
  let last: { mediaTime: number; presentedFrames: number } | null = null;
  let handle = 0;
  let stopped = false;

  const onFrame = (_now: number, metadata: { mediaTime: number; presentedFrames: number }) => {
    if (stopped) return;
    // Only consecutive frames at normal speed give a clean interval.
    if (last && metadata.presentedFrames === last.presentedFrames + 1 && video.playbackRate === 1) {
      const delta = metadata.mediaTime - last.mediaTime;
      if (delta > 0.004 && delta < 0.1) intervals.push(delta);
    }
    last = { mediaTime: metadata.mediaTime, presentedFrames: metadata.presentedFrames };

    if (intervals.length >= SAMPLES_NEEDED) {
      const sorted = [...intervals].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const snapped = snapToStandardRate(1 / median);
      if (snapped) {
        stopped = true;
        onMeasured(snapped);
        return;
      }
      // Irregular cadence (dropped frames, variable frame rate): keep sampling.
      intervals.splice(0, intervals.length - SAMPLES_NEEDED);
    }
    handle = target.requestVideoFrameCallback!(onFrame);
  };

  const onSeekOrPause = () => {
    last = null;
  };
  video.addEventListener('seeking', onSeekOrPause);
  video.addEventListener('pause', onSeekOrPause);
  handle = target.requestVideoFrameCallback(onFrame);

  return () => {
    stopped = true;
    target.cancelVideoFrameCallback?.(handle);
    video.removeEventListener('seeking', onSeekOrPause);
    video.removeEventListener('pause', onSeekOrPause);
  };
}

/** Formatting for timecode, frame numbers and clock time. */

/** Nominal frame base for timecode: 23.976 counts as 24, 29.97 as 30. */
export function timecodeBase(fps: number): number {
  return Math.round(fps);
}

/** Zero-based index of the frame on screen at `time`. */
export function frameAt(time: number, fps: number): number {
  if (!Number.isFinite(time) || time <= 0) return 0;
  // A small epsilon keeps a seek to an exact frame boundary on that frame.
  return Math.floor(time * fps + 1e-4);
}

/** Time near the middle of a frame, so a seek lands inside it rather than on an edge. */
export function timeOfFrame(frame: number, fps: number): number {
  return (Math.max(0, frame) + 0.5) / fps;
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

/** Non-drop-frame SMPTE-style timecode: HH:MM:SS:FF. */
export function formatTimecode(time: number, fps: number): string {
  const base = timecodeBase(fps);
  const totalFrames = frameAt(time, fps);
  // Count whole seconds from real time so 23.976 material stays aligned with the clock.
  const seconds = Math.floor(Math.max(0, time) + 1e-4);
  const frames = Math.min(base - 1, totalFrames - Math.floor(seconds * fps + 1e-4));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(Math.max(0, frames))}`;
}

/** Six-digit frame counter, like the edge numbers on a reel. */
export function formatFrameNumber(frame: number): string {
  return pad(Math.max(0, frame), 6);
}

export function formatRate(fps: number): string {
  return Number.isInteger(fps) ? String(fps) : fps.toFixed(3);
}

/** Spoken form for live regions: "frame 291, 12 seconds". */
export function describeFrame(frame: number, time: number): string {
  const seconds = Math.floor(Math.max(0, time));
  return `Frame ${frame}, ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
}

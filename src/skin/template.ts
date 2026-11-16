/**
 * AFTERIMAGE skin template, cloned into the shadow root of <afterimage-skin>.
 *
 * The <media-container> is the skin's root, as in Video.js's own skins: it is
 * the fullscreen target, the activity surface and the hotkey scope. The page's
 * media element is slotted into the viewing surface; <afterimage-catalogue>
 * goes to a hidden slot and is read as data.
 */
export const template = /* html */ `
<media-container class="ai" data-status="loading" data-theme="afterimage" data-preset="video">
  <!-- A · Archive header -->
  <header class="ai-header">
    <div class="ai-brand">
      <span class="ai-wordmark">AFTERIMAGE</span>
      <span class="ai-descriptor">Moving image archive</span>
    </div>

    <dl class="ai-record" aria-label="Archive record">
      <div class="ai-record__id" data-field="id">
        <dt class="ai-sr">Archive identifier</dt>
        <dd data-bind="archiveId"></dd>
        <span class="ai-record__slash" aria-hidden="true">/</span>
        <dt class="ai-sr">Collection</dt>
        <dd data-bind="collection"></dd>
      </div>
      <div class="ai-record__title" data-field="title">
        <dt class="ai-sr">Title</dt>
        <dd><p class="ai-record__name" data-bind="title"></p></dd>
      </div>
    </dl>

    <div class="ai-header__end">
      <ai-status class="ai-status" aria-label="Player status"></ai-status>
      <button type="button" class="ai-icon-button" id="info-trigger" aria-expanded="false" aria-controls="archive-info" commandfor="tip-info">
        <media-icon family="afterimage" name="info"></media-icon>
        <span class="ai-sr">Archive information</span>
      </button>
      <media-tooltip id="tip-info" class="ai-tooltip" side="bottom">Archive information</media-tooltip>

      <button type="button" class="ai-icon-button" id="settings-trigger" commandfor="settings-menu" aria-label="Settings">
        <media-icon family="afterimage" name="settings"></media-icon>
      </button>
      <media-menu id="settings-menu" class="ai-menu" side="bottom" align="end">
        <media-menu-content class="ai-menu__page">
          <span class="ai-menu__heading" aria-hidden="true">Settings</span>
          <media-menu-item commandfor="settings-speed" class="ai-menu__item">
            <span>Playback speed</span>
            <span class="ai-menu__value"><span data-part="hint"></span><media-icon family="afterimage" name="chevron"></media-icon></span>
          </media-menu-item>
          <media-menu-separator class="ai-menu__rule"></media-menu-separator>
          <media-menu-checkbox-item class="ai-menu__item" id="setting-loop">
            <span>Loop reel</span>
            <media-menu-item-indicator class="ai-menu__check" force-mount><media-icon family="afterimage" name="check"></media-icon></media-menu-item-indicator>
          </media-menu-checkbox-item>
          <media-menu-checkbox-item class="ai-menu__item" id="setting-stills" checked>
            <span>Stills in frame index</span>
            <media-menu-item-indicator class="ai-menu__check" force-mount><media-icon family="afterimage" name="check"></media-icon></media-menu-item-indicator>
          </media-menu-checkbox-item>
        </media-menu-content>
        <media-menu-content id="settings-speed" class="ai-menu__page">
          <media-menu-item class="ai-menu__item ai-menu__back">
            <media-icon family="afterimage" name="chevron-back"></media-icon>
            <span>Playback speed</span>
          </media-menu-item>
          <media-playback-rate-radio-group class="ai-menu__group" aria-label="Playback speed">
            <template>
              <media-menu-radio-item class="ai-menu__item">
                <span data-part="label"></span>
                <media-menu-item-indicator class="ai-menu__check" force-mount><media-icon family="afterimage" name="check"></media-icon></media-menu-item-indicator>
              </media-menu-radio-item>
            </template>
          </media-playback-rate-radio-group>
        </media-menu-content>
      </media-menu>
    </div>
  </header>

  <div class="ai-body">
    <div class="ai-main">
      <p class="ai-rotate" id="rotate-hint" hidden>
        <media-icon family="afterimage" name="rotate"></media-icon>
        <span class="ai-rotate__text">Turn your phone sideways for the full viewer.</span>
        <button type="button" class="ai-icon-button" id="rotate-dismiss" aria-label="Dismiss">
          <media-icon family="afterimage" name="close"></media-icon>
        </button>
      </p>

      <!-- B · Viewing surface -->
      <div class="ai-surface">
        <!-- The page's <video> (or other Video.js media) is slotted here. -->
        <slot class="ai-media-slot"></slot>

        <span class="ai-reg ai-reg--tl" aria-hidden="true"></span>
        <span class="ai-reg ai-reg--tr" aria-hidden="true"></span>
        <span class="ai-reg ai-reg--bl" aria-hidden="true"></span>
        <span class="ai-reg ai-reg--br" aria-hidden="true"></span>

        <!-- Pause read-out: shown whenever the reel is paused (inspection) -->
        <div class="ai-hud" aria-hidden="true">
          <span class="ai-hud__tag"><media-icon family="afterimage" name="inspect"></media-icon>Paused · Inspect</span>
          <div class="ai-hud__readout">
            <span class="ai-hud__label">Frame</span>
            <ai-timecode class="ai-hud__frame" format="frame"></ai-timecode>
            <span class="ai-hud__label">Timecode</span>
            <ai-timecode class="ai-hud__tc"></ai-timecode>
            <ai-frame-rate class="ai-hud__fps"></ai-frame-rate>
          </div>
        </div>

        <!-- End of reel: the print goes into the fixer -->
        <div class="ai-fixed" aria-hidden="true">
          <span class="ai-fixed__stamp">Fixed</span>
          <span class="ai-fixed__meta">End of reel · <ai-timecode type="duration"></ai-timecode></span>
        </div>

        <div class="ai-loading" aria-hidden="true">
          <span class="ai-loading__label">Loading <span data-bind="loadingName"></span></span>
          <span class="ai-loading__bar"></span>
        </div>

        <media-buffering-indicator class="ai-buffering">
          <span class="ai-buffering__label">Buffering</span>
        </media-buffering-indicator>

        <media-error-dialog class="ai-error">
          <media-dialog-backdrop class="ai-error__backdrop"></media-dialog-backdrop>
          <media-dialog-popup class="ai-error__popup">
            <span class="ai-error__code" aria-hidden="true">Reel unavailable</span>
            <media-dialog-title class="ai-error__title"></media-dialog-title>
            <media-dialog-description class="ai-error__description"></media-dialog-description>
            <div class="ai-error__actions">
              <button type="button" class="ai-button ai-button--primary" id="error-retry">Retry</button>
              <media-dialog-close class="ai-button"></media-dialog-close>
            </div>
          </media-dialog-popup>
        </media-error-dialog>
      </div>

      <!-- C · Frame index -->
      <section class="ai-index" aria-labelledby="frame-index-heading">
        <div class="ai-index__meta">
          <h2 class="ai-index__heading" id="frame-index-heading">Frame index</h2>
          <ai-chapter-label class="ai-index__chapter"></ai-chapter-label>
          <span class="ai-index__source" id="stills-source"></span>
          <span class="ai-index__clock" aria-hidden="true">
            <ai-timecode class="ai-index__tc"></ai-timecode>
            <span class="ai-index__of">/</span>
            <ai-timecode class="ai-index__tc ai-index__tc--total" type="duration"></ai-timecode>
          </span>
        </div>

        <media-time-slider class="ai-slider" step="1" large-step="5" thumb-alignment="center" aria-describedby="frame-index-hint">
          <ai-chapter-ruler class="ai-ruler"></ai-chapter-ruler>
          <media-slider-track class="ai-track">
            <ai-contact-sheet class="ai-sheet"></ai-contact-sheet>
            <span class="ai-rail" aria-hidden="true">
              <media-slider-buffer class="ai-rail__buffer"></media-slider-buffer>
              <media-slider-fill class="ai-rail__fill"></media-slider-fill>
            </span>
          </media-slider-track>
          <media-slider-thumb class="ai-playhead"></media-slider-thumb>
          <media-slider-preview class="ai-loupe" overflow="clamp">
            <media-slider-thumbnail class="ai-loupe__image" crossorigin="anonymous"></media-slider-thumbnail>
            <span class="ai-loupe__caption">
              <media-time-slider-chapter-title class="ai-loupe__chapter"></media-time-slider-chapter-title>
              <media-slider-value type="pointer" class="ai-loupe__time"></media-slider-value>
            </span>
          </media-slider-preview>
        </media-time-slider>
        <p class="ai-sr" id="frame-index-hint">Arrow keys move one second, Page Up and Page Down move five seconds.</p>
      </section>

      <!-- D · Control deck -->
      <div class="ai-deck" role="group" aria-label="Playback controls">
        <div class="ai-deck__transport">
          <media-play-button class="ai-icon-button ai-icon-button--primary ai-play" commandfor="tip-play">
            <media-icon family="afterimage" name="play" class="ai-play__play"></media-icon>
            <media-icon family="afterimage" name="pause" class="ai-play__pause"></media-icon>
            <media-icon family="afterimage" name="restart" class="ai-play__restart"></media-icon>
          </media-play-button>
          <media-tooltip id="tip-play" class="ai-tooltip"><media-tooltip-label></media-tooltip-label><media-tooltip-shortcut></media-tooltip-shortcut></media-tooltip>

          <media-seek-button seconds="-5" class="ai-icon-button ai-seek" commandfor="tip-back">
            <media-icon family="afterimage" name="seek-back"></media-icon><span class="ai-seek__num" aria-hidden="true">5</span>
          </media-seek-button>
          <media-tooltip id="tip-back" class="ai-tooltip"><media-tooltip-label></media-tooltip-label></media-tooltip>

          <media-seek-button seconds="5" class="ai-icon-button ai-seek" commandfor="tip-forward">
            <span class="ai-seek__num" aria-hidden="true">5</span><media-icon family="afterimage" name="seek-forward"></media-icon>
          </media-seek-button>
          <media-tooltip id="tip-forward" class="ai-tooltip"><media-tooltip-label></media-tooltip-label></media-tooltip>
        </div>

        <div class="ai-deck__volume">
          <media-mute-button class="ai-icon-button ai-mute" commandfor="tip-mute">
            <media-icon family="afterimage" name="volume-high" class="ai-mute__high"></media-icon>
            <media-icon family="afterimage" name="volume-low" class="ai-mute__low"></media-icon>
            <media-icon family="afterimage" name="volume-off" class="ai-mute__off"></media-icon>
          </media-mute-button>
          <media-tooltip id="tip-mute" class="ai-tooltip"><media-tooltip-label></media-tooltip-label><media-tooltip-shortcut></media-tooltip-shortcut></media-tooltip>
          <media-volume-slider class="ai-volume">
            <media-slider-track class="ai-volume__track">
              <media-slider-fill class="ai-volume__fill"></media-slider-fill>
            </media-slider-track>
            <media-slider-thumb class="ai-volume__thumb"></media-slider-thumb>
          </media-volume-slider>
        </div>

        <media-time-group class="ai-clock">
          <media-time type="current" class="ai-clock__current"></media-time>
          <media-time-separator class="ai-clock__sep"></media-time-separator>
          <media-time type="duration" class="ai-clock__total"></media-time>
        </media-time-group>

        <ai-inspect class="ai-inspect" role="group" aria-label="Frame by frame">
          <button type="button" class="ai-inspect__nav" data-action="prev" aria-label="Previous frame" aria-keyshortcuts=", ArrowLeft" commandfor="tip-prev" disabled>
            <media-icon family="afterimage" name="frame-prev"></media-icon>
          </button>
          <media-tooltip id="tip-prev" class="ai-tooltip">Previous frame<kbd>,</kbd></media-tooltip>
          <span class="ai-inspect__counter" aria-hidden="true">
            <span class="ai-inspect__label">Frame</span>
            <ai-timecode class="ai-inspect__frame" format="frame"></ai-timecode>
          </span>
          <button type="button" class="ai-inspect__nav" data-action="next" aria-label="Next frame" aria-keyshortcuts=". ArrowRight" commandfor="tip-next" disabled>
            <media-icon family="afterimage" name="frame-next"></media-icon>
          </button>
          <media-tooltip id="tip-next" class="ai-tooltip">Next frame<kbd>.</kbd></media-tooltip>
          <span class="ai-sr" data-part="announcer" role="status"></span>
        </ai-inspect>

        <div class="ai-deck__end">
          <media-playback-rate-button class="ai-rate" commandfor="speed-menu"></media-playback-rate-button>
          <media-menu id="speed-menu" class="ai-menu ai-menu--compact" side="top" align="end">
            <media-menu-content class="ai-menu__page">
              <media-playback-rate-radio-group class="ai-menu__group" aria-label="Playback speed">
                <template>
                  <media-menu-radio-item class="ai-menu__item">
                    <span data-part="label"></span>
                    <media-menu-item-indicator class="ai-menu__check" force-mount><media-icon family="afterimage" name="check"></media-icon></media-menu-item-indicator>
                  </media-menu-radio-item>
                </template>
              </media-playback-rate-radio-group>
            </media-menu-content>
          </media-menu>

          <media-fullscreen-button class="ai-icon-button ai-fullscreen" commandfor="tip-fullscreen">
            <media-icon family="afterimage" name="fullscreen-enter" class="ai-fullscreen__enter"></media-icon>
            <media-icon family="afterimage" name="fullscreen-exit" class="ai-fullscreen__exit"></media-icon>
          </media-fullscreen-button>
          <media-tooltip id="tip-fullscreen" class="ai-tooltip" align="end"><media-tooltip-label></media-tooltip-label><media-tooltip-shortcut></media-tooltip-shortcut></media-tooltip>
        </div>
      </div>
    </div>

    <!-- Archive information panel -->
    <aside class="ai-info" id="archive-info" aria-labelledby="archive-info-heading" data-open="false" inert>
      <div class="ai-info__inner">
        <div class="ai-info__head">
          <h2 class="ai-info__heading" id="archive-info-heading" tabindex="-1">Catalogue card</h2>
          <button type="button" class="ai-icon-button" id="info-close" aria-label="Close archive information">
            <media-icon family="afterimage" name="close"></media-icon>
          </button>
        </div>
        <p class="ai-info__title" data-bind="title" data-field="title"></p>
        <dl class="ai-info__fields">
          <div data-field="archiveId"><dt>Archive ID</dt><dd data-bind="archiveId"></dd></div>
          <div data-field="collection"><dt>Collection</dt><dd data-bind="collection"></dd></div>
          <div data-field="format"><dt>Format</dt><dd data-bind="format"></dd></div>
          <div><dt>Duration</dt><dd><media-time type="duration" class="ai-info__duration"></media-time> <span class="ai-info__aside"><ai-timecode type="duration"></ai-timecode></span></dd></div>
          <div><dt>Frame rate</dt><dd><ai-frame-rate></ai-frame-rate></dd></div>
        </dl>
        <p class="ai-info__description" data-bind="description" data-field="description"></p>
        <p class="ai-info__source" data-bind="source" data-field="source"></p>
        <div class="ai-info__keys">
          <h3>Keys</h3>
          <dl>
            <div><dt><kbd>Space</kbd> <kbd>K</kbd></dt><dd>Play or pause</dd></div>
            <div><dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>5 s; one frame when paused</dd></div>
            <div><dt><kbd>,</kbd> <kbd>.</kbd></dt><dd>Pause, then previous or next frame</dd></div>
            <div><dt><kbd>M</kbd></dt><dd>Mute</dd></div>
            <div><dt><kbd>F</kbd></dt><dd>Fullscreen</dd></div>
            <div><dt><kbd>0</kbd>–<kbd>9</kbd></dt><dd>Jump to 0–90%</dd></div>
          </dl>
        </div>
      </div>
    </aside>
  </div>

  <!-- Player-wide behaviour -->
  <media-hotkey keys="Space" action="togglePaused"></media-hotkey>
  <media-hotkey keys="k" action="togglePaused"></media-hotkey>
  <media-hotkey keys="m" action="toggleMuted"></media-hotkey>
  <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
  <media-hotkey keys="ArrowLeft" action="seekStep" value="-5" data-inspect-yields></media-hotkey>
  <media-hotkey keys="ArrowRight" action="seekStep" value="5" data-inspect-yields></media-hotkey>
  <media-hotkey keys="ArrowUp" action="volumeStep" value="0.05"></media-hotkey>
  <media-hotkey keys="ArrowDown" action="volumeStep" value="-0.05"></media-hotkey>
  <media-hotkey keys="0-9" action="seekToPercent"></media-hotkey>
  <media-gesture type="tap" action="toggleControls" pointer="touch"></media-gesture>
  <media-status-announcer class="ai-sr"></media-status-announcer>

  <!-- <afterimage-catalogue> is data only: read by the skin, never rendered. -->
  <slot name="catalogue" hidden></slot>
</media-container>
`;

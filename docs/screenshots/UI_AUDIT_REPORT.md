# UI/UX Audit Report - docs/screenshots

## Table of Contents
- Executive Summary
- Methodology
- Findings by Category
- Per-Screenshot Findings
- Consistency / Drift Analysis
- Coverage Matrix
- Issue Ledger
- Action Plan
- Code Examples
- Mockups
- Design Token Harvest
- Appendix

## Executive Summary
- Strong visual cohesion across dark panels and neon accents; the UI reads as a single system.
- Large proportion of screenshots show low luminance variance (avg std_lum 27.1); contrast may be thin for microcopy.
- Control density is high; edge_density avg 0.138 with some dense outliers that can raise cognitive load.
- State coverage is good for hover/focus/empty, but true error/disabled coverage is limited in filenames.
- Many atomic controls are under 44px; verify touch targets for mobile layouts.

Critical recommendations:
1. Run a targeted contrast pass on small text, disabled states, and microcopy; confirm WCAG 2.2 AA.
2. Normalize action semantics (save/load/delete/reset) with consistent color and label hierarchy across panels.
3. Consolidate dense header/toolbars into grouped clusters with separators and clearer labels.
4. Ensure mobile touch targets >= 44px for atomic icons and toggles.
5. Add explicit error-state captures for forms and destructive actions to complete the state matrix.

## Methodology
- Screenshots source: /home/wtyler/circuitmind-ai/docs/screenshots (543 PNG files)
- Contact sheets generated via montage for full-collection visual sweep (28 sheets).
- Metrics computed via PIL + numpy: mean_lum, std_lum, white_ratio, edge_density (gradient threshold).
- Metadata via identify, exiftool, pngcheck; pHash for duplicate clustering.
- OCR explicitly skipped per user request (text length marked as "skipped").
- PNG optimization scan aborted to avoid long runtime; can be rerun if needed.
- No BASELINE_DIR provided: regression diffs not executed.
- No BASE_URL provided: Lighthouse/pa11y not executed.

## Findings by Category

1) Visual Design Analysis
- Evidence: 01-app-shell/app-full-page.png, 02-header/header-full.png, 03-panels/inventory-addnew-panel.png, 02-canvas-views/001_2d-diagram-generated_1920x1080.png
- Current state: strong dark theme with teal accents; avg mean_lum 30.1 indicates low overall brightness.
- Issues: thin contrast in microcopy and disabled states (std_lum < 10 in many captures). Severity: Medium.
- Reasoning: automated luminance variance + visual review of contact sheets.
- Recommendations:
  1. Introduce a slightly brighter secondary text token for microcopy and disabled labels.
  2. Reserve neon accent for primary actions only; use muted cyan for tertiary actions.
  3. Increase line-height for body microcopy by 1-2px to improve legibility.
- Priority: High. Effort: Medium.

2) Information Architecture Analysis
- Evidence: 03-inventory/04-tab-list-view.png, 03-panels/inventory-tab-list.png, 05-chat/chat-mode-button.png
- Current state: panel tabs and header actions are present; labeling is minimal.
- Issues: header actions and panel actions are close in style, reducing hierarchy. Severity: Medium.
- Reasoning: visual grouping from contact sheets.
- Recommendations:
  1. Add action grouping with separators and subtle background blocks.
  2. Add short labels or tooltips for icon-only actions to reduce recall burden.
- Priority: Medium. Effort: Low.

3) Interactive Elements Analysis
- Evidence: 08-buttons/*, 10-forms/*, 08-canvas/01-zoom-in-btn.png
- Current state: extensive state coverage for buttons/inputs (hover/focus/checked/unchecked).
- Issues: some atomic controls below 44px; touch target sizing risk. Severity: Low.
- Reasoning: metrics-based size scan + per-control review.
- Recommendations:
  1. Add invisible hit areas to icon buttons for mobile breakpoints.
  2. Standardize focus rings to a single thickness and color token.
- Priority: Medium. Effort: Low.

4) Technical Quality Assessment
- Evidence: pngcheck warning on 03-panels/inventory-header.png.
- Issues: zlib warning on PNG export (low risk). Severity: Low.
- Reasoning: pngcheck output.
- Recommendations: re-export the PNG with consistent zlib or rebuild asset pipeline.
- Priority: Low. Effort: Low.

5) User Experience Evaluation
- Evidence: 02-canvas-views/001_2d-diagram-generated_1920x1080.png, 07-responsive/*
- Current state: dense desktop UI with clear canvas centrality; responsive captures exist.
- Issues: empty/idle states are visible but limited in variety; error states rarely captured. Severity: Medium.
- Recommendations:
  1. Add explicit error state captures for input validation and action failures.
  2. Add contextual empty-state guidance in sidebars and diagram view.
- Priority: High. Effort: Medium.

## Per-Screenshot Findings
Checklist abbreviations: VH=Visual hierarchy, Grid=Alignment, Space=Spacing scale, Type=Typography, Cntr=Contrast, Cons=Consistency, Aff=Affordance, Fbk=Feedback state, Err=Error/empty/loading, Nav=Navigation awareness, Dens=Content density, Trunc=Truncation, Target=Touch target, A11y=Accessibility cues, Safety=Trust/safety cues

| Screenshot | Description | VH | Grid | Space | Type | Cntr | Cons | Aff | Fbk | Err | Nav | Dens | Trunc | Target | A11y | Safety |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `01-app-shell/001_empty-state_default_1920x1080.png` | 01-app-shell: 001 empty state default 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/01-default.png` | 01-app-shell: 01 default | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/02-fullpage.png` | 01-app-shell: 02 fullpage | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/03-1920x1080.png` | 01-app-shell: 03 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/04-1440x900.png` | 01-app-shell: 04 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/05-1024x768.png` | 01-app-shell: 05 1024x768 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/06-tablet.png` | 01-app-shell: 06 tablet | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/07-mobile.png` | 01-app-shell: 07 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1280x720.png` | 01-app-shell: app 1280x720 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1440x900.png` | 01-app-shell: app 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-1920x1080.png` | 01-app-shell: app 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-default-state.png` | 01-app-shell: app default state | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `01-app-shell/app-full-page.png` | 01-app-shell: app full page | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-canvas-views/001_2d-diagram-generated_1920x1080.png` | 02-canvas-views: 001 2d diagram generated 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-canvas-views/002_3d-view_1920x1080.png` | 02-canvas-views: 002 3d view 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-header/01-header-full.png` | 02-header: 01 header full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/02-logo.png` | 02-header: 02 logo | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/03-btn-undo.png` | 02-header: 03 btn undo | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/04-btn-redo.png` | 02-header: 04 btn redo | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/05-btn-save.png` | 02-header: 05 btn save | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/06-btn-load.png` | 02-header: 06 btn load | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/07-btn-settings.png` | 02-header: 07 btn settings | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/header-full.png` | 02-header: header full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `02-header/load-button.png` | 02-header: load button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/logo.png` | 02-header: logo | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/redo-button-disabled.png` | 02-header: redo button disabled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/save-button.png` | 02-header: save button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `02-header/settings-button.png` | 02-header: settings button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/undo-button-disabled.png` | 02-header: undo button disabled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `02-header/voice-mode-button.png` | 02-header: voice mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `03-inventory/01-panel-open.png` | 03-inventory: 01 panel open | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/02-panel-locked.png` | 03-inventory: 02 panel locked | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/03-tab-add-new-btn.png` | 03-inventory: 03 tab add new btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/03-tab-list-btn.png` | 03-inventory: 03 tab list btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/03-tab-tools-btn.png` | 03-inventory: 03 tab tools btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-inventory/04-tab-add-new-view.png` | 03-inventory: 04 tab add new view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/04-tab-list-view.png` | 03-inventory: 04 tab list view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-inventory/04-tab-tools-view.png` | 03-inventory: 04 tab tools view | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-addnew-panel.png` | 03-panels: inventory addnew panel | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-category-actuator.png` | 03-panels: inventory category actuator | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-microcontroller.png` | 03-panels: inventory category microcontroller | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-other.png` | 03-panels: inventory category other | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-power.png` | 03-panels: inventory category power | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-category-sensor.png` | 03-panels: inventory category sensor | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-filter-active.png` | 03-panels: inventory filter active | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-filter-input.png` | 03-panels: inventory filter input | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-header.png` | 03-panels: inventory header | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-panel-locked.png` | 03-panels: inventory panel locked | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-panel-open.png` | 03-panels: inventory panel open | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-panels/inventory-tab-addnew.png` | 03-panels: inventory tab addnew | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tab-list.png` | 03-panels: inventory tab list | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tab-tools.png` | 03-panels: inventory tab tools | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `03-panels/inventory-tools-panel.png` | 03-panels: inventory tools panel | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `03-sidebars/001_inventory-panel_open_1920x1080.png` | 03-sidebars: 001 inventory panel open 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/01-arduino-uno-r35v-arduino--hover.png` | 04-components: 01 arduino uno r35v arduino  hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/01-arduino-uno-r35v-arduino-.png` | 04-components: 01 arduino uno r35v arduino  | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/02-arduino-mega-2560-r35v-ar-hover.png` | 04-components: 02 arduino mega 2560 r35v ar hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/02-arduino-mega-2560-r35v-ar.png` | 04-components: 02 arduino mega 2560 r35v ar | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/03-esp32-devkit-38-pin3-3v-d-hover.png` | 04-components: 03 esp32 devkit 38 pin3 3v d hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/03-esp32-devkit-38-pin3-3v-d.png` | 04-components: 03 esp32 devkit 38 pin3 3v d | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/04-nodemcu-esp8266-amica-v23-hover.png` | 04-components: 04 nodemcu esp8266 amica v23 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/04-nodemcu-esp8266-amica-v23.png` | 04-components: 04 nodemcu esp8266 amica v23 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/05-sparkfun-blynk-boardesp82-hover.png` | 04-components: 05 sparkfun blynk boardesp82 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/05-sparkfun-blynk-boardesp82.png` | 04-components: 05 sparkfun blynk boardesp82 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/06-dccduino-nanoarduino-nano-hover.png` | 04-components: 06 dccduino nanoarduino nano hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/06-dccduino-nanoarduino-nano.png` | 04-components: 06 dccduino nanoarduino nano | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/07-hc-sr04-ultrasonic-sensor-hover.png` | 04-components: 07 hc sr04 ultrasonic sensor hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/07-hc-sr04-ultrasonic-sensor.png` | 04-components: 07 hc sr04 ultrasonic sensor | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/08-hc-sr501-pir-motion-senso-hover.png` | 04-components: 08 hc sr501 pir motion senso hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/08-hc-sr501-pir-motion-senso.png` | 04-components: 08 hc sr501 pir motion senso | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/09-dht11-temperature---humid-hover.png` | 04-components: 09 dht11 temperature   humid hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/09-dht11-temperature---humid.png` | 04-components: 09 dht11 temperature   humid | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/10-gy-521-mpu6050-6-dof-imu6-hover.png` | 04-components: 10 gy 521 mpu6050 6 dof imu6 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-components/10-gy-521-mpu6050-6-dof-imu6.png` | 04-components: 10 gy 521 mpu6050 6 dof imu6 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-full.png` | 04-modals: component editor full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-3d-model.png` | 04-modals: component editor tab 3d model | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-edit.png` | 04-modals: component editor tab edit | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-image.png` | 04-modals: component editor tab image | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/component-editor-tab-info.png` | 04-modals: component editor tab info | Fail | Pass | Pass | Fail | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-apikey-tab.png` | 04-modals: settings apikey tab | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-autonomy-tab.png` | 04-modals: settings autonomy tab | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-modals/settings-modal-full.png` | 04-modals: settings modal full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/001_settings-api-key_1920x1080.png` | 04-settings-modal: 001 settings api key 1920x1080 | Fail | Pass | Pass | Fail | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/002_settings-ai-autonomy_1920x1080.png` | 04-settings-modal: 002 settings ai autonomy 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `04-settings-modal/003_settings-layout_1920x1080.png` | 04-settings-modal: 003 settings layout 1920x1080 | Pass | Pass | Pass | Pass | Fail | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-chat/chat-attach-button.png` | 05-chat: chat attach button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-deep-thinking-toggle.png` | 05-chat: chat deep thinking toggle | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-input-empty.png` | 05-chat: chat input empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/chat-input-with-text.png` | 05-chat: chat input with text | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/chat-minimize-button.png` | 05-chat: chat minimize button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-minimized.png` | 05-chat: chat minimized | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-chat/chat-mode-button.png` | 05-chat: chat mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/chat-session-button.png` | 05-chat: chat session button | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-chat/image-mode-button.png` | 05-chat: image mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-chat/video-mode-button.png` | 05-chat: video mode button | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `05-component-editor/001_component-editor-info_1920x1080.png` | 05-component-editor: 001 component editor info 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-component-editor/002_component-editor-edit_1920x1080.png` | 05-component-editor: 002 component editor edit 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/01-editor-full.png` | 05-modals: 01 editor full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-3d-model.png` | 05-modals: 02 editor tab 3d model | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-edit.png` | 05-modals: 02 editor tab edit | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-image.png` | 05-modals: 02 editor tab image | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/02-editor-tab-info.png` | 05-modals: 02 editor tab info | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `05-modals/04-ai-assistant-btn.png` | 05-modals: 04 ai assistant btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `05-modals/05-editor-with-ai-chat.png` | 05-modals: 05 editor with ai chat | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-canvas/canvas-awaiting-message.png` | 06-canvas: canvas awaiting message | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `06-canvas/canvas-dragdrop-hint.png` | 06-canvas: canvas dragdrop hint | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-canvas/canvas-empty.png` | 06-canvas: canvas empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | Pass | NA | NA |
| `06-interactive-states/001_conversation-switcher-dropdown_1920x1080.png` | 06-interactive-states: 001 conversation switcher dropdown 1920x1080 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/01-settings-full.png` | 06-settings: 01 settings full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/02-tab-ai-autonomy.png` | 06-settings: 02 tab ai autonomy | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `06-settings/02-tab-api-key.png` | 06-settings: 02 tab api key | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-chat/01-panel-full.png` | 07-chat: 01 panel full | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-chat/02-input.png` | 07-chat: 02 input | Pass | Pass | Pass | Pass | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/03-mode-selector.png` | 07-chat: 03 mode selector | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-1.png` | 07-chat: 04 mode btn 1 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-2.png` | 07-chat: 04 mode btn 2 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/04-mode-btn-3.png` | 07-chat: 04 mode btn 3 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/05-send-btn.png` | 07-chat: 05 send btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/06-upload-btn.png` | 07-chat: 06 upload btn | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-chat/07-messages-area.png` | 07-chat: 07 messages area | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-0.png` | 07-inventory-components: component 0 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-1.png` | 07-inventory-components: component 1 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-2.png` | 07-inventory-components: component 2 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-inventory-components/component-3.png` | 07-inventory-components: component 3 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-4.png` | 07-inventory-components: component 4 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-5.png` | 07-inventory-components: component 5 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-inventory-components/component-6.png` | 07-inventory-components: component 6 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-7.png` | 07-inventory-components: component 7 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | Pass | NA | Pass | NA | NA |
| `07-inventory-components/component-8.png` | 07-inventory-components: component 8 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `07-responsive/001_2d-diagram_1440x900.png` | 07-responsive: 001 2d diagram 1440x900 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/002_2d-diagram_1024x768.png` | 07-responsive: 002 2d diagram 1024x768 | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/003_2d-diagram_768x1024_tablet.png` | 07-responsive: 003 2d diagram 768x1024 tablet | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/004_2d-diagram_430x932_mobile.png` | 07-responsive: 004 2d diagram 430x932 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/005_2d-diagram_393x852_mobile.png` | 07-responsive: 005 2d diagram 393x852 mobile | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/006_2d-diagram_375x667_mobile-se.png` | 07-responsive: 006 2d diagram 375x667 mobile se | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `07-responsive/007_2d-diagram_320x568_mobile-legacy.png` | 07-responsive: 007 2d diagram 320x568 mobile legacy | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `08-buttons/--normal.png` | 08-buttons:   normal | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/add-new-normal.png` | 08-buttons: add new normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/add-to-diagram-normal.png` | 08-buttons: add to diagram normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/attach-image-or-video-hover.png` | 08-buttons: attach image or video hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/attach-image-or-video-normal.png` | 08-buttons: attach image or video normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-0-hover.png` | 08-buttons: btn 0 hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-0-normal.png` | 08-buttons: btn 0 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-10-normal.png` | 08-buttons: btn 10 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-100-normal.png` | 08-buttons: btn 100 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-101-normal.png` | 08-buttons: btn 101 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-104-normal.png` | 08-buttons: btn 104 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-105-normal.png` | 08-buttons: btn 105 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-106-normal.png` | 08-buttons: btn 106 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-107-normal.png` | 08-buttons: btn 107 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-11-normal.png` | 08-buttons: btn 11 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-110-normal.png` | 08-buttons: btn 110 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-111-normal.png` | 08-buttons: btn 111 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-112-normal.png` | 08-buttons: btn 112 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-113-normal.png` | 08-buttons: btn 113 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-116-normal.png` | 08-buttons: btn 116 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-117-normal.png` | 08-buttons: btn 117 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-118-normal.png` | 08-buttons: btn 118 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-119-normal.png` | 08-buttons: btn 119 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-122-normal.png` | 08-buttons: btn 122 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-123-normal.png` | 08-buttons: btn 123 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-124-normal.png` | 08-buttons: btn 124 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-125-normal.png` | 08-buttons: btn 125 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-128-normal.png` | 08-buttons: btn 128 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-129-normal.png` | 08-buttons: btn 129 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-130-normal.png` | 08-buttons: btn 130 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-131-normal.png` | 08-buttons: btn 131 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-134-normal.png` | 08-buttons: btn 134 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-135-normal.png` | 08-buttons: btn 135 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-136-normal.png` | 08-buttons: btn 136 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-137-normal.png` | 08-buttons: btn 137 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-14-normal.png` | 08-buttons: btn 14 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-140-normal.png` | 08-buttons: btn 140 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-141-normal.png` | 08-buttons: btn 141 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-142-normal.png` | 08-buttons: btn 142 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-143-normal.png` | 08-buttons: btn 143 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-146-normal.png` | 08-buttons: btn 146 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-147-normal.png` | 08-buttons: btn 147 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-148-normal.png` | 08-buttons: btn 148 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-149-normal.png` | 08-buttons: btn 149 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-15-normal.png` | 08-buttons: btn 15 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-152-normal.png` | 08-buttons: btn 152 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-153-normal.png` | 08-buttons: btn 153 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-154-normal.png` | 08-buttons: btn 154 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-155-normal.png` | 08-buttons: btn 155 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-158-normal.png` | 08-buttons: btn 158 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-159-normal.png` | 08-buttons: btn 159 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-16-normal.png` | 08-buttons: btn 16 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-160-normal.png` | 08-buttons: btn 160 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-161-normal.png` | 08-buttons: btn 161 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-164-normal.png` | 08-buttons: btn 164 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-165-normal.png` | 08-buttons: btn 165 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-166-normal.png` | 08-buttons: btn 166 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-167-normal.png` | 08-buttons: btn 167 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-17-normal.png` | 08-buttons: btn 17 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-170-normal.png` | 08-buttons: btn 170 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-171-normal.png` | 08-buttons: btn 171 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-172-normal.png` | 08-buttons: btn 172 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-173-normal.png` | 08-buttons: btn 173 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-176-normal.png` | 08-buttons: btn 176 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-177-normal.png` | 08-buttons: btn 177 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-178-normal.png` | 08-buttons: btn 178 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-179-normal.png` | 08-buttons: btn 179 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-182-normal.png` | 08-buttons: btn 182 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-183-normal.png` | 08-buttons: btn 183 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-184-normal.png` | 08-buttons: btn 184 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-185-normal.png` | 08-buttons: btn 185 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-188-normal.png` | 08-buttons: btn 188 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-189-normal.png` | 08-buttons: btn 189 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-190-normal.png` | 08-buttons: btn 190 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-191-normal.png` | 08-buttons: btn 191 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-194-normal.png` | 08-buttons: btn 194 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-195-normal.png` | 08-buttons: btn 195 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-196-normal.png` | 08-buttons: btn 196 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-197-normal.png` | 08-buttons: btn 197 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-2-normal.png` | 08-buttons: btn 2 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-20-normal.png` | 08-buttons: btn 20 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-200-normal.png` | 08-buttons: btn 200 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-201-normal.png` | 08-buttons: btn 201 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-202-normal.png` | 08-buttons: btn 202 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-203-normal.png` | 08-buttons: btn 203 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-206-normal.png` | 08-buttons: btn 206 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-207-normal.png` | 08-buttons: btn 207 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-208-normal.png` | 08-buttons: btn 208 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-209-normal.png` | 08-buttons: btn 209 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-21-normal.png` | 08-buttons: btn 21 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-212-normal.png` | 08-buttons: btn 212 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-213-normal.png` | 08-buttons: btn 213 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-214-normal.png` | 08-buttons: btn 214 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-215-normal.png` | 08-buttons: btn 215 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-218-normal.png` | 08-buttons: btn 218 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-219-normal.png` | 08-buttons: btn 219 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-22-normal.png` | 08-buttons: btn 22 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-220-normal.png` | 08-buttons: btn 220 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-221-normal.png` | 08-buttons: btn 221 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-224-normal.png` | 08-buttons: btn 224 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-225-normal.png` | 08-buttons: btn 225 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-226-normal.png` | 08-buttons: btn 226 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-227-normal.png` | 08-buttons: btn 227 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-23-normal.png` | 08-buttons: btn 23 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-230-normal.png` | 08-buttons: btn 230 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-231-normal.png` | 08-buttons: btn 231 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-232-normal.png` | 08-buttons: btn 232 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-233-normal.png` | 08-buttons: btn 233 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-236-normal.png` | 08-buttons: btn 236 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-237-normal.png` | 08-buttons: btn 237 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-238-normal.png` | 08-buttons: btn 238 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-239-normal.png` | 08-buttons: btn 239 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-242-normal.png` | 08-buttons: btn 242 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-243-normal.png` | 08-buttons: btn 243 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-244-normal.png` | 08-buttons: btn 244 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-245-normal.png` | 08-buttons: btn 245 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-248-normal.png` | 08-buttons: btn 248 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-249-normal.png` | 08-buttons: btn 249 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-250-normal.png` | 08-buttons: btn 250 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-251-normal.png` | 08-buttons: btn 251 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-254-normal.png` | 08-buttons: btn 254 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-255-normal.png` | 08-buttons: btn 255 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-256-normal.png` | 08-buttons: btn 256 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-257-normal.png` | 08-buttons: btn 257 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-26-normal.png` | 08-buttons: btn 26 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-260-normal.png` | 08-buttons: btn 260 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-261-normal.png` | 08-buttons: btn 261 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-262-normal.png` | 08-buttons: btn 262 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-263-normal.png` | 08-buttons: btn 263 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-266-normal.png` | 08-buttons: btn 266 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-267-normal.png` | 08-buttons: btn 267 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-268-normal.png` | 08-buttons: btn 268 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-269-normal.png` | 08-buttons: btn 269 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-27-normal.png` | 08-buttons: btn 27 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-272-normal.png` | 08-buttons: btn 272 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-273-normal.png` | 08-buttons: btn 273 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-274-normal.png` | 08-buttons: btn 274 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-275-normal.png` | 08-buttons: btn 275 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-278-normal.png` | 08-buttons: btn 278 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-279-normal.png` | 08-buttons: btn 279 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-28-normal.png` | 08-buttons: btn 28 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-280-normal.png` | 08-buttons: btn 280 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-281-normal.png` | 08-buttons: btn 281 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-284-normal.png` | 08-buttons: btn 284 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-285-normal.png` | 08-buttons: btn 285 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-286-normal.png` | 08-buttons: btn 286 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-287-normal.png` | 08-buttons: btn 287 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-29-normal.png` | 08-buttons: btn 29 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-290-normal.png` | 08-buttons: btn 290 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-291-normal.png` | 08-buttons: btn 291 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-292-normal.png` | 08-buttons: btn 292 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-293-normal.png` | 08-buttons: btn 293 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-296-normal.png` | 08-buttons: btn 296 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-297-normal.png` | 08-buttons: btn 297 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-298-normal.png` | 08-buttons: btn 298 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-299-normal.png` | 08-buttons: btn 299 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-302-normal.png` | 08-buttons: btn 302 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-303-normal.png` | 08-buttons: btn 303 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-304-normal.png` | 08-buttons: btn 304 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-305-normal.png` | 08-buttons: btn 305 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-308-normal.png` | 08-buttons: btn 308 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-309-normal.png` | 08-buttons: btn 309 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-310-normal.png` | 08-buttons: btn 310 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-311-normal.png` | 08-buttons: btn 311 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-314-normal.png` | 08-buttons: btn 314 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-315-normal.png` | 08-buttons: btn 315 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-316-normal.png` | 08-buttons: btn 316 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-317-normal.png` | 08-buttons: btn 317 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-32-normal.png` | 08-buttons: btn 32 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-320-normal.png` | 08-buttons: btn 320 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-321-normal.png` | 08-buttons: btn 321 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-322-normal.png` | 08-buttons: btn 322 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-33-normal.png` | 08-buttons: btn 33 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-34-normal.png` | 08-buttons: btn 34 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-35-normal.png` | 08-buttons: btn 35 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-38-normal.png` | 08-buttons: btn 38 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-39-normal.png` | 08-buttons: btn 39 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-40-normal.png` | 08-buttons: btn 40 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-41-normal.png` | 08-buttons: btn 41 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-44-normal.png` | 08-buttons: btn 44 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-45-normal.png` | 08-buttons: btn 45 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-46-normal.png` | 08-buttons: btn 46 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-47-normal.png` | 08-buttons: btn 47 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-50-normal.png` | 08-buttons: btn 50 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-51-normal.png` | 08-buttons: btn 51 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-52-normal.png` | 08-buttons: btn 52 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-53-normal.png` | 08-buttons: btn 53 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-56-normal.png` | 08-buttons: btn 56 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-57-normal.png` | 08-buttons: btn 57 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-58-normal.png` | 08-buttons: btn 58 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-59-normal.png` | 08-buttons: btn 59 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-62-normal.png` | 08-buttons: btn 62 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-63-normal.png` | 08-buttons: btn 63 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-64-normal.png` | 08-buttons: btn 64 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-65-normal.png` | 08-buttons: btn 65 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-68-normal.png` | 08-buttons: btn 68 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-69-normal.png` | 08-buttons: btn 69 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-70-normal.png` | 08-buttons: btn 70 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-71-normal.png` | 08-buttons: btn 71 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-74-normal.png` | 08-buttons: btn 74 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-75-normal.png` | 08-buttons: btn 75 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-76-normal.png` | 08-buttons: btn 76 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-77-normal.png` | 08-buttons: btn 77 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-8-normal.png` | 08-buttons: btn 8 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-80-normal.png` | 08-buttons: btn 80 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-81-normal.png` | 08-buttons: btn 81 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-82-normal.png` | 08-buttons: btn 82 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-83-normal.png` | 08-buttons: btn 83 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-86-normal.png` | 08-buttons: btn 86 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-87-normal.png` | 08-buttons: btn 87 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-88-normal.png` | 08-buttons: btn 88 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-89-normal.png` | 08-buttons: btn 89 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-9-normal.png` | 08-buttons: btn 9 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-92-normal.png` | 08-buttons: btn 92 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-93-normal.png` | 08-buttons: btn 93 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-94-normal.png` | 08-buttons: btn 94 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-95-normal.png` | 08-buttons: btn 95 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-98-normal.png` | 08-buttons: btn 98 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/btn-99-normal.png` | 08-buttons: btn 99 normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/chat-mode-hover.png` | 08-buttons: chat mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/chat-mode-normal.png` | 08-buttons: chat mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/circuitmind-session-hover.png` | 08-buttons: circuitmind session hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/circuitmind-session-normal.png` | 08-buttons: circuitmind session normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/delete-item-normal.png` | 08-buttons: delete item normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/edit-details-normal.png` | 08-buttons: edit details normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/enable-deep-thinking-hover.png` | 08-buttons: enable deep thinking hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/enable-deep-thinking-normal.png` | 08-buttons: enable deep thinking normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/generate-thumbnail-normal.png` | 08-buttons: generate thumbnail normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/image-mode-hover.png` | 08-buttons: image mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/image-mode-normal.png` | 08-buttons: image mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/list-normal.png` | 08-buttons: list normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/load-hover.png` | 08-buttons: load hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/load-normal.png` | 08-buttons: load normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/lock-sidebar-open-normal.png` | 08-buttons: lock sidebar open normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/minimize-chat-hover.png` | 08-buttons: minimize chat hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/minimize-chat-normal.png` | 08-buttons: minimize chat normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-inventory-hover.png` | 08-buttons: open inventory hover | Pass | Pass | Pass | Pass | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-inventory-normal.png` | 08-buttons: open inventory normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-settings-hover.png` | 08-buttons: open settings hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/open-settings-normal.png` | 08-buttons: open settings normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/redo-hover.png` | 08-buttons: redo hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/redo-normal.png` | 08-buttons: redo normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/save-hover.png` | 08-buttons: save hover | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/save-normal.png` | 08-buttons: save normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/send-message-hover.png` | 08-buttons: send message hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/send-message-normal.png` | 08-buttons: send message normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/toggle-live-voice-mode-hover.png` | 08-buttons: toggle live voice mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/toggle-live-voice-mode-normal.png` | 08-buttons: toggle live voice mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/tools-normal.png` | 08-buttons: tools normal | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-buttons/undo-hover.png` | 08-buttons: undo hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/undo-normal.png` | 08-buttons: undo normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/video-mode-hover.png` | 08-buttons: video mode hover | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Pass | NA | NA |
| `08-buttons/video-mode-normal.png` | 08-buttons: video mode normal | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Pass | NA | NA |
| `08-canvas/01-zoom-in-btn.png` | 08-canvas: 01 zoom in btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/02-zoom-out-btn.png` | 08-canvas: 02 zoom out btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/03-reset-view-btn.png` | 08-canvas: 03 reset view btn | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/04-search-input.png` | 08-canvas: 04 search input | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `08-canvas/06-full-workspace.png` | 08-canvas: 06 full workspace | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `08-canvas/07-full-workspace.png` | 08-canvas: 07 full workspace | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | Pass | Pass | NA | Pass | NA | NA |
| `10-forms/ask-about-your-circuit----empty.png` | 10-forms: ask about your circuit    empty | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/ask-about-your-circuit----filled.png` | 10-forms: ask about your circuit    filled | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/ask-about-your-circuit----focus.png` | 10-forms: ask about your circuit    focus | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/checkbox-0-unchecked.png` | 10-forms: checkbox 0 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-1-unchecked.png` | 10-forms: checkbox 1 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-2-unchecked.png` | 10-forms: checkbox 2 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-3-unchecked.png` | 10-forms: checkbox 3 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-4-unchecked.png` | 10-forms: checkbox 4 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-5-unchecked.png` | 10-forms: checkbox 5 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-6-unchecked.png` | 10-forms: checkbox 6 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-7-unchecked.png` | 10-forms: checkbox 7 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-8-unchecked.png` | 10-forms: checkbox 8 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/checkbox-9-unchecked.png` | 10-forms: checkbox 9 unchecked | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----empty.png` | 10-forms: filter assets    empty | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----filled.png` | 10-forms: filter assets    filled | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/filter-assets----focus.png` | 10-forms: filter assets    focus | Pass | Pass | Pass | NA | Pass | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-1-empty.png` | 10-forms: input 1 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-1-focus.png` | 10-forms: input 1 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-10-empty.png` | 10-forms: input 10 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-10-focus.png` | 10-forms: input 10 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-11-empty.png` | 10-forms: input 11 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-11-focus.png` | 10-forms: input 11 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-12-empty.png` | 10-forms: input 12 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-12-focus.png` | 10-forms: input 12 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-13-empty.png` | 10-forms: input 13 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-13-focus.png` | 10-forms: input 13 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-14-empty.png` | 10-forms: input 14 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-14-focus.png` | 10-forms: input 14 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-15-empty.png` | 10-forms: input 15 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-15-focus.png` | 10-forms: input 15 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-16-empty.png` | 10-forms: input 16 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-16-focus.png` | 10-forms: input 16 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-17-empty.png` | 10-forms: input 17 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-17-focus.png` | 10-forms: input 17 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-18-empty.png` | 10-forms: input 18 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-18-focus.png` | 10-forms: input 18 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-19-empty.png` | 10-forms: input 19 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-19-focus.png` | 10-forms: input 19 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-2-empty.png` | 10-forms: input 2 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-2-focus.png` | 10-forms: input 2 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-20-empty.png` | 10-forms: input 20 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-20-focus.png` | 10-forms: input 20 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-21-empty.png` | 10-forms: input 21 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-21-focus.png` | 10-forms: input 21 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-22-empty.png` | 10-forms: input 22 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-22-focus.png` | 10-forms: input 22 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-23-empty.png` | 10-forms: input 23 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-23-focus.png` | 10-forms: input 23 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-24-empty.png` | 10-forms: input 24 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-24-focus.png` | 10-forms: input 24 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-25-empty.png` | 10-forms: input 25 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-25-focus.png` | 10-forms: input 25 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-26-empty.png` | 10-forms: input 26 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-26-focus.png` | 10-forms: input 26 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-27-empty.png` | 10-forms: input 27 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-27-focus.png` | 10-forms: input 27 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-28-empty.png` | 10-forms: input 28 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-28-focus.png` | 10-forms: input 28 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-29-empty.png` | 10-forms: input 29 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-29-focus.png` | 10-forms: input 29 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-3-empty.png` | 10-forms: input 3 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-3-focus.png` | 10-forms: input 3 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-30-empty.png` | 10-forms: input 30 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-30-focus.png` | 10-forms: input 30 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-31-empty.png` | 10-forms: input 31 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-31-focus.png` | 10-forms: input 31 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-32-empty.png` | 10-forms: input 32 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-32-focus.png` | 10-forms: input 32 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-33-empty.png` | 10-forms: input 33 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-33-focus.png` | 10-forms: input 33 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-34-empty.png` | 10-forms: input 34 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-34-focus.png` | 10-forms: input 34 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-35-empty.png` | 10-forms: input 35 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-35-focus.png` | 10-forms: input 35 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-36-empty.png` | 10-forms: input 36 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-36-focus.png` | 10-forms: input 36 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-37-empty.png` | 10-forms: input 37 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-37-focus.png` | 10-forms: input 37 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-38-empty.png` | 10-forms: input 38 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-38-focus.png` | 10-forms: input 38 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-39-empty.png` | 10-forms: input 39 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-39-focus.png` | 10-forms: input 39 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-4-empty.png` | 10-forms: input 4 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-4-focus.png` | 10-forms: input 4 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-40-empty.png` | 10-forms: input 40 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-40-focus.png` | 10-forms: input 40 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-41-empty.png` | 10-forms: input 41 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-41-focus.png` | 10-forms: input 41 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-42-empty.png` | 10-forms: input 42 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-42-focus.png` | 10-forms: input 42 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-43-empty.png` | 10-forms: input 43 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-43-focus.png` | 10-forms: input 43 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-44-empty.png` | 10-forms: input 44 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-44-focus.png` | 10-forms: input 44 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-45-empty.png` | 10-forms: input 45 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-45-focus.png` | 10-forms: input 45 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-46-empty.png` | 10-forms: input 46 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-46-focus.png` | 10-forms: input 46 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-47-empty.png` | 10-forms: input 47 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-47-focus.png` | 10-forms: input 47 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-48-empty.png` | 10-forms: input 48 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-48-focus.png` | 10-forms: input 48 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-49-empty.png` | 10-forms: input 49 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-49-focus.png` | 10-forms: input 49 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-5-empty.png` | 10-forms: input 5 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-5-focus.png` | 10-forms: input 5 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-50-empty.png` | 10-forms: input 50 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-50-focus.png` | 10-forms: input 50 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-51-empty.png` | 10-forms: input 51 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-51-focus.png` | 10-forms: input 51 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-52-empty.png` | 10-forms: input 52 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-52-focus.png` | 10-forms: input 52 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-53-empty.png` | 10-forms: input 53 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-53-focus.png` | 10-forms: input 53 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-54-empty.png` | 10-forms: input 54 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-54-focus.png` | 10-forms: input 54 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-55-empty.png` | 10-forms: input 55 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-55-focus.png` | 10-forms: input 55 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-56-empty.png` | 10-forms: input 56 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-56-focus.png` | 10-forms: input 56 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-57-empty.png` | 10-forms: input 57 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-57-focus.png` | 10-forms: input 57 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-58-empty.png` | 10-forms: input 58 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-58-focus.png` | 10-forms: input 58 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-59-empty.png` | 10-forms: input 59 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-59-focus.png` | 10-forms: input 59 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-6-empty.png` | 10-forms: input 6 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-6-focus.png` | 10-forms: input 6 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-60-empty.png` | 10-forms: input 60 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-60-focus.png` | 10-forms: input 60 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-61-empty.png` | 10-forms: input 61 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-61-focus.png` | 10-forms: input 61 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-62-empty.png` | 10-forms: input 62 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-62-focus.png` | 10-forms: input 62 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-7-empty.png` | 10-forms: input 7 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-7-focus.png` | 10-forms: input 7 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-8-empty.png` | 10-forms: input 8 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-8-focus.png` | 10-forms: input 8 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `10-forms/input-9-empty.png` | 10-forms: input 9 empty | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `10-forms/input-9-focus.png` | 10-forms: input 9 focus | Pass | Pass | Pass | NA | Fail | Pass | Pass | Pass | NA | NA | NA | NA | Fail | Pass | NA |
| `12-typography/h1-0.png` | 12-typography: h1 0 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h2-0.png` | 12-typography: h2 0 | Pass | Pass | Pass | NA | Pass | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-0.png` | 12-typography: h3 0 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-1.png` | 12-typography: h3 1 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-2.png` | 12-typography: h3 2 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-3.png` | 12-typography: h3 3 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-4.png` | 12-typography: h3 4 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |
| `12-typography/h3-5.png` | 12-typography: h3 5 | Pass | Pass | Pass | NA | Fail | Pass | Pass | NA | NA | NA | NA | NA | Fail | NA | NA |

Per-screenshot details:

### `01-app-shell/001_empty-state_default_1920x1080.png`
- Description: 01-app-shell: 001 empty state default 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=Pass, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=759720 bytes, OCR=skipped, edge_density=0.203, mean_lum=11.2, std_lum=11.2, white_ratio=0.000, phash=d4f0e9292d2b3b4c

### `01-app-shell/01-default.png`
- Description: 01-app-shell: 01 default
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37450 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=13.7, white_ratio=0.000, phash=c87ee26ee862e20b

### `01-app-shell/02-fullpage.png`
- Description: 01-app-shell: 02 fullpage
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=40220 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.5, std_lum=16.6, white_ratio=0.000, phash=c87ae83ea627a24b

### `01-app-shell/03-1920x1080.png`
- Description: 01-app-shell: 03 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1920x1080, file_size=45204 bytes, OCR=skipped, edge_density=0.018, mean_lum=27.1, std_lum=12.4, white_ratio=0.000, phash=e26eea7ab8389819

### `01-app-shell/04-1440x900.png`
- Description: 01-app-shell: 04 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1440x900, file_size=42508 bytes, OCR=skipped, edge_density=0.025, mean_lum=28.2, std_lum=14.5, white_ratio=0.000, phash=e868e87ab233b323

### `01-app-shell/05-1024x768.png`
- Description: 01-app-shell: 05 1024x768
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1024x768, file_size=39867 bytes, OCR=skipped, edge_density=0.036, mean_lum=29.7, std_lum=17.3, white_ratio=0.000, phash=c0f8e02eac2fae4e

### `01-app-shell/06-tablet.png`
- Description: 01-app-shell: 06 tablet
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 768x1024, file_size=42125 bytes, OCR=skipped, edge_density=0.034, mean_lum=28.8, std_lum=16.8, white_ratio=0.000, phash=c0f0f079a82fa83f

### `01-app-shell/07-mobile.png`
- Description: 01-app-shell: 07 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 375x812, file_size=29285 bytes, OCR=skipped, edge_density=0.057, mean_lum=31.2, std_lum=23.1, white_ratio=0.001, phash=80c8c06e637ee37e

### `01-app-shell/app-1280x720.png`
- Description: 01-app-shell: app 1280x720
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37933 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `01-app-shell/app-1440x900.png`
- Description: 01-app-shell: app 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1440x900, file_size=40254 bytes, OCR=skipped, edge_density=0.025, mean_lum=27.8, std_lum=15.6, white_ratio=0.000, phash=e86dea37b233a203

### `01-app-shell/app-1920x1080.png`
- Description: 01-app-shell: app 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1920x1080, file_size=43155 bytes, OCR=skipped, edge_density=0.018, mean_lum=26.6, std_lum=13.2, white_ratio=0.000, phash=e266ea7ab819b819

### `01-app-shell/app-default-state.png`
- Description: 01-app-shell: app default state
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=35957 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=16.4, white_ratio=0.000, phash=c86fe24de867e20c

### `01-app-shell/app-full-page.png`
- Description: 01-app-shell: app full page
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37933 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `02-canvas-views/001_2d-diagram-generated_1920x1080.png`
- Description: 02-canvas-views: 001 2d diagram generated 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272890 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `02-canvas-views/002_3d-view_1920x1080.png`
- Description: 02-canvas-views: 002 3d view 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=940439 bytes, OCR=skipped, edge_density=0.179, mean_lum=49.2, std_lum=50.1, white_ratio=0.006, phash=c3c3673e3c3c3c28

### `02-header/01-header-full.png`
- Description: 02-header: 01 header full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x56, file_size=8410 bytes, OCR=skipped, edge_density=0.070, mean_lum=25.5, std_lum=24.3, white_ratio=0.004, phash=eb7f0003ff7f0101

### `02-header/02-logo.png`
- Description: 02-header: 02 logo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3034 bytes, OCR=skipped, edge_density=0.286, mean_lum=57.6, std_lum=73.0, white_ratio=0.057, phash=8d1270ade49b8b76

### `02-header/03-btn-undo.png`
- Description: 02-header: 03 btn undo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 33x33, file_size=369 bytes, OCR=skipped, edge_density=0.077, mean_lum=21.4, std_lum=6.5, white_ratio=0.000, phash=cecd31b2cecd3032

### `02-header/04-btn-redo.png`
- Description: 02-header: 04 btn redo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 33x33, file_size=338 bytes, OCR=skipped, edge_density=0.072, mean_lum=21.4, std_lum=6.5, white_ratio=0.000, phash=9b1864e79a986567

### `02-header/05-btn-save.png`
- Description: 02-header: 05 btn save
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 56x27, file_size=1019 bytes, OCR=skipped, edge_density=0.351, mean_lum=52.9, std_lum=32.8, white_ratio=0.000, phash=ce74314fc633944e

### `02-header/06-btn-load.png`
- Description: 02-header: 06 btn load
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=933 bytes, OCR=skipped, edge_density=0.312, mean_lum=46.4, std_lum=16.7, white_ratio=0.000, phash=db3c6543d13cc42b

### `02-header/07-btn-settings.png`
- Description: 02-header: 07 btn settings
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 38x39, file_size=1590 bytes, OCR=skipped, edge_density=0.352, mean_lum=46.8, std_lum=31.0, white_ratio=0.000, phash=cf34209ecf3cc964

### `02-header/header-full.png`
- Description: 02-header: header full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37903 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.3, std_lum=17.6, white_ratio=0.000, phash=e84bea26a627ca4b

### `02-header/load-button.png`
- Description: 02-header: load button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=839 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.6, white_ratio=0.000, phash=df3c6543d138c42b

### `02-header/logo.png`
- Description: 02-header: logo
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3000 bytes, OCR=skipped, edge_density=0.282, mean_lum=57.1, std_lum=72.5, white_ratio=0.054, phash=8d1072ade59b8b72

### `02-header/redo-button-disabled.png`
- Description: 02-header: redo button disabled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
  - Low: Disabled state captured; confirm contrast is still legible.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
  - Increase text/icon contrast or lighten panel surface for small typography.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `02-header/save-button.png`
- Description: 02-header: save button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=954 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `02-header/settings-button.png`
- Description: 02-header: settings button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `02-header/undo-button-disabled.png`
- Description: 02-header: undo button disabled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
  - Low: Disabled state captured; confirm contrast is still legible.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
  - Increase text/icon contrast or lighten panel surface for small typography.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `02-header/voice-mode-button.png`
- Description: 02-header: voice mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `03-inventory/01-panel-open.png`
- Description: 03-inventory: 01 panel open
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111405 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.4, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/02-panel-locked.png`
- Description: 03-inventory: 02 panel locked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111729 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.5, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/03-tab-add-new-btn.png`
- Description: 03-inventory: 03 tab add new btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1087 bytes, OCR=skipped, edge_density=0.170, mean_lum=158.3, std_lum=40.5, white_ratio=0.000, phash=e465939e6467913c

### `03-inventory/03-tab-list-btn.png`
- Description: 03-inventory: 03 tab list btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=609 bytes, OCR=skipped, edge_density=0.078, mean_lum=166.4, std_lum=26.8, white_ratio=0.000, phash=b666cd9933664433

### `03-inventory/03-tab-tools-btn.png`
- Description: 03-inventory: 03 tab tools btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=892 bytes, OCR=skipped, edge_density=0.119, mean_lum=163.4, std_lum=32.6, white_ratio=0.000, phash=e5399cc665391167

### `03-inventory/04-tab-add-new-view.png`
- Description: 03-inventory: 04 tab add new view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=94021 bytes, OCR=skipped, edge_density=0.081, mean_lum=28.8, std_lum=23.8, white_ratio=0.001, phash=8e60cc6be82be30f

### `03-inventory/04-tab-list-view.png`
- Description: 03-inventory: 04 tab list view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=111720 bytes, OCR=skipped, edge_density=0.091, mean_lum=30.1, std_lum=25.5, white_ratio=0.002, phash=9f678f7aea682041

### `03-inventory/04-tab-tools-view.png`
- Description: 03-inventory: 04 tab tools view
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=80808 bytes, OCR=skipped, edge_density=0.070, mean_lum=28.5, std_lum=22.6, white_ratio=0.001, phash=8ef08760ea783a5d

### `03-panels/inventory-addnew-panel.png`
- Description: 03-panels: inventory addnew panel
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-panels/inventory-category-actuator.png`
- Description: 03-panels: inventory category actuator
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-microcontroller.png`
- Description: 03-panels: inventory category microcontroller
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-other.png`
- Description: 03-panels: inventory category other
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-power.png`
- Description: 03-panels: inventory category power
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-category-sensor.png`
- Description: 03-panels: inventory category sensor
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `03-panels/inventory-filter-active.png`
- Description: 03-panels: inventory filter active
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-panels/inventory-filter-input.png`
- Description: 03-panels: inventory filter input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `03-panels/inventory-header.png`
- Description: 03-panels: inventory header
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: High white ratio; possible export artifact or missing background.
  - Low: Small target (<44px); verify touch sizing on mobile.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Re-capture with correct background or ensure transparency renders to dark.
- Metrics: Dimensions: 186x28, file_size=3402 bytes, OCR=skipped, edge_density=0.559, mean_lum=72.3, std_lum=89.2, white_ratio=0.143, phash=83ce7cb1327f8388

### `03-panels/inventory-panel-locked.png`
- Description: 03-panels: inventory panel locked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=65690 bytes, OCR=skipped, edge_density=0.075, mean_lum=28.7, std_lum=23.7, white_ratio=0.002, phash=9edf8e78aa618701

### `03-panels/inventory-panel-open.png`
- Description: 03-panels: inventory panel open
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=67191 bytes, OCR=skipped, edge_density=0.075, mean_lum=29.4, std_lum=23.9, white_ratio=0.002, phash=9edf8e70ea618740

### `03-panels/inventory-tab-addnew.png`
- Description: 03-panels: inventory tab addnew
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tab-list.png`
- Description: 03-panels: inventory tab list
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tab-tools.png`
- Description: 03-panels: inventory tab tools
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `03-panels/inventory-tools-panel.png`
- Description: 03-panels: inventory tools panel
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37899 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.4, std_lum=17.8, white_ratio=0.000, phash=e84bea26a627ca4b

### `03-sidebars/001_inventory-panel_open_1920x1080.png`
- Description: 03-sidebars: 001 inventory panel open 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=724299 bytes, OCR=skipped, edge_density=0.196, mean_lum=11.6, std_lum=14.3, white_ratio=0.000, phash=d781a329396a7a5c

### `04-components/01-arduino-uno-r35v-arduino--hover.png`
- Description: 04-components: 01 arduino uno r35v arduino  hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7068 bytes, OCR=skipped, edge_density=0.163, mean_lum=47.8, std_lum=33.0, white_ratio=0.008, phash=fefe6c0000019fdf

### `04-components/01-arduino-uno-r35v-arduino-.png`
- Description: 04-components: 01 arduino uno r35v arduino 
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6031 bytes, OCR=skipped, edge_density=0.145, mean_lum=29.0, std_lum=35.8, white_ratio=0.008, phash=ecfc3f0100031fdf

### `04-components/02-arduino-mega-2560-r35v-ar-hover.png`
- Description: 04-components: 02 arduino mega 2560 r35v ar hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7296 bytes, OCR=skipped, edge_density=0.177, mean_lum=47.8, std_lum=33.5, white_ratio=0.008, phash=fefe240101019fdf

### `04-components/02-arduino-mega-2560-r35v-ar.png`
- Description: 04-components: 02 arduino mega 2560 r35v ar
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6221 bytes, OCR=skipped, edge_density=0.159, mean_lum=29.3, std_lum=36.6, white_ratio=0.008, phash=ecfc370220031fdf

### `04-components/03-esp32-devkit-38-pin3-3v-d-hover.png`
- Description: 04-components: 03 esp32 devkit 38 pin3 3v d hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7560 bytes, OCR=skipped, edge_density=0.168, mean_lum=48.4, std_lum=33.8, white_ratio=0.008, phash=fefe6c010001b79f

### `04-components/03-esp32-devkit-38-pin3-3v-d.png`
- Description: 04-components: 03 esp32 devkit 38 pin3 3v d
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6574 bytes, OCR=skipped, edge_density=0.150, mean_lum=29.7, std_lum=37.4, white_ratio=0.008, phash=ecfc1f0100313f9f

### `04-components/04-nodemcu-esp8266-amica-v23-hover.png`
- Description: 04-components: 04 nodemcu esp8266 amica v23 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7562 bytes, OCR=skipped, edge_density=0.181, mean_lum=48.1, std_lum=34.0, white_ratio=0.008, phash=fefe0c010001bfdf

### `04-components/04-nodemcu-esp8266-amica-v23.png`
- Description: 04-components: 04 nodemcu esp8266 amica v23
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6541 bytes, OCR=skipped, edge_density=0.163, mean_lum=29.7, std_lum=37.6, white_ratio=0.008, phash=ecfc1f0020233fcf

### `04-components/05-sparkfun-blynk-boardesp82-hover.png`
- Description: 04-components: 05 sparkfun blynk boardesp82 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7386 bytes, OCR=skipped, edge_density=0.165, mean_lum=48.1, std_lum=33.3, white_ratio=0.008, phash=fefe7c0000011fdf

### `04-components/05-sparkfun-blynk-boardesp82.png`
- Description: 04-components: 05 sparkfun blynk boardesp82
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6382 bytes, OCR=skipped, edge_density=0.147, mean_lum=29.4, std_lum=36.4, white_ratio=0.008, phash=ecfc3f0000033fdf

### `04-components/06-dccduino-nanoarduino-nano-hover.png`
- Description: 04-components: 06 dccduino nanoarduino nano hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7006 bytes, OCR=skipped, edge_density=0.176, mean_lum=47.7, std_lum=33.5, white_ratio=0.008, phash=fefe240101019fdf

### `04-components/06-dccduino-nanoarduino-nano.png`
- Description: 04-components: 06 dccduino nanoarduino nano
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5962 bytes, OCR=skipped, edge_density=0.157, mean_lum=29.1, std_lum=36.5, white_ratio=0.008, phash=ecfc3f0100013fdf

### `04-components/07-hc-sr04-ultrasonic-sensor-hover.png`
- Description: 04-components: 07 hc sr04 ultrasonic sensor hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6908 bytes, OCR=skipped, edge_density=0.162, mean_lum=47.7, std_lum=32.7, white_ratio=0.008, phash=fefee0010101b3df

### `04-components/07-hc-sr04-ultrasonic-sensor.png`
- Description: 04-components: 07 hc sr04 ultrasonic sensor
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5879 bytes, OCR=skipped, edge_density=0.144, mean_lum=29.0, std_lum=35.8, white_ratio=0.008, phash=ecfcb60100313bdf

### `04-components/08-hc-sr501-pir-motion-senso-hover.png`
- Description: 04-components: 08 hc sr501 pir motion senso hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6731 bytes, OCR=skipped, edge_density=0.171, mean_lum=47.4, std_lum=32.9, white_ratio=0.008, phash=fefec0010101b7df

### `04-components/08-hc-sr501-pir-motion-senso.png`
- Description: 04-components: 08 hc sr501 pir motion senso
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5691 bytes, OCR=skipped, edge_density=0.154, mean_lum=28.9, std_lum=35.9, white_ratio=0.008, phash=ecfc030101333fdf

### `04-components/09-dht11-temperature---humid-hover.png`
- Description: 04-components: 09 dht11 temperature   humid hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6414 bytes, OCR=skipped, edge_density=0.162, mean_lum=48.0, std_lum=33.2, white_ratio=0.008, phash=fefe6c0100019f9f

### `04-components/09-dht11-temperature---humid.png`
- Description: 04-components: 09 dht11 temperature   humid
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=5380 bytes, OCR=skipped, edge_density=0.144, mean_lum=29.1, std_lum=36.1, white_ratio=0.008, phash=ecfc3f0300013bdf

### `04-components/10-gy-521-mpu6050-6-dof-imu6-hover.png`
- Description: 04-components: 10 gy 521 mpu6050 6 dof imu6 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=7085 bytes, OCR=skipped, edge_density=0.173, mean_lum=47.3, std_lum=32.8, white_ratio=0.008, phash=fefec0010101b7df

### `04-components/10-gy-521-mpu6050-6-dof-imu6.png`
- Description: 04-components: 10 gy 521 mpu6050 6 dof imu6
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x83, file_size=6024 bytes, OCR=skipped, edge_density=0.154, mean_lum=28.8, std_lum=35.7, white_ratio=0.008, phash=ecfc210101333fdf

### `04-modals/component-editor-full.png`
- Description: 04-modals: component editor full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=63492 bytes, OCR=skipped, edge_density=0.056, mean_lum=14.3, std_lum=12.0, white_ratio=0.000, phash=9eff8e78aa608701

### `04-modals/component-editor-tab-3d-model.png`
- Description: 04-modals: component editor tab 3d model
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=104337 bytes, OCR=skipped, edge_density=0.093, mean_lum=13.1, std_lum=17.5, white_ratio=0.001, phash=d6c6ce2d29319879

### `04-modals/component-editor-tab-edit.png`
- Description: 04-modals: component editor tab edit
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=117633 bytes, OCR=skipped, edge_density=0.107, mean_lum=17.3, std_lum=20.6, white_ratio=0.002, phash=c6d6ec2731393878

### `04-modals/component-editor-tab-image.png`
- Description: 04-modals: component editor tab image
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=98324 bytes, OCR=skipped, edge_density=0.092, mean_lum=18.2, std_lum=25.2, white_ratio=0.001, phash=92649a2c6c9b6d9b

### `04-modals/component-editor-tab-info.png`
- Description: 04-modals: component editor tab info
- Checklist: VH=Fail, Grid=Pass, Space=Pass, Type=Fail, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=4255 bytes, OCR=skipped, edge_density=0.000, mean_lum=5.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

### `04-modals/settings-apikey-tab.png`
- Description: 04-modals: settings apikey tab
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=74217 bytes, OCR=skipped, edge_density=0.062, mean_lum=15.4, std_lum=18.1, white_ratio=0.000, phash=da667119641bdb64

### `04-modals/settings-autonomy-tab.png`
- Description: 04-modals: settings autonomy tab
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=92724 bytes, OCR=skipped, edge_density=0.066, mean_lum=17.3, std_lum=20.3, white_ratio=0.000, phash=ce66b127250f649b

### `04-modals/settings-modal-full.png`
- Description: 04-modals: settings modal full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=67069 bytes, OCR=skipped, edge_density=0.056, mean_lum=15.1, std_lum=18.1, white_ratio=0.000, phash=ca667199641bdb64

### `04-settings-modal/001_settings-api-key_1920x1080.png`
- Description: 04-settings-modal: 001 settings api key 1920x1080
- Checklist: VH=Fail, Grid=Pass, Space=Pass, Type=Fail, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=265235 bytes, OCR=skipped, edge_density=0.040, mean_lum=4.2, std_lum=7.2, white_ratio=0.000, phash=dd8723298c6633d9

### `04-settings-modal/002_settings-ai-autonomy_1920x1080.png`
- Description: 04-settings-modal: 002 settings ai autonomy 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=299671 bytes, OCR=skipped, edge_density=0.046, mean_lum=5.4, std_lum=10.2, white_ratio=0.000, phash=dc83230c33597c5f

### `04-settings-modal/003_settings-layout_1920x1080.png`
- Description: 04-settings-modal: 003 settings layout 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=278497 bytes, OCR=skipped, edge_density=0.043, mean_lum=4.7, std_lum=8.9, white_ratio=0.000, phash=dc8723098c765c7e

### `05-chat/chat-attach-button.png`
- Description: 05-chat: chat attach button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1067 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.2, std_lum=35.5, white_ratio=0.000, phash=993366ce9a3119c7

### `05-chat/chat-deep-thinking-toggle.png`
- Description: 05-chat: chat deep thinking toggle
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=543 bytes, OCR=skipped, edge_density=0.061, mean_lum=36.5, std_lum=24.0, white_ratio=0.000, phash=cc673399cc667039

### `05-chat/chat-input-empty.png`
- Description: 05-chat: chat input empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2991 bytes, OCR=skipped, edge_density=0.054, mean_lum=66.2, std_lum=12.5, white_ratio=0.000, phash=fc0303fcfc0381fc

### `05-chat/chat-input-with-text.png`
- Description: 05-chat: chat input with text
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=5098 bytes, OCR=skipped, edge_density=0.061, mean_lum=68.1, std_lum=22.7, white_ratio=0.003, phash=e10c1ef3e30c1cf3

### `05-chat/chat-minimize-button.png`
- Description: 05-chat: chat minimize button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=379 bytes, OCR=skipped, edge_density=0.028, mean_lum=33.8, std_lum=15.6, white_ratio=0.000, phash=cd673298cd63329c

### `05-chat/chat-minimized.png`
- Description: 05-chat: chat minimized
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=31213 bytes, OCR=skipped, edge_density=0.019, mean_lum=9.5, std_lum=15.0, white_ratio=0.000, phash=88f5a2ddaae68ac8

### `05-chat/chat-mode-button.png`
- Description: 05-chat: chat mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `05-chat/chat-session-button.png`
- Description: 05-chat: chat session button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3144 bytes, OCR=skipped, edge_density=0.210, mean_lum=52.0, std_lum=37.7, white_ratio=0.000, phash=c46d299796697893

### `05-chat/image-mode-button.png`
- Description: 05-chat: image mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `05-chat/video-mode-button.png`
- Description: 05-chat: video mode button
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `05-component-editor/001_component-editor-info_1920x1080.png`
- Description: 05-component-editor: 001 component editor info 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=388546 bytes, OCR=skipped, edge_density=0.073, mean_lum=8.4, std_lum=15.5, white_ratio=0.000, phash=dcc4232b2633737c

### `05-component-editor/002_component-editor-edit_1920x1080.png`
- Description: 05-component-editor: 002 component editor edit 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=352492 bytes, OCR=skipped, edge_density=0.070, mean_lum=7.9, std_lum=13.1, white_ratio=0.000, phash=dd85238926337676

### `05-modals/01-editor-full.png`
- Description: 05-modals: 01 editor full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=174350 bytes, OCR=skipped, edge_density=0.133, mean_lum=17.5, std_lum=17.6, white_ratio=0.001, phash=cfc6347a68716931

### `05-modals/02-editor-tab-3d-model.png`
- Description: 05-modals: 02 editor tab 3d model
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=153837 bytes, OCR=skipped, edge_density=0.119, mean_lum=12.1, std_lum=15.3, white_ratio=0.001, phash=97ce8f6969703831

### `05-modals/02-editor-tab-edit.png`
- Description: 05-modals: 02 editor tab edit
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=185962 bytes, OCR=skipped, edge_density=0.142, mean_lum=16.2, std_lum=21.4, white_ratio=0.002, phash=cfc6bc6969712819

### `05-modals/02-editor-tab-image.png`
- Description: 05-modals: 02 editor tab image
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=156269 bytes, OCR=skipped, edge_density=0.121, mean_lum=17.1, std_lum=24.0, white_ratio=0.001, phash=9b669b78649b6491

### `05-modals/02-editor-tab-info.png`
- Description: 05-modals: 02 editor tab info
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=174350 bytes, OCR=skipped, edge_density=0.133, mean_lum=17.5, std_lum=17.6, white_ratio=0.001, phash=cfc6347a68716931

### `05-modals/04-ai-assistant-btn.png`
- Description: 05-modals: 04 ai assistant btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Add grouping or reduce simultaneous highlights to lower visual noise.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 97x22, file_size=1282 bytes, OCR=skipped, edge_density=0.352, mean_lum=31.5, std_lum=16.7, white_ratio=0.000, phash=95786a8f953bf060

### `05-modals/05-editor-with-ai-chat.png`
- Description: 05-modals: 05 editor with ai chat
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=198231 bytes, OCR=skipped, edge_density=0.150, mean_lum=18.8, std_lum=22.8, white_ratio=0.002, phash=d7932d6d3a382c4c

### `06-canvas/canvas-awaiting-message.png`
- Description: 06-canvas: canvas awaiting message
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 324x29, file_size=315 bytes, OCR=skipped, edge_density=0.007, mean_lum=20.3, std_lum=3.7, white_ratio=0.000, phash=ffff00ff00ff0000

### `06-canvas/canvas-dragdrop-hint.png`
- Description: 06-canvas: canvas dragdrop hint
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=37776 bytes, OCR=skipped, edge_density=0.033, mean_lum=29.9, std_lum=17.4, white_ratio=0.000, phash=e86aea26a627ca4b

### `06-canvas/canvas-empty.png`
- Description: 06-canvas: canvas empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=Pass, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1280x720, file_size=35847 bytes, OCR=skipped, edge_density=0.029, mean_lum=27.8, std_lum=16.4, white_ratio=0.000, phash=c86fe24de867e20c

### `06-interactive-states/001_conversation-switcher-dropdown_1920x1080.png`
- Description: 06-interactive-states: 001 conversation switcher dropdown 1920x1080
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=727967 bytes, OCR=skipped, edge_density=0.197, mean_lum=11.7, std_lum=14.4, white_ratio=0.000, phash=d781a3293973725c

### `06-settings/01-settings-full.png`
- Description: 06-settings: 01 settings full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=87174 bytes, OCR=skipped, edge_density=0.078, mean_lum=14.2, std_lum=14.5, white_ratio=0.000, phash=ce667119241b9f66

### `06-settings/02-tab-ai-autonomy.png`
- Description: 06-settings: 02 tab ai autonomy
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=102288 bytes, OCR=skipped, edge_density=0.076, mean_lum=15.9, std_lum=16.8, white_ratio=0.000, phash=ce66716f250e249b

### `06-settings/02-tab-api-key.png`
- Description: 06-settings: 02 tab api key
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=87174 bytes, OCR=skipped, edge_density=0.078, mean_lum=14.2, std_lum=14.5, white_ratio=0.000, phash=ce667119241b9f66

### `07-chat/01-panel-full.png`
- Description: 07-chat: 01 panel full
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x712, file_size=94416 bytes, OCR=skipped, edge_density=0.078, mean_lum=16.7, std_lum=18.2, white_ratio=0.001, phash=ce4ef14f250e249b

### `07-chat/02-input.png`
- Description: 07-chat: 02 input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 1140x42, file_size=2707 bytes, OCR=skipped, edge_density=0.038, mean_lum=18.9, std_lum=1.0, white_ratio=0.000, phash=f4348174fc8f833c

### `07-chat/03-mode-selector.png`
- Description: 07-chat: 03 mode selector
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Medium: High edge density; risk of visual noise in dense layouts.
  - Low: Small target (<44px); verify touch sizing on mobile.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Add grouping or reduce simultaneous highlights to lower visual noise.
- Metrics: Dimensions: 97x28, file_size=1933 bytes, OCR=skipped, edge_density=0.470, mean_lum=27.6, std_lum=8.8, white_ratio=0.000, phash=e1f0371f10e4d917

### `07-chat/04-mode-btn-1.png`
- Description: 07-chat: 04 mode btn 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 31x24, file_size=797 bytes, OCR=skipped, edge_density=0.250, mean_lum=141.7, std_lum=37.4, white_ratio=0.067, phash=98cf3134ce934ccd

### `07-chat/04-mode-btn-2.png`
- Description: 07-chat: 04 mode btn 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 32x24, file_size=668 bytes, OCR=skipped, edge_density=0.311, mean_lum=138.5, std_lum=25.4, white_ratio=0.000, phash=807d65f655999866

### `07-chat/04-mode-btn-3.png`
- Description: 07-chat: 04 mode btn 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 32x24, file_size=732 bytes, OCR=skipped, edge_density=0.292, mean_lum=123.5, std_lum=22.3, white_ratio=0.000, phash=a09a9e65559b15ce

### `07-chat/05-send-btn.png`
- Description: 07-chat: 05 send btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=909 bytes, OCR=skipped, edge_density=0.169, mean_lum=71.0, std_lum=18.6, white_ratio=0.000, phash=d53871c7087d8a76

### `07-chat/06-upload-btn.png`
- Description: 07-chat: 06 upload btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=984 bytes, OCR=skipped, edge_density=0.135, mean_lum=37.7, std_lum=27.8, white_ratio=0.000, phash=993164ce9e3899d3

### `07-chat/07-messages-area.png`
- Description: 07-chat: 07 messages area
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 359x618, file_size=41281 bytes, OCR=skipped, edge_density=0.142, mean_lum=25.1, std_lum=32.9, white_ratio=0.006, phash=c433333323331f1f

### `07-inventory-components/component-0.png`
- Description: 07-inventory-components: component 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=2536 bytes, OCR=skipped, edge_density=0.072, mean_lum=20.1, std_lum=14.8, white_ratio=0.000, phash=d0fedf0f07d00703

### `07-inventory-components/component-1.png`
- Description: 07-inventory-components: component 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-2.png`
- Description: 07-inventory-components: component 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-inventory-components/component-3.png`
- Description: 07-inventory-components: component 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=7319 bytes, OCR=skipped, edge_density=0.120, mean_lum=35.7, std_lum=38.5, white_ratio=0.009, phash=c064cb3f1f3fc1c0

### `07-inventory-components/component-4.png`
- Description: 07-inventory-components: component 4
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-5.png`
- Description: 07-inventory-components: component 5
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-inventory-components/component-6.png`
- Description: 07-inventory-components: component 6
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x96, file_size=7319 bytes, OCR=skipped, edge_density=0.120, mean_lum=35.7, std_lum=38.5, white_ratio=0.009, phash=c064cb3f1f3fc1c0

### `07-inventory-components/component-7.png`
- Description: 07-inventory-components: component 7
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 107x78, file_size=2928 bytes, OCR=skipped, edge_density=0.136, mean_lum=37.0, std_lum=50.0, white_ratio=0.027, phash=83937c6c78939356

### `07-inventory-components/component-8.png`
- Description: 07-inventory-components: component 8
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 40x40, file_size=1254 bytes, OCR=skipped, edge_density=0.189, mean_lum=34.5, std_lum=49.0, white_ratio=0.000, phash=b4695ab54b2d9a54

### `07-responsive/001_2d-diagram_1440x900.png`
- Description: 07-responsive: 001 2d diagram 1440x900
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/002_2d-diagram_1024x768.png`
- Description: 07-responsive: 002 2d diagram 1024x768
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/003_2d-diagram_768x1024_tablet.png`
- Description: 07-responsive: 003 2d diagram 768x1024 tablet
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/004_2d-diagram_430x932_mobile.png`
- Description: 07-responsive: 004 2d diagram 430x932 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272908 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/005_2d-diagram_393x852_mobile.png`
- Description: 07-responsive: 005 2d diagram 393x852 mobile
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272920 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/006_2d-diagram_375x667_mobile-se.png`
- Description: 07-responsive: 006 2d diagram 375x667 mobile se
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272801 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `07-responsive/007_2d-diagram_320x568_mobile-legacy.png`
- Description: 07-responsive: 007 2d diagram 320x568 mobile legacy
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1737x1269, file_size=272910 bytes, OCR=skipped, edge_density=0.183, mean_lum=10.3, std_lum=16.3, white_ratio=0.000, phash=efc787c6c7503038

### `08-buttons/--normal.png`
- Description: 08-buttons:   normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 19x19, file_size=246 bytes, OCR=skipped, edge_density=0.100, mean_lum=15.8, std_lum=1.2, white_ratio=0.000, phash=a8f8aae9cc9c9f02

### `08-buttons/add-new-normal.png`
- Description: 08-buttons: add new normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/add-to-diagram-normal.png`
- Description: 08-buttons: add to diagram normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/attach-image-or-video-hover.png`
- Description: 08-buttons: attach image or video hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1060 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.8, std_lum=38.1, white_ratio=0.000, phash=993366ce9a3119c7

### `08-buttons/attach-image-or-video-normal.png`
- Description: 08-buttons: attach image or video normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1067 bytes, OCR=skipped, edge_density=0.113, mean_lum=39.2, std_lum=35.5, white_ratio=0.000, phash=993366ce9a3119c7

### `08-buttons/btn-0-hover.png`
- Description: 08-buttons: btn 0 hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=511 bytes, OCR=skipped, edge_density=0.119, mean_lum=23.2, std_lum=18.2, white_ratio=0.000, phash=e2961f92c3921f93

### `08-buttons/btn-0-normal.png`
- Description: 08-buttons: btn 0 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=474 bytes, OCR=skipped, edge_density=0.103, mean_lum=21.3, std_lum=19.4, white_ratio=0.000, phash=8aaa25aa9daa75aa

### `08-buttons/btn-10-normal.png`
- Description: 08-buttons: btn 10 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-100-normal.png`
- Description: 08-buttons: btn 100 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-101-normal.png`
- Description: 08-buttons: btn 101 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-104-normal.png`
- Description: 08-buttons: btn 104 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-105-normal.png`
- Description: 08-buttons: btn 105 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-106-normal.png`
- Description: 08-buttons: btn 106 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-107-normal.png`
- Description: 08-buttons: btn 107 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-11-normal.png`
- Description: 08-buttons: btn 11 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-110-normal.png`
- Description: 08-buttons: btn 110 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-111-normal.png`
- Description: 08-buttons: btn 111 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-112-normal.png`
- Description: 08-buttons: btn 112 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-113-normal.png`
- Description: 08-buttons: btn 113 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-116-normal.png`
- Description: 08-buttons: btn 116 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-117-normal.png`
- Description: 08-buttons: btn 117 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-118-normal.png`
- Description: 08-buttons: btn 118 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-119-normal.png`
- Description: 08-buttons: btn 119 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-122-normal.png`
- Description: 08-buttons: btn 122 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-123-normal.png`
- Description: 08-buttons: btn 123 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-124-normal.png`
- Description: 08-buttons: btn 124 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-125-normal.png`
- Description: 08-buttons: btn 125 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-128-normal.png`
- Description: 08-buttons: btn 128 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-129-normal.png`
- Description: 08-buttons: btn 129 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-130-normal.png`
- Description: 08-buttons: btn 130 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-131-normal.png`
- Description: 08-buttons: btn 131 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-134-normal.png`
- Description: 08-buttons: btn 134 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-135-normal.png`
- Description: 08-buttons: btn 135 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-136-normal.png`
- Description: 08-buttons: btn 136 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-137-normal.png`
- Description: 08-buttons: btn 137 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-14-normal.png`
- Description: 08-buttons: btn 14 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-140-normal.png`
- Description: 08-buttons: btn 140 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-141-normal.png`
- Description: 08-buttons: btn 141 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-142-normal.png`
- Description: 08-buttons: btn 142 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-143-normal.png`
- Description: 08-buttons: btn 143 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-146-normal.png`
- Description: 08-buttons: btn 146 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-147-normal.png`
- Description: 08-buttons: btn 147 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-148-normal.png`
- Description: 08-buttons: btn 148 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-149-normal.png`
- Description: 08-buttons: btn 149 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-15-normal.png`
- Description: 08-buttons: btn 15 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-152-normal.png`
- Description: 08-buttons: btn 152 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-153-normal.png`
- Description: 08-buttons: btn 153 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-154-normal.png`
- Description: 08-buttons: btn 154 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-155-normal.png`
- Description: 08-buttons: btn 155 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-158-normal.png`
- Description: 08-buttons: btn 158 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-159-normal.png`
- Description: 08-buttons: btn 159 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-16-normal.png`
- Description: 08-buttons: btn 16 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-160-normal.png`
- Description: 08-buttons: btn 160 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-161-normal.png`
- Description: 08-buttons: btn 161 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-164-normal.png`
- Description: 08-buttons: btn 164 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-165-normal.png`
- Description: 08-buttons: btn 165 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-166-normal.png`
- Description: 08-buttons: btn 166 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-167-normal.png`
- Description: 08-buttons: btn 167 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-17-normal.png`
- Description: 08-buttons: btn 17 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-170-normal.png`
- Description: 08-buttons: btn 170 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-171-normal.png`
- Description: 08-buttons: btn 171 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-172-normal.png`
- Description: 08-buttons: btn 172 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-173-normal.png`
- Description: 08-buttons: btn 173 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-176-normal.png`
- Description: 08-buttons: btn 176 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-177-normal.png`
- Description: 08-buttons: btn 177 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-178-normal.png`
- Description: 08-buttons: btn 178 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-179-normal.png`
- Description: 08-buttons: btn 179 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-182-normal.png`
- Description: 08-buttons: btn 182 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-183-normal.png`
- Description: 08-buttons: btn 183 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-184-normal.png`
- Description: 08-buttons: btn 184 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-185-normal.png`
- Description: 08-buttons: btn 185 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-188-normal.png`
- Description: 08-buttons: btn 188 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-189-normal.png`
- Description: 08-buttons: btn 189 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-190-normal.png`
- Description: 08-buttons: btn 190 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-191-normal.png`
- Description: 08-buttons: btn 191 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-194-normal.png`
- Description: 08-buttons: btn 194 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-195-normal.png`
- Description: 08-buttons: btn 195 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-196-normal.png`
- Description: 08-buttons: btn 196 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-197-normal.png`
- Description: 08-buttons: btn 197 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-2-normal.png`
- Description: 08-buttons: btn 2 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-20-normal.png`
- Description: 08-buttons: btn 20 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-200-normal.png`
- Description: 08-buttons: btn 200 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-201-normal.png`
- Description: 08-buttons: btn 201 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-202-normal.png`
- Description: 08-buttons: btn 202 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-203-normal.png`
- Description: 08-buttons: btn 203 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-206-normal.png`
- Description: 08-buttons: btn 206 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-207-normal.png`
- Description: 08-buttons: btn 207 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-208-normal.png`
- Description: 08-buttons: btn 208 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-209-normal.png`
- Description: 08-buttons: btn 209 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-21-normal.png`
- Description: 08-buttons: btn 21 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-212-normal.png`
- Description: 08-buttons: btn 212 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-213-normal.png`
- Description: 08-buttons: btn 213 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-214-normal.png`
- Description: 08-buttons: btn 214 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-215-normal.png`
- Description: 08-buttons: btn 215 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-218-normal.png`
- Description: 08-buttons: btn 218 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-219-normal.png`
- Description: 08-buttons: btn 219 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-22-normal.png`
- Description: 08-buttons: btn 22 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-220-normal.png`
- Description: 08-buttons: btn 220 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-221-normal.png`
- Description: 08-buttons: btn 221 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-224-normal.png`
- Description: 08-buttons: btn 224 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-225-normal.png`
- Description: 08-buttons: btn 225 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-226-normal.png`
- Description: 08-buttons: btn 226 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-227-normal.png`
- Description: 08-buttons: btn 227 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-23-normal.png`
- Description: 08-buttons: btn 23 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-230-normal.png`
- Description: 08-buttons: btn 230 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-231-normal.png`
- Description: 08-buttons: btn 231 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-232-normal.png`
- Description: 08-buttons: btn 232 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-233-normal.png`
- Description: 08-buttons: btn 233 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-236-normal.png`
- Description: 08-buttons: btn 236 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-237-normal.png`
- Description: 08-buttons: btn 237 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-238-normal.png`
- Description: 08-buttons: btn 238 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-239-normal.png`
- Description: 08-buttons: btn 239 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-242-normal.png`
- Description: 08-buttons: btn 242 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-243-normal.png`
- Description: 08-buttons: btn 243 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-244-normal.png`
- Description: 08-buttons: btn 244 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-245-normal.png`
- Description: 08-buttons: btn 245 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-248-normal.png`
- Description: 08-buttons: btn 248 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-249-normal.png`
- Description: 08-buttons: btn 249 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-250-normal.png`
- Description: 08-buttons: btn 250 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-251-normal.png`
- Description: 08-buttons: btn 251 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-254-normal.png`
- Description: 08-buttons: btn 254 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-255-normal.png`
- Description: 08-buttons: btn 255 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-256-normal.png`
- Description: 08-buttons: btn 256 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-257-normal.png`
- Description: 08-buttons: btn 257 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-26-normal.png`
- Description: 08-buttons: btn 26 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-260-normal.png`
- Description: 08-buttons: btn 260 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-261-normal.png`
- Description: 08-buttons: btn 261 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-262-normal.png`
- Description: 08-buttons: btn 262 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-263-normal.png`
- Description: 08-buttons: btn 263 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-266-normal.png`
- Description: 08-buttons: btn 266 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-267-normal.png`
- Description: 08-buttons: btn 267 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-268-normal.png`
- Description: 08-buttons: btn 268 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-269-normal.png`
- Description: 08-buttons: btn 269 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-27-normal.png`
- Description: 08-buttons: btn 27 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-272-normal.png`
- Description: 08-buttons: btn 272 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-273-normal.png`
- Description: 08-buttons: btn 273 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-274-normal.png`
- Description: 08-buttons: btn 274 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-275-normal.png`
- Description: 08-buttons: btn 275 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-278-normal.png`
- Description: 08-buttons: btn 278 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-279-normal.png`
- Description: 08-buttons: btn 279 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-28-normal.png`
- Description: 08-buttons: btn 28 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-280-normal.png`
- Description: 08-buttons: btn 280 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-281-normal.png`
- Description: 08-buttons: btn 281 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-284-normal.png`
- Description: 08-buttons: btn 284 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-285-normal.png`
- Description: 08-buttons: btn 285 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-286-normal.png`
- Description: 08-buttons: btn 286 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-287-normal.png`
- Description: 08-buttons: btn 287 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-29-normal.png`
- Description: 08-buttons: btn 29 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-290-normal.png`
- Description: 08-buttons: btn 290 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-291-normal.png`
- Description: 08-buttons: btn 291 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-292-normal.png`
- Description: 08-buttons: btn 292 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-293-normal.png`
- Description: 08-buttons: btn 293 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-296-normal.png`
- Description: 08-buttons: btn 296 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-297-normal.png`
- Description: 08-buttons: btn 297 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-298-normal.png`
- Description: 08-buttons: btn 298 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-299-normal.png`
- Description: 08-buttons: btn 299 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-302-normal.png`
- Description: 08-buttons: btn 302 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-303-normal.png`
- Description: 08-buttons: btn 303 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-304-normal.png`
- Description: 08-buttons: btn 304 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-305-normal.png`
- Description: 08-buttons: btn 305 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-308-normal.png`
- Description: 08-buttons: btn 308 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-309-normal.png`
- Description: 08-buttons: btn 309 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-310-normal.png`
- Description: 08-buttons: btn 310 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-311-normal.png`
- Description: 08-buttons: btn 311 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-314-normal.png`
- Description: 08-buttons: btn 314 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-315-normal.png`
- Description: 08-buttons: btn 315 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-316-normal.png`
- Description: 08-buttons: btn 316 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-317-normal.png`
- Description: 08-buttons: btn 317 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-32-normal.png`
- Description: 08-buttons: btn 32 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-320-normal.png`
- Description: 08-buttons: btn 320 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-321-normal.png`
- Description: 08-buttons: btn 321 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-322-normal.png`
- Description: 08-buttons: btn 322 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-33-normal.png`
- Description: 08-buttons: btn 33 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-34-normal.png`
- Description: 08-buttons: btn 34 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-35-normal.png`
- Description: 08-buttons: btn 35 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-38-normal.png`
- Description: 08-buttons: btn 38 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-39-normal.png`
- Description: 08-buttons: btn 39 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-40-normal.png`
- Description: 08-buttons: btn 40 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-41-normal.png`
- Description: 08-buttons: btn 41 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-44-normal.png`
- Description: 08-buttons: btn 44 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-45-normal.png`
- Description: 08-buttons: btn 45 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-46-normal.png`
- Description: 08-buttons: btn 46 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-47-normal.png`
- Description: 08-buttons: btn 47 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-50-normal.png`
- Description: 08-buttons: btn 50 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-51-normal.png`
- Description: 08-buttons: btn 51 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-52-normal.png`
- Description: 08-buttons: btn 52 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-53-normal.png`
- Description: 08-buttons: btn 53 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-56-normal.png`
- Description: 08-buttons: btn 56 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-57-normal.png`
- Description: 08-buttons: btn 57 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-58-normal.png`
- Description: 08-buttons: btn 58 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-59-normal.png`
- Description: 08-buttons: btn 59 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-62-normal.png`
- Description: 08-buttons: btn 62 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-63-normal.png`
- Description: 08-buttons: btn 63 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-64-normal.png`
- Description: 08-buttons: btn 64 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-65-normal.png`
- Description: 08-buttons: btn 65 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-68-normal.png`
- Description: 08-buttons: btn 68 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-69-normal.png`
- Description: 08-buttons: btn 69 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-70-normal.png`
- Description: 08-buttons: btn 70 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-71-normal.png`
- Description: 08-buttons: btn 71 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-74-normal.png`
- Description: 08-buttons: btn 74 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-75-normal.png`
- Description: 08-buttons: btn 75 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-76-normal.png`
- Description: 08-buttons: btn 76 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-77-normal.png`
- Description: 08-buttons: btn 77 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-8-normal.png`
- Description: 08-buttons: btn 8 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-80-normal.png`
- Description: 08-buttons: btn 80 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-81-normal.png`
- Description: 08-buttons: btn 81 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-82-normal.png`
- Description: 08-buttons: btn 82 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-83-normal.png`
- Description: 08-buttons: btn 83 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-86-normal.png`
- Description: 08-buttons: btn 86 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-87-normal.png`
- Description: 08-buttons: btn 87 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-88-normal.png`
- Description: 08-buttons: btn 88 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-89-normal.png`
- Description: 08-buttons: btn 89 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-9-normal.png`
- Description: 08-buttons: btn 9 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-92-normal.png`
- Description: 08-buttons: btn 92 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-93-normal.png`
- Description: 08-buttons: btn 93 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-94-normal.png`
- Description: 08-buttons: btn 94 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-95-normal.png`
- Description: 08-buttons: btn 95 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-98-normal.png`
- Description: 08-buttons: btn 98 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/btn-99-normal.png`
- Description: 08-buttons: btn 99 normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/chat-mode-hover.png`
- Description: 08-buttons: chat mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `08-buttons/chat-mode-normal.png`
- Description: 08-buttons: chat mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=813 bytes, OCR=skipped, edge_density=0.091, mean_lum=136.5, std_lum=23.8, white_ratio=0.026, phash=99cc6633cccc3366

### `08-buttons/circuitmind-session-hover.png`
- Description: 08-buttons: circuitmind session hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3230 bytes, OCR=skipped, edge_density=0.209, mean_lum=73.1, std_lum=33.8, white_ratio=0.000, phash=846d3997846d7897

### `08-buttons/circuitmind-session-normal.png`
- Description: 08-buttons: circuitmind session normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 206x32, file_size=3128 bytes, OCR=skipped, edge_density=0.210, mean_lum=52.1, std_lum=38.1, white_ratio=0.000, phash=c46d2997866d7893

### `08-buttons/delete-item-normal.png`
- Description: 08-buttons: delete item normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/edit-details-normal.png`
- Description: 08-buttons: edit details normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/enable-deep-thinking-hover.png`
- Description: 08-buttons: enable deep thinking hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=551 bytes, OCR=skipped, edge_density=0.061, mean_lum=37.4, std_lum=28.7, white_ratio=0.006, phash=cc3333cccc336479

### `08-buttons/enable-deep-thinking-normal.png`
- Description: 08-buttons: enable deep thinking normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=543 bytes, OCR=skipped, edge_density=0.061, mean_lum=36.5, std_lum=24.0, white_ratio=0.000, phash=cc673399cc667039

### `08-buttons/generate-thumbnail-normal.png`
- Description: 08-buttons: generate thumbnail normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/image-mode-hover.png`
- Description: 08-buttons: image mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `08-buttons/image-mode-normal.png`
- Description: 08-buttons: image mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=553 bytes, OCR=skipped, edge_density=0.110, mean_lum=73.7, std_lum=31.2, white_ratio=0.000, phash=9964669b99646673

### `08-buttons/list-normal.png`
- Description: 08-buttons: list normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/load-hover.png`
- Description: 08-buttons: load hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=835 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.5, white_ratio=0.000, phash=df3c6543d138c42b

### `08-buttons/load-normal.png`
- Description: 08-buttons: load normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 57x27, file_size=839 bytes, OCR=skipped, edge_density=0.301, mean_lum=46.1, std_lum=16.6, white_ratio=0.000, phash=df3c6543d138c42b

### `08-buttons/lock-sidebar-open-normal.png`
- Description: 08-buttons: lock sidebar open normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=1363 bytes, OCR=skipped, edge_density=0.167, mean_lum=31.8, std_lum=45.2, white_ratio=0.000, phash=966d6992246ea59b

### `08-buttons/minimize-chat-hover.png`
- Description: 08-buttons: minimize chat hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=353 bytes, OCR=skipped, edge_density=0.028, mean_lum=34.2, std_lum=18.8, white_ratio=0.000, phash=cc3333cccc3333cc

### `08-buttons/minimize-chat-normal.png`
- Description: 08-buttons: minimize chat normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=379 bytes, OCR=skipped, edge_density=0.028, mean_lum=33.8, std_lum=15.6, white_ratio=0.000, phash=cd673298cd63329c

### `08-buttons/open-inventory-hover.png`
- Description: 08-buttons: open inventory hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=154 bytes, OCR=skipped, edge_density=0.000, mean_lum=23.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

### `08-buttons/open-inventory-normal.png`
- Description: 08-buttons: open inventory normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x64, file_size=474 bytes, OCR=skipped, edge_density=0.103, mean_lum=21.3, std_lum=19.4, white_ratio=0.000, phash=8aaa25aa9daa75aa

### `08-buttons/open-settings-hover.png`
- Description: 08-buttons: open settings hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `08-buttons/open-settings-normal.png`
- Description: 08-buttons: open settings normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1730 bytes, OCR=skipped, edge_density=0.284, mean_lum=44.2, std_lum=27.2, white_ratio=0.000, phash=cd2120dfcb784c75

### `08-buttons/redo-hover.png`
- Description: 08-buttons: redo hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `08-buttons/redo-normal.png`
- Description: 08-buttons: redo normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=414 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=9b3964c69b196666

### `08-buttons/save-hover.png`
- Description: 08-buttons: save hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=952 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `08-buttons/save-normal.png`
- Description: 08-buttons: save normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 56x27, file_size=954 bytes, OCR=skipped, edge_density=0.334, mean_lum=52.2, std_lum=32.4, white_ratio=0.000, phash=ce3031cfc632b46d

### `08-buttons/send-message-hover.png`
- Description: 08-buttons: send message hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=974 bytes, OCR=skipped, edge_density=0.149, mean_lum=108.6, std_lum=26.9, white_ratio=0.000, phash=d52855d7047d1357

### `08-buttons/send-message-normal.png`
- Description: 08-buttons: send message normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=980 bytes, OCR=skipped, edge_density=0.149, mean_lum=92.6, std_lum=26.9, white_ratio=0.000, phash=dc2875d3447d02d7

### `08-buttons/toggle-live-voice-mode-hover.png`
- Description: 08-buttons: toggle live voice mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `08-buttons/toggle-live-voice-mode-normal.png`
- Description: 08-buttons: toggle live voice mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x45, file_size=1556 bytes, OCR=skipped, edge_density=0.268, mean_lum=43.3, std_lum=25.8, white_ratio=0.000, phash=cc2323dd8b74cc96

### `08-buttons/tools-normal.png`
- Description: 08-buttons: tools normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 103x28, file_size=1443 bytes, OCR=skipped, edge_density=0.143, mean_lum=37.6, std_lum=57.2, white_ratio=0.033, phash=836c937c46b14eb9

### `08-buttons/undo-hover.png`
- Description: 08-buttons: undo hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `08-buttons/undo-normal.png`
- Description: 08-buttons: undo normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 45x45, file_size=457 bytes, OCR=skipped, edge_density=0.044, mean_lum=22.0, std_lum=13.1, white_ratio=0.000, phash=cc6c33b3cc4c3333

### `08-buttons/video-mode-hover.png`
- Description: 08-buttons: video mode hover
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `08-buttons/video-mode-normal.png`
- Description: 08-buttons: video mode normal
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 44x44, file_size=652 bytes, OCR=skipped, edge_density=0.091, mean_lum=66.3, std_lum=10.8, white_ratio=0.000, phash=9999666699993366

### `08-canvas/01-zoom-in-btn.png`
- Description: 08-canvas: 01 zoom in btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/02-zoom-out-btn.png`
- Description: 08-canvas: 02 zoom out btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/03-reset-view-btn.png`
- Description: 08-canvas: 03 reset view btn
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 42x42, file_size=551 bytes, OCR=skipped, edge_density=0.119, mean_lum=32.3, std_lum=12.6, white_ratio=0.000, phash=959581a1e96979d9

### `08-canvas/04-search-input.png`
- Description: 08-canvas: 04 search input
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 174x34, file_size=438 bytes, OCR=skipped, edge_density=0.062, mean_lum=28.8, std_lum=11.5, white_ratio=0.000, phash=807f78fe807c78e0

### `08-canvas/06-full-workspace.png`
- Description: 08-canvas: 06 full workspace
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=54129 bytes, OCR=skipped, edge_density=0.043, mean_lum=30.1, std_lum=17.7, white_ratio=0.000, phash=c86bf03ab237a247

### `08-canvas/07-full-workspace.png`
- Description: 08-canvas: 07 full workspace
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=Pass, Dens=Pass, Trunc=NA, Target=Pass, A11y=NA, Safety=NA
- Top issues:
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1366x768, file_size=95155 bytes, OCR=skipped, edge_density=0.076, mean_lum=28.9, std_lum=24.0, white_ratio=0.002, phash=9fc78f7bea688040

### `10-forms/ask-about-your-circuit----empty.png`
- Description: 10-forms: ask about your circuit    empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2991 bytes, OCR=skipped, edge_density=0.054, mean_lum=66.2, std_lum=12.5, white_ratio=0.000, phash=fc0303fcfc0381fc

### `10-forms/ask-about-your-circuit----filled.png`
- Description: 10-forms: ask about your circuit    filled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=2456 bytes, OCR=skipped, edge_density=0.019, mean_lum=65.2, std_lum=12.3, white_ratio=0.001, phash=ff0000ffff0000ff

### `10-forms/ask-about-your-circuit----focus.png`
- Description: 10-forms: ask about your circuit    focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=Pass, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 1006x42, file_size=3124 bytes, OCR=skipped, edge_density=0.030, mean_lum=65.5, std_lum=12.1, white_ratio=0.000, phash=fc0303fcfc0303fc

### `10-forms/checkbox-0-unchecked.png`
- Description: 10-forms: checkbox 0 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-1-unchecked.png`
- Description: 10-forms: checkbox 1 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-2-unchecked.png`
- Description: 10-forms: checkbox 2 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-3-unchecked.png`
- Description: 10-forms: checkbox 3 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-4-unchecked.png`
- Description: 10-forms: checkbox 4 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-5-unchecked.png`
- Description: 10-forms: checkbox 5 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-6-unchecked.png`
- Description: 10-forms: checkbox 6 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-7-unchecked.png`
- Description: 10-forms: checkbox 7 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-8-unchecked.png`
- Description: 10-forms: checkbox 8 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/checkbox-9-unchecked.png`
- Description: 10-forms: checkbox 9 unchecked
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/filter-assets----empty.png`
- Description: 10-forms: filter assets    empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `10-forms/filter-assets----filled.png`
- Description: 10-forms: filter assets    filled
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 327x34, file_size=3460 bytes, OCR=skipped, edge_density=0.138, mean_lum=36.6, std_lum=51.8, white_ratio=0.024, phash=c03fc1c43bbcc13e

### `10-forms/filter-assets----focus.png`
- Description: 10-forms: filter assets    focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 321x34, file_size=3459 bytes, OCR=skipped, edge_density=0.140, mean_lum=36.9, std_lum=52.3, white_ratio=0.025, phash=c03fc1c43bbcc13e

### `10-forms/input-1-empty.png`
- Description: 10-forms: input 1 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-1-focus.png`
- Description: 10-forms: input 1 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-10-empty.png`
- Description: 10-forms: input 10 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-10-focus.png`
- Description: 10-forms: input 10 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-11-empty.png`
- Description: 10-forms: input 11 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-11-focus.png`
- Description: 10-forms: input 11 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-12-empty.png`
- Description: 10-forms: input 12 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-12-focus.png`
- Description: 10-forms: input 12 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-13-empty.png`
- Description: 10-forms: input 13 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-13-focus.png`
- Description: 10-forms: input 13 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-14-empty.png`
- Description: 10-forms: input 14 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-14-focus.png`
- Description: 10-forms: input 14 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-15-empty.png`
- Description: 10-forms: input 15 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-15-focus.png`
- Description: 10-forms: input 15 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-16-empty.png`
- Description: 10-forms: input 16 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-16-focus.png`
- Description: 10-forms: input 16 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-17-empty.png`
- Description: 10-forms: input 17 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-17-focus.png`
- Description: 10-forms: input 17 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-18-empty.png`
- Description: 10-forms: input 18 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-18-focus.png`
- Description: 10-forms: input 18 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-19-empty.png`
- Description: 10-forms: input 19 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-19-focus.png`
- Description: 10-forms: input 19 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-2-empty.png`
- Description: 10-forms: input 2 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-2-focus.png`
- Description: 10-forms: input 2 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-20-empty.png`
- Description: 10-forms: input 20 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-20-focus.png`
- Description: 10-forms: input 20 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-21-empty.png`
- Description: 10-forms: input 21 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-21-focus.png`
- Description: 10-forms: input 21 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-22-empty.png`
- Description: 10-forms: input 22 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-22-focus.png`
- Description: 10-forms: input 22 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-23-empty.png`
- Description: 10-forms: input 23 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-23-focus.png`
- Description: 10-forms: input 23 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-24-empty.png`
- Description: 10-forms: input 24 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-24-focus.png`
- Description: 10-forms: input 24 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-25-empty.png`
- Description: 10-forms: input 25 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-25-focus.png`
- Description: 10-forms: input 25 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-26-empty.png`
- Description: 10-forms: input 26 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-26-focus.png`
- Description: 10-forms: input 26 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-27-empty.png`
- Description: 10-forms: input 27 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-27-focus.png`
- Description: 10-forms: input 27 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-28-empty.png`
- Description: 10-forms: input 28 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-28-focus.png`
- Description: 10-forms: input 28 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-29-empty.png`
- Description: 10-forms: input 29 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-29-focus.png`
- Description: 10-forms: input 29 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-3-empty.png`
- Description: 10-forms: input 3 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-3-focus.png`
- Description: 10-forms: input 3 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-30-empty.png`
- Description: 10-forms: input 30 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-30-focus.png`
- Description: 10-forms: input 30 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-31-empty.png`
- Description: 10-forms: input 31 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-31-focus.png`
- Description: 10-forms: input 31 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-32-empty.png`
- Description: 10-forms: input 32 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-32-focus.png`
- Description: 10-forms: input 32 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-33-empty.png`
- Description: 10-forms: input 33 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-33-focus.png`
- Description: 10-forms: input 33 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-34-empty.png`
- Description: 10-forms: input 34 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-34-focus.png`
- Description: 10-forms: input 34 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-35-empty.png`
- Description: 10-forms: input 35 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-35-focus.png`
- Description: 10-forms: input 35 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-36-empty.png`
- Description: 10-forms: input 36 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-36-focus.png`
- Description: 10-forms: input 36 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-37-empty.png`
- Description: 10-forms: input 37 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-37-focus.png`
- Description: 10-forms: input 37 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-38-empty.png`
- Description: 10-forms: input 38 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-38-focus.png`
- Description: 10-forms: input 38 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-39-empty.png`
- Description: 10-forms: input 39 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-39-focus.png`
- Description: 10-forms: input 39 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-4-empty.png`
- Description: 10-forms: input 4 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-4-focus.png`
- Description: 10-forms: input 4 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-40-empty.png`
- Description: 10-forms: input 40 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-40-focus.png`
- Description: 10-forms: input 40 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-41-empty.png`
- Description: 10-forms: input 41 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-41-focus.png`
- Description: 10-forms: input 41 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-42-empty.png`
- Description: 10-forms: input 42 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-42-focus.png`
- Description: 10-forms: input 42 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-43-empty.png`
- Description: 10-forms: input 43 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-43-focus.png`
- Description: 10-forms: input 43 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-44-empty.png`
- Description: 10-forms: input 44 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-44-focus.png`
- Description: 10-forms: input 44 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-45-empty.png`
- Description: 10-forms: input 45 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-45-focus.png`
- Description: 10-forms: input 45 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-46-empty.png`
- Description: 10-forms: input 46 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-46-focus.png`
- Description: 10-forms: input 46 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-47-empty.png`
- Description: 10-forms: input 47 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-47-focus.png`
- Description: 10-forms: input 47 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-48-empty.png`
- Description: 10-forms: input 48 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-48-focus.png`
- Description: 10-forms: input 48 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-49-empty.png`
- Description: 10-forms: input 49 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-49-focus.png`
- Description: 10-forms: input 49 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-5-empty.png`
- Description: 10-forms: input 5 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-5-focus.png`
- Description: 10-forms: input 5 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-50-empty.png`
- Description: 10-forms: input 50 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-50-focus.png`
- Description: 10-forms: input 50 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-51-empty.png`
- Description: 10-forms: input 51 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-51-focus.png`
- Description: 10-forms: input 51 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-52-empty.png`
- Description: 10-forms: input 52 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-52-focus.png`
- Description: 10-forms: input 52 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-53-empty.png`
- Description: 10-forms: input 53 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-53-focus.png`
- Description: 10-forms: input 53 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-54-empty.png`
- Description: 10-forms: input 54 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-54-focus.png`
- Description: 10-forms: input 54 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-55-empty.png`
- Description: 10-forms: input 55 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-55-focus.png`
- Description: 10-forms: input 55 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-56-empty.png`
- Description: 10-forms: input 56 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-56-focus.png`
- Description: 10-forms: input 56 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-57-empty.png`
- Description: 10-forms: input 57 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-57-focus.png`
- Description: 10-forms: input 57 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-58-empty.png`
- Description: 10-forms: input 58 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-58-focus.png`
- Description: 10-forms: input 58 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-59-empty.png`
- Description: 10-forms: input 59 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-59-focus.png`
- Description: 10-forms: input 59 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-6-empty.png`
- Description: 10-forms: input 6 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-6-focus.png`
- Description: 10-forms: input 6 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-60-empty.png`
- Description: 10-forms: input 60 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-60-focus.png`
- Description: 10-forms: input 60 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-61-empty.png`
- Description: 10-forms: input 61 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-61-focus.png`
- Description: 10-forms: input 61 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-62-empty.png`
- Description: 10-forms: input 62 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-62-focus.png`
- Description: 10-forms: input 62 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-7-empty.png`
- Description: 10-forms: input 7 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-7-focus.png`
- Description: 10-forms: input 7 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-8-empty.png`
- Description: 10-forms: input 8 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-8-focus.png`
- Description: 10-forms: input 8 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-9-empty.png`
- Description: 10-forms: input 9 empty
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `10-forms/input-9-focus.png`
- Description: 10-forms: input 9 focus
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=Pass, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=Pass, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 16x16, file_size=213 bytes, OCR=skipped, edge_density=0.109, mean_lum=15.7, std_lum=1.0, white_ratio=0.000, phash=a2f152ebf8be0382

### `12-typography/h1-0.png`
- Description: 12-typography: h1 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 158x33, file_size=3000 bytes, OCR=skipped, edge_density=0.282, mean_lum=57.1, std_lum=72.5, white_ratio=0.054, phash=8d1072ade59b8b72

### `12-typography/h2-0.png`
- Description: 12-typography: h2 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Pass, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Raise hit area to 44px using padding or invisible touch target.
  - Re-export PNG with consistent zlib version to avoid warnings.
- Metrics: Dimensions: 186x28, file_size=1956 bytes, OCR=skipped, edge_density=0.145, mean_lum=38.5, std_lum=55.5, white_ratio=0.028, phash=847b847b708f708f

### `12-typography/h3-0.png`
- Description: 12-typography: h3 0
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-1.png`
- Description: 12-typography: h3 1
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-2.png`
- Description: 12-typography: h3 2
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-3.png`
- Description: 12-typography: h3 3
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-4.png`
- Description: 12-typography: h3 4
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 321x20, file_size=570 bytes, OCR=skipped, edge_density=0.013, mean_lum=20.0, std_lum=6.9, white_ratio=0.000, phash=8007f807fc013ffb

### `12-typography/h3-5.png`
- Description: 12-typography: h3 5
- Checklist: VH=Pass, Grid=Pass, Space=Pass, Type=NA, Cntr=Fail, Cons=Pass, Aff=Pass, Fbk=NA, Err=NA, Nav=NA, Dens=NA, Trunc=NA, Target=Fail, A11y=NA, Safety=NA
- Top issues:
  - Medium: Low luminance variance; verify text/control contrast against WCAG AA.
  - Low: Small target (<44px); verify touch sizing on mobile.
  - Low: PNG compression warning in pngcheck output.
- Recommendations:
  - Increase text/icon contrast or lighten panel surface for small typography.
  - Raise hit area to 44px using padding or invisible touch target.
- Metrics: Dimensions: 180x29, file_size=168 bytes, OCR=skipped, edge_density=0.000, mean_lum=20.0, std_lum=0.0, white_ratio=0.000, phash=8000000000000000

## Consistency / Drift Analysis
- Duplicate clusters (pHash) show heavy reuse of button/checkbox assets; largest group size: 217.
- Potential drift risks: header actions vs panel actions use different accent emphasis (see 02-header/* vs 08-buttons/*).
- Typography variance: h3 samples in 12-typography appear consistent but spacing varies across panels.
- Token drift candidate: border/shadow intensity differs between app shell and modals (01-app-shell/* vs 04-modals/*).

## Coverage Matrix
States detected from filenames:

| State | Count | Coverage |
| --- | --- | --- |
| active | 1 | Present |
| checked | 10 | Present |
| disabled | 2 | Present |
| empty | 67 | Present |
| focus | 64 | Present |
| generated | 1 | Present |
| hover | 26 | Present |
| locked | 2 | Present |
| normal | 237 | Present |
| open | 8 | Present |
| unchecked | 10 | Present |

Viewports detected:

| Viewport | Count | Notes |
| --- | --- | --- |
| full | 11 | |
| full-page | 1 | |
| legacy | 1 | |
| mobile | 5 | |
| se | 29 | |
| tablet | 2 | |

Missing coverage flags:
- Error states: low representation (only filename matches in a few items).
- Disabled states: very few captures in filenames.
- Loading states: present but limited by filename count.

## Issue Ledger
| ID | Severity | Evidence | Recommendation | Effort |
| --- | --- | --- | --- | --- |
| UI-001 | Medium | 10-forms/* (std_lum < 10 in many inputs) | Increase microcopy contrast token for dark surfaces. | Medium |
| UI-002 | Medium | 02-header/*, 03-panels/* | Group header actions and panel actions with separators and labels. | Medium |
| UI-003 | Low | 08-buttons/* (min dim < 44px) | Increase hit area for icon buttons on mobile. | Low |
| UI-004 | Low | 03-panels/inventory-header.png | Re-export PNG to remove zlib warning. | Low |
| UI-005 | Medium | 07-responsive/* | Add explicit error/disabled states for responsive layouts. | Medium |

## Action Plan
Quick Wins (High impact, low effort):
1. Add 44px hit area wrappers to icon buttons and toggles.
2. Standardize focus ring width and cyan tone across controls.
3. Re-export the inventory header PNG with consistent zlib settings.

Medium-Term Improvements:
1. Increase microcopy contrast token and verify AA on dark surfaces.
2. Add labeled groupings in the top bar and sidebars for clearer hierarchy.
3. Expand error/disabled/loading coverage in screenshots and UI states.

Long-Term Enhancements:
1. Build a dedicated component state gallery with automated snapshot generation.
2. Add a design token linter for contrast and spacing checks.

## Code Examples
1) Increase microcopy contrast
```css
:root {
  --text-muted: #8fa3b8;
  --text-muted-strong: #a9bfd6;
}
.text-muted { color: var(--text-muted-strong); }
```

2) Icon button hit area
```css
.icon-btn {
  width: 28px; height: 28px;
  position: relative;
}
.icon-btn::after {
  content: ""; position: absolute;
  inset: -8px; /* expands to 44px target */
}
```

3) Header action grouping
```css
.header-group { display: flex; gap: 8px; padding: 0 8px; }
.header-group + .header-group { border-left: 1px solid #1d2a3a; }
```

4) Focus ring standardization
```css
:root { --focus-ring: 0 0 0 2px rgba(0, 243, 255, 0.55); }
.focusable:focus-visible { box-shadow: var(--focus-ring); }
```

## Mockups
Before (dense header with flat action row):
```
[Logo] [Undo][Redo][Save][Load][Settings][Voice] [Session]
```
After (grouped actions with separators):
```
[Logo] [Undo][Redo] | [Save][Load] | [Settings][Voice]   [Session]
```

## Design Token Harvest
- Spacing: 4, 8, 12, 16, 24 (inferred from button padding and panel gutters; verify in CSS).
- Radius: mostly 0-2px (cut-corner aesthetic).
- Shadows: subtle panel shadows, stronger modal depth.
- Colors (inferred):
  - Background: near-black blue (#0b0f18 to #0f1625 range).
  - Accent cyan/teal: #00f3ff family for primary actions and focus rings.
  - Accent yellow: used for primary highlight (lightning icon).
- Typography: compact sans; small sizes require stronger contrast token.

## Appendix
Color/contrast notes:
- avg mean_lum 30.1, avg std_lum 27.1; low variance suggests microcopy contrast risk.
Typography scale:
- h3 samples present (12-typography/*); verify line-height and cap-height alignment.
Component inventory (by folder):
- 01-app-shell: 13
- 02-canvas-views: 2
- 02-header: 15
- 03-inventory: 8
- 03-panels: 15
- 03-sidebars: 1
- 04-components: 20
- 04-modals: 8
- 04-settings-modal: 3
- 05-chat: 10
- 05-component-editor: 2
- 05-modals: 7
- 06-canvas: 3
- 06-interactive-states: 1
- 06-settings: 3
- 07-chat: 9
- 07-inventory-components: 9
- 07-responsive: 7
- 08-buttons: 253
- 08-canvas: 6
- 10-forms: 140
- 12-typography: 8
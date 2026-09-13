# Dictionary

Shared names for UI elements in this prototype.

## Pages

| Term | What it is | File |
|---|---|---|
| **Badge Overview** | The badge's own page, holding the Start Date editor and the Sections of Schedule rows. It is the site's landing page, so it is `index.html` rather than a name of its own. | `index.html` |
| **Change Dates** | The date and time editing page, holding the Blocks, the Change Dates calendar and Reset to Defaults. | `change-dates.html` |

Both pages are served as they sit, with no build step, so a link between them is
a plain relative filename. `.nojekyll` at the root keeps GitHub Pages from
passing the files through Jekyll.

## Page links

| Term | What it is | Code hook |
|---|---|---|
| **Change Times link** | Clock icon on Badge Overview, next to the Start Date editor; opens Change Dates | `a.btn-icon[data-tooltip="Change Times & Date"]` |
| **Back link** | "‹ Back to badge" breadcrumb at the top of Change Dates; opens Badge Overview | `a.breadcrumb-link` |
| **Change Dates button** | "Change Times & Date" button centred over the Overview calendar, shown while the calendar is hovered or the button has keyboard focus, and hidden while the calendar shows its empty message. Opens Change Dates with the Start Date editor's current Start Date and Delivery Days filled in, saved or not (see Prefill parameters). | `.overview-cal-open`, `[data-overview-cal-target="open"]` |

## Overlays

| Term | What it is | Code hook |
|---|---|---|
| **Copy notice** | Dark pill fixed at the bottom centre of both pages saying this is a prototype copy, not a real Journey Tracker page. Clicks pass through it, except on the Tour button inside it; hidden when printing. | `.copy-notice` |

## Guided tour (both pages, `guided-tour.js`)

Seventeen steps that start on Badge Overview and finish on Change Dates. A step that asks for something (a click, a date, a drag) moves on by itself once it is done; a step that only points something out waits for Next. The step in progress is kept in sessionStorage, so the tour carries on across the Change Dates button and ends with the tab. Starting the tour calls the Schedule store's `reset()`, so the dates the steps name are the dates on screen; Change Dates steps switch the Change Dates calendar to Split. Nothing else is changed by the tour itself.

| Term | What it is | Code hook |
|---|---|---|
| **Tour card** | Floating card showing the step number and page, the step's title and instruction, an optional progress line (e.g. "2 of 3 days"), and Back, Next / Skip and an X that ends the tour. Sits beside what the step points at on whichever side has room, else in a corner, keeping clear of the Copy notice. A step on the other page shows a "Go to …" button instead. | `.tour-card` |
| **Welcome card** | The Tour card before step 1, on Badge Overview: Start tour or Not now. Shown on a first visit, on the Tour button, and with `?tour` on the URL. | `.tour-card [data-tour="start"]` |
| **Tour ring** | Pulsing accent outline over each element a step points at. Clicks pass through it. | `.tour-ring` |
| **Tour button** | "Take the tour" inside the Copy notice, hidden while the tour runs. On Badge Overview it opens the Welcome card; on Change Dates it starts the tour on Badge Overview. | `.tour-launch` |
| **Tour steps** | The list the tour runs, each with its page, ring, done test and text. The dates they name (Start Date Sep 14 on Mon, Wed, Thu; Sep 30 moved to Sep 29) are constants at the top of the file. | `steps` in `guided-tour.js`; `journey-tracker-tour-step` (sessionStorage), `journey-tracker-tour-seen` (localStorage) |

## Layout

| Term | What it is | Code hook |
|---|---|---|
| **Block** | Change Dates: a rounded, bordered box holding a group of controls. The first Block (grey) holds Start Date, Quest Delivery Days, Apply Changes To and Day Mappings. Each Time group below it (white) is also a Block, holding Before time, After time and Preview challenges. On Badge Overview the lookalike box is a Section, not a Block. The Reset to Defaults block is not one: it has no Block actions. | `#bulk-time-change-body .rounded-xl.border-border-1` |
| **Block actions** | Change Dates: the Block Cancel and Block Save pair at the bottom of every Block, above a top border, with the Block note to their left. Both are greyed out while the Block is unchanged. | `.block-actions`, `[data-block-actions]` (its value is the Block's kind: `settings`, `calendar` or `time`) |
| **Block Cancel** / **Block Save** | Puts the Block back to how it was when the page loaded or the Block was last saved / takes that mark again. Neither submits anything: in the live app the page's own Save at the bottom does that, and here the Demo guards stop even that. A Block owns its own form fields plus one slice of the Schedule store — the first Block the Start Date and Quest Delivery Days, the calendar every row's date, a Time group its own rows' times. Always use the full name so they aren't confused with the form's Save and Cancel at the bottom of the page. | `[data-block-action="cancel"]` / `[data-block-action="save"]` |
| **Block note** | Line at the left of the Block actions: "Not saved yet" while the Block is changed, then a green "Saved" line for four seconds after Block Save. | `[data-block-note]` |

## Schedule rows

| Term | What it is | Code hook |
|---|---|---|
| **Section** | Card grouping Schedule rows under a header (Badge Overview). Change Dates shows no Section cards, but every row still sits inside an element carrying its section id. | `article.milestone`; section id on both pages: `[data-milestone-id]` |
| **Time group** | Change Dates Block of rows sharing a due time | `[data-target="bulk-time-change.timeGroup"]` |
| **Preview item** | Change Dates wrapper around a Schedule row and its checkbox; its data attributes repeat the row's date, time and day | `[data-bulk-time-change-target="challengeItem"]` |
| **Schedule row** | A launch or challenge row with a due date (both pages) | `article.cl-row[data-due-date]` |
| **Launch row** / **Challenge row** / **Close row** | Schedule row of that type. A Close row also has the `launch` class, so check `close-challenge` first. | `.cl-row.launch` / `.cl-row.badge-task` / `.cl-row.close-challenge` |
| **Type pill** | "LAUNCH" / "CHALLENGE" / "CLOSE" label on a row | `.cl-pill--launch` / `.cl-pill--challenge` / `.cl-pill--close` |
| **Date pill** | Due date and time, e.g. "12:00am on Aug 20, 2026" | `.modern-info-pill[data-pill=date]` |
| **Day pill** | Scheduled day offset, e.g. "Day -10" | `.modern-info-pill[data-pill=scheduled-day]` |

## Start Date editor (Badge Overview only, driven by `badge-overview-page.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Start Date editor** | The whole widget; it has a view mode and an edit mode | `#badge-inline-date-editor` |
| **Start Date pill** | View mode: calendar icon, date, pencil. Click opens edit mode. Always use the full name so it isn't confused with a row's Date pill. | `[data-action*="inline-date-editor#enterEditMode"]` |
| **Clear Start Date button** | X beside the Start Date pill. It has no JS listener, so clicking it does nothing. | `[aria-label="Clear Start Date"]` |
| **Date field** | Edit mode: the Start Date field, an input-style button that opens or closes the Date-select Calendar. The same widget as the Start Date field on Change Dates. | `[data-action*="date-picker#toggle"]` |
| **Save button** / **Cancel button** | Green check (saves the Start Date and Delivery Days; every dated row moves to the new date for its Day number) / grey X (reverts) | `.inline-date-action-btn--save` / `--cancel` |
| **Delivery Days checkboxes** | Mon–Thu toggles in edit mode; applied on Save | `[data-inline-date-editor-target="dayCheckbox"]` |

## Date-select Calendar (both pages, `date-picker.js`)

Drawn under whichever Start Date field it belongs to: the Date field in the Start Date editor's edit mode on Badge Overview, and the Start Date field in the first Block on Change Dates. It only reports the date that was picked; what that date means is the page's business.

| Term | What it is | Code hook |
|---|---|---|
| **Date-select Calendar** | Popup under the Start Date field | `[data-calendar-popup-target]` container |
| **Field clear button** | Small x inside the Start Date field that empties it | `[data-action*="date-picker#clear"]` |
| **Type-in box** | MM/DD/YYYY text input at the top of the Calendar; Enter commits | `[data-calendar-popup-target="typeInput"]` |
| **Prev / Next arrows** | Step by a month (day view), a year (month view), or 12 years (year view) | `[data-cal-nav="prev"]` / `[data-cal-nav="next"]` |
| **Month button** / **Year button** | Header labels that switch to the month or year picker | `[data-calendar-popup-target="monthBtn"]` / `yearBtn` |
| **Day cell** | A date in the grid; click commits it | `.cal-popup-d[data-date]` |
| **Month cell** / **Year cell** | Picker choices; click returns to day view | `.cal-popup-d[data-pick]` |
| **Today button** | Calendar footer; commits today's date | `[data-cal-today="1"]` |

## Overview calendar (Badge Overview only, in the Start Date editor's edit mode)

| Term | What it is | Code hook |
|---|---|---|
| **Overview calendar** | "Schedule" section below the Delivery Days checkboxes: one grid of weeks from the Start Date to the last scheduled day with a positive Day number. Previews the editor's current Start Date and Delivery Days before Save. Negative days are not shown. | `.overview-cal-edit` |
| **Range label** | First and last date shown, e.g. "Sep 8 – Oct 5", beside the heading | `[data-overview-cal-target="range"]` |
| **Month label** | Month abbreviation in the left gutter, on the first week and on the week each later month begins | `.overview-cal-month` |
| **Month tint** | Grey fill on every other month so a month change is visible mid-week | `.overview-cal-d.is-alt-month` |
| **Overview day** | A date in the grid. Dates outside the range are faded; the Start Date is filled. Its `data-tooltip` gives the Day number and row count, but this static copy doesn't show tooltips. | `.overview-cal-d[data-date]`, `.is-out`, `.overview-cal-num.is-selected` |
| **View toggle** | "Days" / "Rows" switch beside the heading; the choice is remembered in this browser | `[data-overview-cal-view]` (`aria-pressed="true"` on the current view) |
| **Days view** | Every date with a Schedule row is filled blue, like the Start Date. No dots. | `.overview-cal[data-view="days"]`, `.overview-cal-num.is-scheduled` |
| **Rows view** | One dot per Schedule row under its date, coloured like its Type pill. Only the Start Date is filled. | `.overview-cal[data-view="rows"]` |
| **Row dot** | One row's dot: launch purple, challenge blue, close grey | `.overview-cal-dot--launch` / `--challenge` / `--close` |
| **Type legend** | Key under the calendar in Rows view, listing only the types shown | `[data-overview-cal-target="legend"]` |

## Change Dates calendar (Change Dates only, `change-dates-calendar.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Change Dates calendar** / **Date Change Calendar** | Either name for the same thing: its own Block on Change Dates, between the first Block and the Time groups. One grid of weeks covering the whole schedule, where a date is dragged onto another date to move or swap the rows on it. Five prototype versions (Simple, Circles, Split, Middle, Full) sit behind the toggle in its header so they can be compared. Every edit goes through the Schedule store, so the Time groups below it are the preview. | `#dates-calendar`, `.dcal`; current version in `data-variant` |
| **Undo** / **Redo** | Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z (Cmd on a Mac) anywhere on Change Dates, in every version, and the Undo and Redo buttons in Middle and Full's tool row. Undo takes back the last change to the Schedule store, whatever made it: a drop, the Start Date field, Quest Delivery Days, a Block Cancel, Reset dates or Reset to Defaults. Redo puts back what Undo took, until a new change is made. Kept for the page load only. Ignored while a drag is held, and inside a text field, which keeps its own undo. | `[data-dcal-undo]` / `[data-dcal-redo]`; `schedule.undo()` / `schedule.redo()` |

## Reset to Defaults (Change Dates only, `change-dates-blocks.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Reset to Defaults block** | Red box under the last Time group and above the form's Save, holding the Reset to Defaults button. Not a Block: it has no Block actions. | `#reset-defaults-block`, `.reset-block` |
| **Reset to Defaults button** | Red button that opens the Reset confirm. On confirm it drops every change and applies the Default schedule, which unschedules Week 6 and BONUS. Not the calendar's **Reset dates** button, which only restores the dates the page loaded with. | `[data-reset-defaults]` |
| **Reset confirm** | "Reset to Defaults?" dialog, built from the page's own confirm template. Says what is dropped and that the form's Save at the bottom is still needed, as it is in the live app. Closes on its Cancel, its X, the backdrop or Escape. | `.block-confirm`, cloned from `#jt-global-confirm-template` |

## Start Date and Quest Delivery Days (Change Dates only, `change-dates-page.js`)

The pair at the top of the first Block. They work like the Start Date editor's Date field and Delivery Days checkboxes: the same Date-select Calendar opens under the field, and a change is a preview rather than a submit. What the preview is differs. The editor previews into its own Overview calendar and only reaches the Schedule store on its Save; here the Change Dates calendar and the Time groups are the preview and both are rendered from the store, so a change goes straight into the store and the first Block's Block Cancel is what puts it back. In the live app the form's Save at the bottom of the page is the only thing that submits; here the Demo guards stop it.

| Term | What it is | Code hook |
|---|---|---|
| **Start Date field** | Input-style button showing the Start Date; click opens the Date-select Calendar. A picked date, a committed Type-in box or the Field clear button applies it, together with the current Quest Delivery Days, through `setSchedule`: every dated row keeps its Day number and moves to that day's new date. | `#day-schedule-form [data-controller~="date-picker"]` |
| **Quest Delivery Days checkboxes** | Mon–Thu pills under the Start Date field. Toggling one applies the whole set, together with the Start Date field's current date. Always use the full name so they aren't confused with the editor's Delivery Days checkboxes. | `input[name$="[delivery_days][]"]` |

## Change Dates prefill (Change Dates only, `change-dates-page.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Prefill parameters** | `?start_date=YYYY-MM-DD&delivery_days=monday,tuesday` on the Change Dates URL, set by the Change Dates button. Once the page has loaded they are applied like a change made in the Start Date field and Quest Delivery Days checkboxes: they go into the Schedule store, so the Change Dates calendar and the Time groups show them straight away. The Blocks take their mark first, so the prefill is an unsaved change to the first Block that its Block Cancel or Undo takes back. An empty `start_date` clears the field; an invalid date is ignored, as are unknown day names. | `start_date` / `delivery_days` query parameters |

## Schedule store (both pages, `schedule-store.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Schedule store** | Source of truth for every date and day on a page. Seeded from the page's markup on load, plus any Row with no article that markup leaves out; changes rewrite only text, data attributes and checkbox state, and are kept in localStorage so both pages agree. `reset()` restores the markup's dates. | `window.JourneySchedule` |
| **Row record** | Store entry for one Schedule row: `id`, `type` (`challenge` / `launch` / `close`), `title`, `sectionId`, `position`, `dueDate` (`YYYY-MM-DD`), `dueTime` (`HH:MM`), `utcOffset`, `scheduledDay` | `getRow(id)`, `getRows()`, `getRowsInSection(sectionId)`, `getSectionOfRow(id)` |
| **Unscheduled row** | A Row record with a null `dueDate`, so null `dueTime` and `scheduledDay` too. Its Date pill and Day pill are hidden, and on Change Dates so is its Preview item, along with any Time group left with none — the only thing the store renders as style rather than text. The Change Dates calendar's Split pane is the one place an unscheduled row is listed: hover or click its Section in the legend, and its undated rows sit under an Unscheduled heading at the foot of the pane, where dragging one onto a date schedules it — the store gives it that date and midnight. | `updateRow(id, { dueDate: null })` |
| **Row with no article** | A row the page has no markup for. Change Dates was captured with only the rows that had a date, because the live page groups rows by due time and an undated row has none, so 18 of the badge's 98 rows (13 in Week 6, 5 in BONUS) are missing from it. They are listed in the store's code, the way section names are, and seeded with no bindings, so both pages know the same 98 rows and a Section's undated rows can be shown on Change Dates as well. Nothing on Change Dates renders them, so one scheduled by a drag out of the calendar's Unscheduled group shows in the calendar but in no Time group below. | `UNDATED_ROWS` in `schedule-store.js` |
| **Default schedule** | The schedule the badge is meant to start from: the markup's own start date, delivery days and dates, with every row in Week 6 and BONUS unscheduled. Built from the seed, so a change never moves it. | `getDefaultSchedule()`, `getDefaultRow(id)`; `UNSCHEDULED_SECTIONS` in `schedule-store.js` |
| **Scheduled day** | The number in a Day pill: delivery days counted from the Start Date, which is Day 1. There is no Day 0. | `scheduledDayFor(iso)`, `dateForScheduledDay(n)`; `dateForScheduledDay(n, { startDate, deliveryDays })` counts with unsaved choices instead |

Changing data: `updateRow(id, { dueDate, dueTime, scheduledDay })` (a new `dueDate` recalculates `scheduledDay` unless one is passed; a null one unschedules the row) and `setSchedule({ startDate, deliveryDays })` (every dated row keeps its Day number and time and moves to that day's new date; rows never re-order). `subscribe(fn)` is called after every change. `reset()` restores the markup's dates; `resetToDefaults()` applies the Default schedule instead, and unlike `reset()` is stored like any other change. `undo()` takes back the last of any of these and `redo()` puts it back (`undoCount()` / `redoCount()` say how many each can), notifying with type `undo` or `redo` and the `rowIds` it moved; a change that changed nothing is not counted, and any new change empties the redo history.

What the store writes on each change:

| Element | Written |
|---|---|
| Schedule row | `data-due-date` |
| Date pill / Day pill | `[data-pill-text]` text |
| Preview item | `data-scheduled-day`, `data-original-time`, `data-original-due-date`, `data-before-day`, `data-preview-date` |
| Time group | `data-scheduled-day` (copied from its first Preview item) |
| Start Date field (Change Dates) | label text, popup `data-calendar-popup-selected-value` |
| Quest Delivery Days (Change Dates) | checkbox checked state, `#day-schedule-form` `data-selected-delivery-days` |
| Start Date editor (Badge Overview) | `data-inline-date-editor-original-start-at-value`, `data-inline-date-editor-original-delivery-days-value`; the editor updates its own pill, field and checkboxes |

## Demo guards (both pages, `demo-guards.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Demo guards** | Stops the live app's own controls that came with the captured markup: every form submit on the page (the form's Save at the bottom of Change Dates, Share, theme mode) and every link to `journey.actonacademy.org` (nav, logo, the form's Cancel). Both are cancelled in the capture phase, so the prototype's own handlers still run — the Save button saves to the Schedule store as before, it just never posts. Nothing the prototype does leaves the browser. | `demo-guards.js`, loaded before `schedule-store.js` |

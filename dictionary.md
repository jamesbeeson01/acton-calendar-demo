# Dictionary

Shared names for UI elements in this prototype.

## Page links

| Term | What it is | Code hook |
|---|---|---|
| **Change Times link** | Clock icon on Badge Overview, next to the Start Date editor; opens Change Dates | `a.btn-icon[data-tooltip="Change Times & Date"]` |
| **Back link** | "‹ Back to badge" breadcrumb at the top of Change Dates; opens Badge Overview | `a.breadcrumb-link` |
| **Change Dates button** | "Change Times & Date" button centred over the Overview calendar, shown while the calendar is hovered or the button has keyboard focus, and hidden while the calendar shows its empty message. Opens Change Dates with the Start Date editor's current Start Date and Delivery Days filled in, saved or not (see Prefill parameters). | `.overview-cal-open`, `[data-overview-cal-target="open"]` |

## Overlays

| Term | What it is | Code hook |
|---|---|---|
| **Copy notice** | Dark pill fixed at the bottom centre of both pages saying this is a prototype copy, not a real Journey Tracker page. Clicks pass through it; hidden when printing. | `.copy-notice` |

## Layout

| Term | What it is | Code hook |
|---|---|---|
| **Block** | Change Dates: a rounded, bordered box holding a group of controls. The first Block (grey) holds Start Date, Quest Delivery Days, Apply Changes To and Day Mappings. Each Time group below it (white) is also a Block, holding Before time, After time and Preview challenges. On Badge Overview the lookalike box is a Section, not a Block. | `#bulk-time-change-body .rounded-xl.border-border-1` |

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
| **Date field** | Edit mode: input-style button that opens or closes the Calendar | `[data-action*="date-picker#toggle"]` |
| **Field clear button** | Small x inside the Date field that empties it | `[data-action*="date-picker#clear"]` |
| **Save button** / **Cancel button** | Green check (saves the Start Date and Delivery Days; every dated row moves to the new date for its Day number) / grey X (reverts) | `.inline-date-action-btn--save` / `--cancel` |
| **Delivery Days checkboxes** | Mon–Thu toggles in edit mode; applied on Save | `[data-inline-date-editor-target="dayCheckbox"]` |
| **Date-select Calendar** | Popup under the Date field | `[data-calendar-popup-target]` container |
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

## Change Dates prefill (Change Dates only, `change-dates-page.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Prefill parameters** | `?start_date=YYYY-MM-DD&delivery_days=monday,tuesday` on the Change Dates URL, set by the Change Dates button. On load they fill the Start Date field and Quest Delivery Days checkboxes without saving: the Schedule store and every row's date stay as they were. An empty `start_date` clears the field; an invalid date is ignored, as are unknown day names. The store rewrites these fields on its next change. | `start_date` / `delivery_days` query parameters |

## Schedule store (both pages, `schedule-store.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Schedule store** | Source of truth for every date and day on a page. Seeded from the page's markup on load; changes rewrite only text, data attributes and checkbox state, and are kept in localStorage so both pages agree. `reset()` restores the markup's dates. | `window.JourneySchedule` |
| **Row record** | Store entry for one Schedule row: `id`, `type` (`challenge` / `launch` / `close`), `title`, `sectionId`, `position`, `dueDate` (`YYYY-MM-DD`), `dueTime` (`HH:MM`), `utcOffset`, `scheduledDay` | `getRow(id)`, `getRows()`, `getRowsInSection(sectionId)`, `getSectionOfRow(id)` |
| **Scheduled day** | The number in a Day pill: delivery days counted from the Start Date, which is Day 1. There is no Day 0. | `scheduledDayFor(iso)`, `dateForScheduledDay(n)`; `dateForScheduledDay(n, { startDate, deliveryDays })` counts with unsaved choices instead |

Changing data: `updateRow(id, { dueDate, dueTime, scheduledDay })` (a new `dueDate` recalculates `scheduledDay` unless one is passed) and `setSchedule({ startDate, deliveryDays })` (every dated row keeps its Day number and time and moves to that day's new date; rows never re-order). `subscribe(fn)` is called after every change.

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

# Dictionary

Shared names for UI elements in this prototype.

## Page links

| Term | What it is | Code hook |
|---|---|---|
| **Change Times link** | Clock icon on Badge Overview, next to the Start Date editor; opens Change Dates | `a.btn-icon[data-tooltip="Change Times & Date"]` |
| **Back link** | "‹ Back to badge" breadcrumb at the top of Change Dates; opens Badge Overview | `a.breadcrumb-link` |

## Overlays

| Term | What it is | Code hook |
|---|---|---|
| **Copy notice** | Dark pill fixed at the bottom centre of both pages saying this is a prototype copy, not a real Journey Tracker page. Clicks pass through it; hidden when printing. | `.copy-notice` |

## Schedule rows

| Term | What it is | Code hook |
|---|---|---|
| **Section** | Card grouping Schedule rows under a header (Badge Overview). Change Dates shows no Section cards, but every row still sits inside an element carrying its section id. | `article.milestone`; section id on both pages: `[data-milestone-id]` |
| **Time group** | Change Dates card of rows sharing a due time | `[data-target="bulk-time-change.timeGroup"]` |
| **Preview item** | Change Dates wrapper around a Schedule row and its checkbox; its data attributes repeat the row's date, time and day | `[data-bulk-time-change-target="challengeItem"]` |
| **Schedule row** | A launch or challenge row with a due date (both pages) | `article.cl-row[data-due-date]` |
| **Launch row** / **Challenge row** | Schedule row of that type | `.cl-row.launch` / `.cl-row.badge-task` |
| **Type pill** | "LAUNCH" / "CHALLENGE" label on a row | `.cl-pill--launch` / `.cl-pill--challenge` |
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

## Schedule store (both pages, `schedule-store.js`)

| Term | What it is | Code hook |
|---|---|---|
| **Schedule store** | Source of truth for every date and day on a page. Seeded from the page's markup on load; changes rewrite only text, data attributes and checkbox state, and are kept in localStorage so both pages agree. `reset()` restores the markup's dates. | `window.JourneySchedule` |
| **Row record** | Store entry for one Schedule row: `id`, `type` (`challenge` / `launch` / `close`), `title`, `sectionId`, `position`, `dueDate` (`YYYY-MM-DD`), `dueTime` (`HH:MM`), `utcOffset`, `scheduledDay` | `getRow(id)`, `getRows()`, `getRowsInSection(sectionId)`, `getSectionOfRow(id)` |
| **Scheduled day** | The number in a Day pill: delivery days counted from the Start Date, which is Day 1. There is no Day 0. | `scheduledDayFor(iso)`, `dateForScheduledDay(n)` |

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

# Dictionary

Shared names for UI elements in this prototype.

## Page links

| Term | What it is | Code hook |
|---|---|---|
| **Change Times link** | Clock icon on Badge Overview, next to the Start Date editor; opens Change Dates | `a.btn-icon[data-tooltip="Change Times & Date"]` |
| **Back link** | "‹ Back to badge" breadcrumb at the top of Change Dates; opens Badge Overview | `a.breadcrumb-link` |

## Schedule rows

| Term | What it is | Code hook |
|---|---|---|
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
| **Save button** / **Cancel button** | Green check (submits) / grey X (reverts) | `.inline-date-action-btn--save` / `--cancel` |
| **Date-select Calendar** | Popup under the Date field | `[data-calendar-popup-target]` container |
| **Type-in box** | MM/DD/YYYY text input at the top of the Calendar; Enter commits | `[data-calendar-popup-target="typeInput"]` |
| **Prev / Next arrows** | Step by a month (day view), a year (month view), or 12 years (year view) | `[data-cal-nav="prev"]` / `[data-cal-nav="next"]` |
| **Month button** / **Year button** | Header labels that switch to the month or year picker | `[data-calendar-popup-target="monthBtn"]` / `yearBtn` |
| **Day cell** | A date in the grid; click commits it | `.cal-popup-d[data-date]` |
| **Month cell** / **Year cell** | Picker choices; click returns to day view | `.cal-popup-d[data-pick]` |
| **Today button** | Calendar footer; commits today's date | `[data-cal-today="1"]` |

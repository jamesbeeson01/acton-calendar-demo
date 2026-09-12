(function () {
  // Five prototypes of the Change Dates calendar in one Block, switched by the
  // Version toggle, so they can be compared by feel:
  //
  //   Simple  drag one date onto another; hover popup; no options.
  //   Circles Simple with the Overview calendar's shape: equal columns, the
  //           Section legend down the left, and a filled circle per scheduled
  //           date, drawn as a pie when a date holds more than one Section.
  //   Split   Circles rearranged: the details Circles shows in a hover popup
  //           sit in a pane down the left instead, and the Section legend
  //           moves to the right of the grid. Clicking a date keeps it in the
  //           pane, the way Middle does, and the pane itself is a drag source:
  //           a whole date from the grid, one Section's rows on that date, or
  //           a single row, all onto another date.
  //   Middle  the same drag plus Shift later dates, Undo, and a details panel
  //           under the calendar.
  //   Full    Section ribbons, multi-date selection, week insert/remove, row
  //           drag out of a side panel, and Apply Changes To limiting a drag.
  //
  // All four edit the Schedule store, so the Time groups below are the preview:
  // their Date pills and Day pills change as soon as a drag lands.

  var schedule = window.JourneySchedule;
  var mount = document.getElementById('dates-calendar');
  if (!schedule || !mount) return;

  var VARIANT_KEY = 'journey-tracker-dates-calendar-variant';
  var MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  var DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var TYPE_LABEL = { launch: 'Launch', challenge: 'Challenge', close: 'Close' };
  // Apply Changes To checkbox values, in the store's row types.
  var FILTER_TYPE = { Launch: 'launch', BadgeTask: 'challenge', Close: 'close' };
  var VARIANTS = [
    { id: 'simple', label: 'Simple' },
    { id: 'circles', label: 'Circles' },
    { id: 'split', label: 'Split' },
    { id: 'middle', label: 'Middle' },
    { id: 'full', label: 'Full' }
  ];
  var HINTS = {
    simple: 'Drag a date onto another date. An empty date takes its rows; a date that has rows swaps with it. Hover a date to see what is scheduled.',
    circles: 'Drag a date onto another date, the same as Simple. A filled circle is a scheduled date, coloured by its Section; a date holding more than one Section is split into a pie by row count. Hover a date to see its rows.',
    split: 'The same grid and drag as Circles, with the details in the pane on the left and the Section legend on the right. Click a date to keep it in the pane, then drag a row, or a Section header, out of the pane onto another date.',
    middle: 'Drag a date onto another date to move or swap it. With Shift later dates on, that date and every date after it move together. Click a date to keep it in the panel below.',
    full: 'Click a date to select it, Shift-click for a range, Ctrl-click to add one. Drag the selection to move it, drag a row out of the panel to move just that row, or use + and − beside a week to insert or remove a week.'
  };

  // The page's own button classes, so these match Add Day Mapping and Remove.
  var BTN_BASE = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.1px] whitespace-nowrap leading-none border cursor-pointer no-underline hover:no-underline focus-visible:outline-none focus-visible:shadow-focus active:translate-y-px transition-[background-color,border-color,color,box-shadow] duration-150 disabled:bg-bg-offset disabled:text-fg-3 disabled:cursor-not-allowed disabled:shadow-none ';
  var BTN_OUTLINE = BTN_BASE + 'bg-bg-surface text-fg-1 hover:text-fg-1 focus:text-fg-1 focus-visible:text-fg-1 active:text-fg-1 visited:text-fg-1 border-border-2 shadow-xs hover:bg-bg-subtle hover:border-border-3 h-7 px-3 text-[12px]';
  var BTN_GHOST = BTN_BASE + 'border-transparent bg-transparent text-fg-2 hover:bg-bg-subtle hover:text-fg-1 focus:text-fg-2 focus-visible:text-fg-2 active:text-fg-2 visited:text-fg-2 h-7 px-3 text-[12px]';

  // ---- Styles ----------------------------------------------------------------

  var styleTag = document.createElement('style');
  styleTag.textContent =
    '.dcal-head{align-items:center;display:flex;flex-wrap:wrap;gap:6px 10px;margin-bottom:6px}' +
    '.dcal-head .form-label{margin:0}' +
    '.dcal-range{color:var(--fg-3);font-size:12px;margin-right:auto}' +
    '.dcal-proto{color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;text-transform:uppercase}' +
    '.dcal-seg{display:inline-flex;padding:2px}' +
    '.dcal-seg button{background:transparent;border:0;border-radius:var(--radius-pill);color:var(--fg-3);cursor:pointer;font-size:12px;font-weight:var(--weight-semibold);line-height:1;padding:5px 12px}' +
    '.dcal-seg button[aria-pressed="true"]{background:var(--bg-surface);box-shadow:var(--shadow-xs);color:var(--fg-1)}' +
    '.dcal-hint{margin:0 0 8px}' +
    '.dcal-tools{align-items:center;display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}' +
    '.dcal-note{color:var(--fg-3);font-size:11px}' +
    '.dcal-body{display:flex;flex-direction:column;gap:12px}' +
    '.dcal[data-variant="full"] .dcal-body{align-items:flex-start;flex-direction:row;flex-wrap:wrap}' +
    '.dcal[data-variant="full"] .dcal-card{flex:1 1 440px;min-width:0}' +
    '.dcal[data-variant="full"] .dcal-panel{flex:1 1 270px;max-width:360px}' +
    '.dcal-card{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:var(--radius-md);padding:2px 6px 6px;-webkit-user-select:none;user-select:none}' +
    '.dcal-earlier{background:transparent;border:0;color:var(--accent);cursor:pointer;font-size:11px;padding:5px 2px}' +
    '.dcal-earlier:hover{text-decoration:underline}' +
    '.dcal-week,.dcal-dh{display:grid;grid-template-columns:var(--dcal-cols)}' +
    '.dcal-dh span{color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;padding:4px 0 5px;text-align:center;text-transform:uppercase}' +
    '.dcal-week{border-top:1px solid var(--border-1)}' +
    '.dcal-gutter{align-items:center;display:flex;flex-direction:column;gap:3px;justify-content:center;padding:4px 2px}' +
    '.dcal-month{color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;text-transform:uppercase}' +
    '.dcal-week-acts{display:flex;gap:2px;opacity:0;transition:opacity .12s ease}' +
    '.dcal-week:hover .dcal-week-acts,.dcal-week-acts:focus-within{opacity:1}' +
    '.dcal-week-acts button{align-items:center;background:var(--bg-surface);border:1px solid var(--border-2);border-radius:var(--radius-pill);color:var(--fg-2);cursor:pointer;display:inline-flex;font-size:12px;height:17px;justify-content:center;line-height:1;padding:0;width:17px}' +
    '.dcal-week-acts button:hover{background:var(--bg-subtle);border-color:var(--border-3);color:var(--fg-1)}' +
    '.dcal-d{--pad:4px;display:flex;flex-direction:column;gap:3px;min-height:52px;min-width:0;padding:4px var(--pad);position:relative}' +
    '.dcal-d.is-narrow{--pad:1px}' +
    '.dcal-d.is-alt-month{background:var(--bg-offset)}' +
    // Non-delivery days still take a drop, but are hatched as off-schedule.
    '.dcal-d.is-off{background-image:repeating-linear-gradient(135deg,transparent 0 5px,var(--border-1) 5px 6px)}' +
    '.dcal-d.has-rows{cursor:grab}' +
    '.dcal.is-dragging,.dcal.is-dragging *{cursor:grabbing!important}' +
    '.dcal-d-top{align-items:center;display:flex;gap:3px;justify-content:space-between}' +
    '.dcal-d.is-narrow .dcal-d-top{justify-content:center}' +
    '.dcal-num{align-items:center;border-radius:var(--radius-pill);color:var(--fg-1);display:inline-flex;font-size:11px;height:18px;justify-content:center;min-width:18px}' +
    '.dcal-d.is-out .dcal-num{color:var(--fg-3);opacity:.5}' +
    '.dcal-d.is-start .dcal-num{background:var(--accent);color:var(--fg-on-accent);font-weight:var(--weight-semibold)}' +
    '.dcal-daynum{color:var(--fg-3);font-size:10px;white-space:nowrap}' +
    '.dcal-moved{background:var(--accent);border-radius:50%;flex:none;height:5px;width:5px}' +
    '.dcal-d-body{display:flex;flex-direction:column;gap:2px;min-width:0}' +
    '.dcal-d.has-rows:hover{box-shadow:inset 0 0 0 1px var(--border-3)}' +
    '.dcal-d.is-picked{background-color:var(--accent-tint);box-shadow:inset 0 0 0 2px var(--accent)}' +
    '.dcal-d.is-linked{box-shadow:inset 0 0 0 2px var(--accent)}' +
    '.dcal-d.is-sec-dim .dcal-d-body{opacity:.25}' +
    '.dcal-d.is-drag-source{opacity:.5;outline:2px dashed var(--border-3);outline-offset:-3px}' +
    '.dcal-d.is-will-move{background-color:var(--accent-soft)}' +
    '.dcal-d.is-will-land{background-color:var(--accent-tint);box-shadow:inset 0 0 0 1px var(--accent)}' +
    '.dcal-d.is-will-double{background-color:color-mix(in srgb,var(--st-late) 22%,transparent)}' +
    '.dcal-d.is-drop-target{box-shadow:inset 0 0 0 2px var(--accent)}' +
    '.dcal-d.is-drop-invalid{box-shadow:inset 0 0 0 2px var(--st-overdue)}' +
    '.dcal-d[data-drop-tag]:after{background:var(--accent);border-radius:var(--radius-pill);box-shadow:var(--shadow-md);color:var(--fg-on-accent);content:attr(data-drop-tag);font-size:10px;font-weight:var(--weight-semibold);left:50%;padding:3px 8px;position:absolute;top:50%;transform:translate(-50%,-50%);white-space:nowrap;z-index:3}' +
    '.dcal-d.is-drop-invalid[data-drop-tag]:after{background:var(--st-overdue)}' +
    '@keyframes dcal-flash{0%{background-color:var(--accent-soft)}100%{background-color:transparent}}' +
    '.dcal-d.is-flash{animation:dcal-flash 1.1s ease-out}' +
    // Simple: one dot per row, in its Section's colour.
    '.dcal-dots{display:flex;flex-wrap:wrap;gap:3px;justify-content:center}' +
    '.dcal-dot{background:var(--dm);border-radius:var(--radius-pill);flex:none;height:7px;width:7px}' +
    // Circles: the Overview calendar's shape, with the legend beside the grid.
    // The circle is the whole date here, so nothing in this view draws a
    // rectangle: no week rules, no month tint, and every state rides on the
    // circle itself rather than on the cell's edges.
    // Capped rather than fit-content: shrink-to-fit collapsed the card so far
    // that the legend wrapped above the grid instead of sitting beside it.
    '.dcal-card--circles{display:flex;flex-wrap:wrap;gap:18px;max-width:780px}' +
    '.dcal[data-variant="circles"] .dcal-card,.dcal[data-variant="split"] .dcal-card{padding:10px 12px}' +
    '.dcal[data-variant="circles"] .dcal-week,.dcal[data-variant="split"] .dcal-week{border-top:0}' +
    '.dcal[data-variant="circles"] .dcal-d.is-alt-month,.dcal[data-variant="split"] .dcal-d.is-alt-month{background:none}' +
    '.dcal-grid-wrap{flex:1 1 320px;max-width:520px;min-width:0}' +
    '.dcal-legend--side{align-content:flex-start;flex:0 0 196px;flex-direction:column;gap:9px;margin-top:6px;padding:4px 16px 4px 4px}' +
    '.dcal-d--circle{align-items:center;justify-content:center;min-height:46px}' +
    '.dcal-d--circle .dcal-d-body{align-items:center}' +
    // No hatching here: a date with no circle already reads as nothing due.
    '.dcal-d--circle.is-off{background-image:none}' +
    '.dcal-circle{align-items:center;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08);display:inline-flex;font-size:12px;font-weight:var(--weight-semibold);height:28px;justify-content:center;position:relative;transition:transform .12s ease,box-shadow .12s ease;width:28px}' +
    '.dcal-circle.is-plain{background:none;box-shadow:none;color:var(--fg-1);font-weight:var(--weight-regular)}' +
    '.dcal-d--circle.is-off .dcal-circle.is-plain,.dcal-d.is-out .dcal-circle.is-plain{color:var(--fg-3);opacity:.5}' +
    '.dcal-circle.is-start-ring{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--accent)}' +
    // Hovering grows the circle instead of outlining the cell.
    '.dcal-d--circle.has-rows:hover{box-shadow:none}' +
    '.dcal-d--circle.has-rows:hover .dcal-circle{box-shadow:var(--shadow-md);transform:scale(1.3);z-index:1}' +
    '.dcal-d--circle.is-drag-source{opacity:.45;outline:0}' +
    '.dcal-d--circle.is-picked{background-color:transparent;box-shadow:none}' +
    '.dcal-d--circle.is-picked .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 5px var(--accent),var(--shadow-md);transform:scale(1.15)}' +
    // Split: hovering a Schedule row below rings its date's circle, since a
    // rectangle would look out of place here.
    '.dcal-d--circle.is-linked{box-shadow:none}' +
    '.dcal-d--circle.is-linked .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--accent)}' +
    '.dcal-d--circle.is-will-land,.dcal-d--circle.is-will-double,.dcal-d--circle.is-drop-target,.dcal-d--circle.is-drop-invalid{background-color:transparent;box-shadow:none}' +
    '.dcal-d--circle.is-will-land .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--accent)}' +
    '.dcal-d--circle.is-will-double .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--st-late)}' +
    '.dcal-d--circle.is-drop-target .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--accent);transform:scale(1.3);z-index:1}' +
    '.dcal-d--circle.is-drop-invalid .dcal-circle{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px var(--st-overdue)}' +
    '.dcal-d--circle.is-flash{animation:none}' +
    '.dcal-d--circle.is-flash .dcal-circle{animation:dcal-flash-ring 1.1s ease-out}' +
    '@keyframes dcal-flash-ring{0%{box-shadow:0 0 0 2px var(--bg-surface),0 0 0 5px var(--accent)}100%{box-shadow:none}}' +
    // Split: the Circles grid between a details pane on the left and the
    // legend on the right. The pane stretches to the calendar's height, so it
    // reads as the other half of one box and nothing moves as the details
    // change from date to date. The min-height only matters once the pane
    // wraps below the calendar and has no card beside it to match.
    '.dcal[data-variant="split"] .dcal-body{align-items:stretch;flex-direction:row;flex-wrap:wrap}' +
    '.dcal[data-variant="split"] .dcal-card{flex:1 1 420px;min-width:0}' +
    '.dcal[data-variant="split"] .dcal-panel{flex:1 1 270px;max-width:360px;min-height:236px}' +
    '.dcal-legend--side.is-right{flex-basis:168px;padding:4px 4px 4px 16px}' +
    // Middle: one chip per Section on that date.
    '.dcal-chip{align-items:center;background:color-mix(in srgb,var(--dm) 16%,var(--bg-surface));border-left:3px solid var(--dm);border-radius:4px;color:var(--fg-1);display:flex;font-size:10px;font-weight:var(--weight-semibold);gap:4px;justify-content:space-between;line-height:1;overflow:hidden;padding:3px 4px;white-space:nowrap}' +
    '.dcal-chip span{color:var(--fg-2);font-weight:var(--weight-regular)}' +
    // Full: a Section ribbon runs across the dates it covers.
    '.dcal-lane{display:flex;flex-direction:column;height:14px;justify-content:center}' +
    '.dcal-rib{align-items:center;background:color-mix(in srgb,var(--dm) 22%,var(--bg-surface));color:var(--fg-1);display:flex;font-size:10px;font-weight:var(--weight-semibold);gap:4px;height:14px;justify-content:space-between;line-height:1;margin:0 calc(-1 * var(--pad));overflow:hidden;padding:0 4px;white-space:nowrap}' +
    '.dcal-rib.is-first{border-bottom-left-radius:4px;border-top-left-radius:4px;box-shadow:inset 3px 0 0 var(--dm);margin-left:0}' +
    '.dcal-rib.is-last{border-bottom-right-radius:4px;border-top-right-radius:4px;margin-right:0}' +
    '.dcal-rib-count{color:var(--fg-2);font-weight:var(--weight-regular)}' +
    '.dcal-link{background:var(--dm);height:2px;margin:0 calc(-1 * var(--pad));opacity:.45}' +
    '.dcal-legend{color:var(--fg-3);display:flex;flex-wrap:wrap;font-size:11px;gap:4px 12px;margin-top:8px}' +
    '.dcal-legend-item{align-items:center;display:inline-flex;gap:5px}' +
    '.dcal-swatch{background:var(--dm);border-radius:3px;flex:none;height:10px;width:10px}' +
    // Details, shared by the Simple popup and the Middle / Full panel.
    '.dcal-panel{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:var(--radius-md);font-size:12px;min-height:110px;padding:10px 12px;-webkit-user-select:none;user-select:none}' +
    '.dcal-pop{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);font-size:12px;max-width:calc(100vw - 16px);padding:10px 12px;pointer-events:none;position:fixed;width:310px;z-index:210}' +
    '.dcal-empty{color:var(--fg-3);margin:0}' +
    '.dcal-plan{background:var(--accent-tint);border-radius:6px;color:var(--fg-1);margin:0 0 8px;padding:6px 8px}' +
    '.dcal-plan.is-invalid{background:color-mix(in srgb,var(--st-overdue) 14%,transparent)}' +
    '.dcal-det+.dcal-det{border-top:1px solid var(--border-1);margin-top:8px;padding-top:8px}' +
    '.dcal-det-head{align-items:baseline;display:flex;gap:8px;justify-content:space-between}' +
    '.dcal-det-date{color:var(--fg-1);font-size:13px;font-weight:var(--weight-semibold)}' +
    '.dcal-det-meta{color:var(--fg-3);font-size:11px;text-align:right}' +
    '.dcal-det-sec{align-items:center;color:var(--fg-2);display:flex;font-size:11px;font-weight:var(--weight-semibold);gap:6px;margin:8px 0 3px}' +
    '.dcal-det-rows{display:flex;flex-direction:column;gap:2px;list-style:none;margin:0;padding:0}' +
    '.dcal-det-row{align-items:center;border-radius:6px;cursor:pointer;display:flex;gap:6px;padding:3px 4px}' +
    '.dcal-det-row:hover{background:var(--bg-subtle)}' +
    '.dcal[data-variant="full"] .dcal-det-row,.dcal[data-variant="split"] .dcal-det-row{cursor:grab}' +
    // Split: a Section header is a handle too, so it takes a row's padding and
    // hover fill. The margin loses what the padding adds, keeping the spacing
    // the other prototypes have.
    '.dcal[data-variant="split"] .dcal-det-sec{border-radius:6px;cursor:grab;margin:5px 0 0;padding:3px 4px}' +
    '.dcal[data-variant="split"] .dcal-det-sec:hover{background:var(--bg-subtle)}' +
    '.dcal-det-row.is-locked{opacity:.5}' +
    '.dcal-det-row .cl-pill{flex:none}' +
    '.dcal-det-title{color:var(--fg-1);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.dcal-det-time{color:var(--fg-3);flex:none;font-size:11px;white-space:nowrap}' +
    '.dcal-pop .dcal-det-row{cursor:default}' +
    '.dcal-ghost{background:var(--bg-surface);border:1px solid var(--border-2);border-radius:var(--radius-pill);box-shadow:var(--shadow-md);color:var(--fg-1);font-size:12px;font-weight:var(--weight-semibold);left:0;padding:5px 10px;pointer-events:none;position:fixed;top:0;white-space:nowrap;z-index:220}' +
    '.dcal-row-flash{border-radius:12px;box-shadow:0 0 0 2px var(--accent)}';
  document.head.appendChild(styleTag);

  // ---- Dates -----------------------------------------------------------------
  // UTC throughout, like the Schedule store.

  function pad2(n) { return String(n).padStart(2, '0'); }
  function parseISO(iso) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function toISO(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function addDays(iso, n) { var d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); }
  function weekdayIndex(iso) { return parseISO(iso).getUTCDay(); }
  function weekStart(iso) { return addDays(iso, -weekdayIndex(iso)); }
  function dayNumber(iso) { return Math.round(parseISO(iso).getTime() / 86400000); }
  function isoOfDayNumber(n) { return toISO(new Date(n * 86400000)); }
  function monthIndex(iso) { var d = parseISO(iso); return d.getUTCFullYear() * 12 + d.getUTCMonth(); }
  function shortDate(iso) { var d = parseISO(iso); return MONTH_SHORT[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function dayLabel(iso) { return DAY_SHORT[weekdayIndex(iso)] + ' ' + shortDate(iso); }
  function formatTime(time) {
    var t = time.split(':').map(Number);
    return (t[0] % 12 || 12) + ':' + pad2(t[1]) + (t[0] < 12 ? 'am' : 'pm');
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Delivery days, as weekday indexes in week order.
  var deliv = [];
  function isDelivery(iso) { return deliv.indexOf(weekdayIndex(iso)) !== -1; }

  // A delivery day's position in the run of all delivery days. For any other
  // day it is the position of the next delivery day, which is what the
  // non-delivery cases below correct for. 1970-01-01 was a Thursday, so +4
  // starts the count on a Sunday.
  function ordinal(iso) {
    var n = dayNumber(iso) + 4, wd = ((n % 7) + 7) % 7, before = 0;
    deliv.forEach(function (d) { if (d < wd) before++; });
    return Math.floor(n / 7) * deliv.length + before;
  }
  function dateOfOrdinal(o) {
    var week = Math.floor(o / deliv.length);
    return isoOfDayNumber(week * 7 - 4 + deliv[o - week * deliv.length]);
  }
  // Moves a date by whole delivery days, so Thursday + 1 is the next Monday.
  function shiftDelivery(iso, k) {
    if (!k || !deliv.length) return iso;
    var o = ordinal(iso);
    if (!isDelivery(iso) && k > 0) o -= 1;
    return dateOfOrdinal(o + k);
  }

  // ---- Sections --------------------------------------------------------------

  var sections = {}, sectionOrder = [];
  schedule.getSections().forEach(function (section, i) {
    sections[section.id] = {
      id: section.id,
      name: section.name,
      short: shortName(section.name),
      order: i,
      // The Day Mappings palette: eight colours for eight Sections.
      index: i % 8,
      color: 'var(--day-map-' + (i % 8) + ')'
    };
    sectionOrder.push(section.id);
  });

  function shortName(name) {
    var week = /^Week\s+(\d+)/i.exec(name);
    if (week) return 'Wk ' + week[1];
    var first = name.split(/[\s–-]+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  function sectionOf(row) {
    return sections[row.sectionId] ||
      { id: row.sectionId, name: 'Other', short: 'Other', order: 99, index: -1, color: 'var(--fg-3)' };
  }

  // Circles view: a date number sits on its Section's colour, so the text has
  // to flip to dark on the light end of the palette. Read from the page rather
  // than hard-coded, so a themed palette still works.
  var paletteText = [];
  function readPalette() {
    var root = getComputedStyle(document.documentElement);
    paletteText = [];
    for (var i = 0; i < 8; i++) {
      var found = /^#?([0-9a-f]{6})$/i.exec((root.getPropertyValue('--day-map-' + i) || '').trim());
      if (!found) { paletteText.push('#fff'); continue; }
      var n = parseInt(found[1], 16);
      var luma = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
      paletteText.push(luma > 0.62 ? 'var(--fg-1)' : '#fff');
    }
  }
  function textOn(section) { return paletteText[section.index] || '#fff'; }

  // ---- State -----------------------------------------------------------------

  var variant = 'simple';
  try {
    var saved = localStorage.getItem(VARIANT_KEY);
    if (saved === 'circles' || saved === 'split' || saved === 'middle' || saved === 'full') variant = saved;
  } catch (e) {}

  var shiftLater = false;   // Middle / Full: drag moves every later date too
  var showEarlier = false;  // include rows before the Start Date's week
  var selection = [];       // Full: selected dates
  var selectAnchor = null;  // Full: Shift-click anchor
  var pinnedISO = null;     // Middle / Split: date kept in the panel
  var hoverISO = null, lastHoverISO = null;
  var linkedISO = null;     // date of the Schedule row under the pointer
  var hiSection = null;     // Section under the pointer
  var weekPreview = null;   // { key, plan } for a hovered + / − button
  var press = null, drag = null, ghost = null;
  var undoStack = [], flashDates = [];
  var model = null;

  // Circles and Split draw the same grid of circles; Split also keeps a pane.
  function isCircles() { return variant === 'circles' || variant === 'split'; }
  function hasPanel() { return variant === 'middle' || variant === 'full' || variant === 'split'; }
  // Shift later dates, Undo and the rest of the tool row stay with the two
  // later prototypes: Split is Circles, only laid out differently.
  function hasTools() { return variant === 'middle' || variant === 'full'; }
  // Clicking a date keeps it in the panel in these two.
  function hasPin() { return variant === 'middle' || variant === 'split'; }
  // Split drags at three grains: a whole date from the grid, one Section's
  // rows on that date, or a single row. Full has always dragged single rows.
  function canDragRow() { return variant === 'full' || variant === 'split'; }
  function canDragSection() { return variant === 'split'; }
  function shiftOn() { return hasTools() && shiftLater; }

  // ---- Model -----------------------------------------------------------------

  // Rows the current Apply Changes To lets a drag move. Only Full reads it; the
  // other two always move everything on a date.
  function movableTypes() {
    var boxes = document.querySelectorAll('input[name="filters[types][]"]');
    if (variant !== 'full' || !boxes.length) return { launch: true, challenge: true, close: true };
    var types = {};
    Array.prototype.forEach.call(boxes, function (box) {
      if (box.checked && FILTER_TYPE[box.value]) types[FILTER_TYPE[box.value]] = true;
    });
    return types;
  }

  function buildModel() {
    deliv = schedule.getDeliveryDays().map(function (d) { return WEEKDAYS.indexOf(d); });
    var types = movableTypes();
    var rows = schedule.getRows().filter(function (row) { return row.dueDate; });
    var byDate = {}, rowById = {};
    rows.forEach(function (row) {
      row.movable = !!types[row.type];
      rowById[row.id] = row;
      (byDate[row.dueDate] || (byDate[row.dueDate] = [])).push(row);
    });
    Object.keys(byDate).forEach(function (iso) {
      byDate[iso].sort(function (a, b) {
        return sectionOf(a).order - sectionOf(b).order ||
          (a.dueTime < b.dueTime ? -1 : a.dueTime > b.dueTime ? 1 : 0) || a.position - b.position;
      });
    });

    var dates = Object.keys(byDate).sort();
    var startDate = schedule.getStartDate();
    var anchor = startDate || dates[0] || toISO(new Date());
    var earliest = dates.length && dates[0] < anchor ? dates[0] : anchor;
    var latest = dates.length && dates[dates.length - 1] > anchor ? dates[dates.length - 1] : anchor;
    // One spare week at the end, as room to push the schedule later.
    var firstWeek = weekStart(showEarlier ? earliest : anchor);
    var lastWeek = addDays(weekStart(latest), 7);
    var hidden = rows.filter(function (row) { return row.dueDate < firstWeek; });

    // Fri–Sun are narrow unless a row has landed on one.
    var wide = [];
    for (var i = 0; i < 7; i++) wide.push(deliv.indexOf(i) !== -1);
    dates.forEach(function (iso) {
      if (iso >= firstWeek && iso <= addDays(lastWeek, 6)) wide[weekdayIndex(iso)] = true;
    });

    return {
      rows: rows, rowById: rowById, byDate: byDate, dates: dates,
      startDate: startDate, anchor: anchor, firstWeek: firstWeek, lastWeek: lastWeek,
      lastDate: addDays(lastWeek, 6), inRangeEnd: latest, hidden: hidden, wide: wide
    };
  }

  function rowsOn(iso) { return model.byDate[iso] || []; }
  function movableOn(iso) { return rowsOn(iso).filter(function (row) { return row.movable; }); }
  function sectionRowsOn(iso, sectionId) {
    return rowsOn(iso).filter(function (row) { return row.sectionId === sectionId; });
  }
  // A date the schedule can use: a delivery day, or one that already has rows.
  function isSlot(iso) { return isDelivery(iso) || rowsOn(iso).length > 0; }
  function nearestSlot(iso, step) {
    for (var i = 1; i <= 14; i++) {
      var d = addDays(iso, i * step);
      if (isSlot(d)) return d;
    }
    return null;
  }

  // ---- Plans -----------------------------------------------------------------
  // A plan is what a drop would do, used both to preview it and to apply it:
  //   { tag, sentence, moves: [{ id, to }], from, to, doubled, invalid, select }

  function rowsLabel(n) { return n + (n === 1 ? ' row' : ' rows'); }
  function amountLabel(k, byDelivery) {
    var n = Math.abs(k);
    return n + (byDelivery ? (n === 1 ? ' delivery day' : ' delivery days') : (n === 1 ? ' day' : ' days'));
  }
  function datesLabel(dates) {
    if (dates.length === 1) return dayLabel(dates[0]);
    var sorted = dates.slice().sort();
    return dayLabel(sorted[0]) + ' – ' + dayLabel(sorted[sorted.length - 1]);
  }
  function unique(list) {
    var seen = {}, out = [];
    list.forEach(function (v) { if (v && !seen[v]) { seen[v] = true; out.push(v); } });
    return out;
  }
  // Dates that end up holding rows that were already there and rows that moved in.
  function doubledDates(moves) {
    var moving = {};
    moves.forEach(function (mv) { moving[mv.id] = true; });
    return unique(moves.map(function (mv) { return mv.to; })).filter(function (iso) {
      return rowsOn(iso).some(function (row) { return !moving[row.id]; });
    });
  }
  function doubledNote(doubled) {
    if (!doubled.length) return '';
    var list = doubled.length <= 3 ? doubled.map(shortDate).join(', ') : shortDate(doubled[0]) + ' – ' + shortDate(doubled[doubled.length - 1]);
    return ' ' + list + ' would then hold two Sections’ rows.';
  }
  function invalidPlan(sentence) {
    return { invalid: true, tag: 'No', sentence: sentence, moves: [], from: [], to: [], doubled: [] };
  }

  // Move mode. One date swaps with an occupied date; several dates keep their
  // spacing and merge into whatever is already there.
  function planDates(dates, anchorISO, target) {
    var sorted = dates.slice().sort();
    if (sorted.length === 1) {
      var src = sorted[0];
      if (src === target) return null;
      var from = movableOn(src), onto = movableOn(target);
      if (!from.length) return null;
      var moves = from.map(function (row) { return { id: row.id, to: target }; });
      if (!onto.length) {
        return {
          tag: 'Move', moves: moves, from: [src], to: [target], select: [target],
          doubled: doubledDates(moves),
          sentence: 'Move ' + dayLabel(src) + ' (' + rowsLabel(from.length) + ') to ' + dayLabel(target) + '.' +
            doubledNote(doubledDates(moves))
        };
      }
      moves = moves.concat(onto.map(function (row) { return { id: row.id, to: src }; }));
      return {
        tag: 'Swap', moves: moves, from: [src, target], to: [target, src], select: [target], doubled: [],
        sentence: 'Swap ' + dayLabel(src) + ' (' + rowsLabel(from.length) + ') with ' +
          dayLabel(target) + ' (' + rowsLabel(onto.length) + '). Times stay as they are.'
      };
    }

    // Counting in delivery days keeps a Thursday move landing on a Monday.
    var byDelivery = deliv.length && isDelivery(anchorISO) && isDelivery(target) && sorted.every(isDelivery);
    var k = byDelivery ? ordinal(target) - ordinal(anchorISO) : dayNumber(target) - dayNumber(anchorISO);
    if (!k) return null;
    var shift = function (iso) { return byDelivery ? shiftDelivery(iso, k) : addDays(iso, k); };
    var moves2 = [];
    sorted.forEach(function (iso) {
      movableOn(iso).forEach(function (row) { moves2.push({ id: row.id, to: shift(iso) }); });
    });
    if (!moves2.length) return null;
    var landed = sorted.map(shift);
    var doubled = doubledDates(moves2).filter(function (iso) { return sorted.indexOf(iso) === -1; });
    return {
      tag: k > 0 ? 'Move later' : 'Move earlier', moves: moves2, from: sorted, to: landed,
      select: landed, doubled: doubled,
      sentence: 'Move ' + sorted.length + ' dates (' + datesLabel(sorted) + ') ' +
        amountLabel(k, byDelivery) + (k > 0 ? ' later' : ' earlier') + '.' + doubledNote(doubled)
    };
  }

  // Shift mode: the dragged date and everything after it move by the same
  // number of delivery days, which is how a week is added or cut.
  function planShift(first, anchorISO, target) {
    if (!deliv.length) return invalidPlan('Pick at least one Quest Delivery Day first.');
    if (!isDelivery(anchorISO) || !isDelivery(target)) {
      return invalidPlan('Shift later dates only works between delivery days (' +
        deliv.map(function (d) { return DAY_SHORT[d]; }).join(', ') + ').');
    }
    var k = ordinal(target) - ordinal(anchorISO);
    if (!k) return null;
    var moving = model.rows.filter(function (row) { return row.movable && row.dueDate >= first; });
    if (!moving.length) return null;
    var moves = moving.map(function (row) { return { id: row.id, to: shiftDelivery(row.dueDate, k) }; });
    var landed = unique(moves.map(function (mv) { return mv.to; })).sort();
    var doubled = doubledDates(moves);
    return {
      tag: k > 0 ? 'Shift later' : 'Shift earlier',
      moves: moves, from: unique(moving.map(function (row) { return row.dueDate; })), to: landed,
      select: [shiftDelivery(anchorISO, k)], doubled: doubled,
      sentence: (k > 0 ? 'Push ' : 'Pull ') + dayLabel(first) + ' and every later date ' +
        amountLabel(k, true) + (k > 0 ? ' later' : ' earlier') + ' (' + rowsLabel(moving.length) +
        '). The schedule then ends ' + shortDate(landed[landed.length - 1]) + '.' + doubledNote(doubled)
    };
  }

  // Full only: insert or remove a whole calendar week.
  function planWeek(weekISO, dir) {
    var after = dir > 0 ? weekISO : addDays(weekISO, 7);
    var moving = model.rows.filter(function (row) { return row.movable && row.dueDate >= after; });
    if (!moving.length) return invalidPlan('Nothing is scheduled after this week.');
    var moves = moving.map(function (row) { return { id: row.id, to: addDays(row.dueDate, dir * 7) }; });
    var landed = unique(moves.map(function (mv) { return mv.to; })).sort();
    var inWeek = model.rows.filter(function (row) {
      return row.dueDate >= weekISO && row.dueDate < addDays(weekISO, 7);
    });
    if (dir > 0) {
      return {
        tag: 'Insert week', moves: moves, from: [], to: landed, select: [], doubled: [],
        sentence: 'Insert an empty week before ' + shortDate(weekISO) + ': ' + rowsLabel(moving.length) +
          ' move a week later.'
      };
    }
    var doubled = doubledDates(moves);
    return {
      tag: 'Remove week', moves: moves, from: [], to: landed, select: [], doubled: doubled,
      sentence: 'Remove the week of ' + shortDate(weekISO) + ': ' + rowsLabel(moving.length) +
        ' move a week earlier.' + (inWeek.length ? ' Its own ' + rowsLabel(inWeek.length) +
        ' stay put and double up with them.' : '')
    };
  }

  function planRow(rowId, target) {
    var row = model.rowById[rowId];
    if (!row || row.dueDate === target) return null;
    if (!row.movable) return invalidPlan('Apply Changes To leaves ' + TYPE_LABEL[row.type] + ' rows out.');
    return {
      tag: 'Move row', moves: [{ id: row.id, to: target }], from: [row.dueDate], to: [target],
      select: [target], doubled: [],
      sentence: 'Move “' + row.title + '” from ' + shortDate(row.dueDate) + ' to ' + dayLabel(target) + '.'
    };
  }

  // One Section's rows on one date: the grain between a row and the whole
  // date, so the rest of that date stays where it is.
  function planSection(iso, sectionId, target) {
    var section = sectionOf({ sectionId: sectionId });
    var here = sectionRowsOn(iso, sectionId);
    if (!here.length || iso === target) return null;
    var movable = here.filter(function (row) { return row.movable; });
    if (!movable.length) return invalidPlan('Apply Changes To leaves every ' + section.name + ' row out.');
    var moves = movable.map(function (row) { return { id: row.id, to: target }; });
    var doubled = doubledDates(moves);
    return {
      tag: 'Move section', moves: moves, from: [iso], to: [target], select: [target], doubled: doubled,
      sentence: 'Move ' + section.name + ' on ' + dayLabel(iso) + ' (' + rowsLabel(movable.length) +
        ') to ' + dayLabel(target) + '.' + doubledNote(doubled)
    };
  }

  // ---- Applying --------------------------------------------------------------

  function apply(plan) {
    if (!plan || plan.invalid || !plan.moves.length) return;
    undoStack.push({
      sentence: plan.sentence,
      rows: plan.moves.map(function (mv) {
        var row = schedule.getRow(mv.id);
        return { id: row.id, dueDate: row.dueDate, scheduledDay: row.scheduledDay };
      })
    });
    flashDates = plan.to.slice();
    schedule.updateRows(plan.moves.map(function (mv) { return { id: mv.id, dueDate: mv.to }; }));
  }

  function undo() {
    var last = undoStack.pop();
    if (!last) return;
    flashDates = unique(last.rows.map(function (row) { return row.dueDate; }));
    // The Day numbers go back too, in case a row sat on a non-delivery day.
    schedule.updateRows(last.rows);
  }

  // ---- Details ---------------------------------------------------------------

  function detailsHTML(iso, opts) {
    var rows = rowsOn(iso), out = '<div class="dcal-det">';
    var meta = [];
    if (iso === model.startDate) meta.push('Start Date');
    if (isDelivery(iso)) {
      var day = schedule.scheduledDayFor(iso);
      if (day !== null) meta.push('Day ' + day);
    } else {
      meta.push('Not a delivery day');
    }
    if (rows.length) meta.push(rowsLabel(rows.length));
    out += '<div class="dcal-det-head"><span class="dcal-det-date">' + esc(dayLabel(iso)) + '</span>' +
      '<span class="dcal-det-meta">' + esc(meta.join(' · ')) + '</span></div>';
    if (!rows.length) return out + '<p class="dcal-empty">Nothing scheduled.</p></div>';

    var lastSection = null;
    rows.forEach(function (row) {
      var section = sectionOf(row);
      if (section.id !== lastSection) {
        if (lastSection !== null) out += '</ul>';
        out += '<div class="dcal-det-sec" data-sec="' + esc(section.id) + '" data-det-date="' + esc(iso) +
          '"><span class="dcal-swatch" style="--dm:' + section.color + '"></span>' +
          esc(section.name) + '</div><ul class="dcal-det-rows">';
        lastSection = section.id;
      }
      var original = schedule.getOriginalRow(row.id);
      var moved = variant === 'full' && original && original.dueDate && original.dueDate !== row.dueDate;
      out += '<li class="dcal-det-row' + (row.movable ? '' : ' is-locked') + '" data-row-id="' + esc(row.id) + '">' +
        '<span class="cl-pill cl-pill--' + row.type + '">' + TYPE_LABEL[row.type] + '</span>' +
        '<span class="dcal-det-title">' + esc(row.title) + '</span>' +
        '<span class="dcal-det-time">' + esc(formatTime(row.dueTime)) +
        (moved ? ' · was ' + esc(shortDate(original.dueDate)) : '') + '</span></li>';
    });
    out += '</ul>';
    if (opts && opts.hint) out += '<p class="dcal-empty" style="margin-top:6px">' + esc(opts.hint) + '</p>';
    return out + '</div>';
  }

  // What the panel or popup shows right now.
  function detailsContent() {
    var plan = drag ? drag.plan : (weekPreview && weekPreview.plan);
    var html = '';
    if (plan) {
      html = '<p class="dcal-plan' + (plan.invalid ? ' is-invalid' : '') + '">' + esc(plan.sentence) + '</p>';
      var focus = drag ? drag.target : null;
      return html + (focus ? detailsHTML(focus) : '');
    }
    if (hoverISO) return detailsHTML(hoverISO);
    if (linkedISO) return detailsHTML(linkedISO);
    if (variant === 'full' && selection.length > 1) {
      var withRows = selection.filter(function (iso) { return rowsOn(iso).length; });
      var total = withRows.reduce(function (n, iso) { return n + rowsOn(iso).length; }, 0);
      html = '<p class="dcal-plan">' + selection.length + ' dates selected · ' + rowsLabel(total) +
        '. Drag any of them to move them together.</p>';
      return html + withRows.map(function (iso) { return detailsHTML(iso); }).join('');
    }
    if (variant === 'full' && selection.length === 1) {
      return detailsHTML(selection[0], { hint: 'Drag a row onto another date to move just that row.' });
    }
    var restHint = variant === 'split' ?
      { hint: 'Drag a row, or a Section header, onto another date to move just those rows.' } : null;
    if (hasPin() && pinnedISO) return detailsHTML(pinnedISO, restHint);
    if (lastHoverISO) return detailsHTML(lastHoverISO, restHint);
    return '<p class="dcal-empty">Hover a date to see what is scheduled on it' +
      (variant === 'full' ? ', or click one to select it.' :
        variant === 'split' ? ', or click one to keep it here.' : '.') + '</p>';
  }

  // ---- Rendering -------------------------------------------------------------

  // Circles: one filled circle per scheduled date, split into a pie by row
  // count when a date holds more than one Section.
  function circleHTML(iso, rows) {
    var num = parseISO(iso).getUTCDate();
    var ring = iso === model.startDate ? ' is-start-ring' : '';
    if (!rows.length) {
      return '<div class="dcal-d-body"><span class="dcal-circle is-plain' + ring + '">' + num + '</span></div>';
    }
    var counts = {}, order = [];
    rows.forEach(function (row) {
      var section = sectionOf(row);
      if (!(section.id in counts)) { counts[section.id] = 0; order.push(section); }
      counts[section.id]++;
    });
    var fill, dominant = order[0];
    if (order.length === 1) {
      fill = dominant.color;
    } else {
      var slices = [], at = 0;
      order.forEach(function (section) {
        var end = at + counts[section.id] / rows.length * 360;
        slices.push(section.color + ' ' + at.toFixed(1) + 'deg ' + end.toFixed(1) + 'deg');
        at = end;
        if (counts[section.id] > counts[dominant.id]) dominant = section;
      });
      fill = 'conic-gradient(' + slices.join(',') + ')';
    }
    // The number has to read against the slice it mostly sits on.
    return '<div class="dcal-d-body"><span class="dcal-circle' + ring + '" style="background:' + fill +
      ';color:' + textOn(dominant) + '">' + num + '</span></div>';
  }

  function cellBodyHTML(iso, weekSections, firstOfSection) {
    var rows = rowsOn(iso);
    if (variant === 'simple') {
      if (!rows.length) return '';
      return '<div class="dcal-d-body"><div class="dcal-dots">' + rows.map(function (row) {
        return '<span class="dcal-dot" style="--dm:' + sectionOf(row).color + '"></span>';
      }).join('') + '</div></div>';
    }
    if (variant === 'middle') {
      if (!rows.length) return '';
      var chips = '', lastSection = null, count = 0, section = null;
      var flush = function () {
        if (!section) return;
        chips += '<span class="dcal-chip" data-sec="' + esc(section.id) + '" style="--dm:' + section.color + '">' +
          esc(section.short) + '<span>' + count + '</span></span>';
      };
      rows.forEach(function (row) {
        var s = sectionOf(row);
        if (s.id !== lastSection) { flush(); section = s; count = 0; lastSection = s.id; }
        count++;
      });
      flush();
      return '<div class="dcal-d-body">' + chips + '</div>';
    }

    // Full: one lane per Section in this week, so ribbons line up across dates.
    var prev = nearestSlot(iso, -1), next = nearestSlot(iso, 1);
    var lanes = weekSections.map(function (sectionId) {
      var section = sections[sectionId];
      var here = sectionRowsOn(iso, sectionId);
      if (!here.length) {
        // A gap between two dates of the same Section keeps a thin connector.
        var joins = prev && next && sectionRowsOn(prev, sectionId).length && sectionRowsOn(next, sectionId).length;
        return '<div class="dcal-lane">' + (joins && !isSlot(iso) ?
          '<div class="dcal-link" style="--dm:' + section.color + '"></div>' : '') + '</div>';
      }
      var first = !prev || !sectionRowsOn(prev, sectionId).length;
      var last = !next || !sectionRowsOn(next, sectionId).length;
      var label = first || firstOfSection[sectionId] === iso ? section.short : '';
      return '<div class="dcal-lane"><div class="dcal-rib' + (first ? ' is-first' : '') + (last ? ' is-last' : '') +
        '" data-sec="' + esc(sectionId) + '" style="--dm:' + section.color + '">' +
        '<span>' + esc(label) + '</span><span class="dcal-rib-count">' + here.length + '</span></div></div>';
    }).join('');
    return '<div class="dcal-d-body">' + lanes + '</div>';
  }

  function weekHTML(weekISO, monthLabel) {
    var cells = '';
    var weekSections = [], firstOfSection = {};
    if (variant === 'full') {
      for (var i = 0; i < 7; i++) {
        var d = addDays(weekISO, i);
        rowsOn(d).forEach(function (row) {
          if (weekSections.indexOf(row.sectionId) === -1) weekSections.push(row.sectionId);
          if (!firstOfSection[row.sectionId]) firstOfSection[row.sectionId] = d;
        });
      }
      weekSections.sort(function (a, b) { return sectionOf({ sectionId: a }).order - sectionOf({ sectionId: b }).order; });
    }

    for (var j = 0; j < 7; j++) {
      var iso = addDays(weekISO, j);
      var rows = rowsOn(iso);
      var classes = 'dcal-d';
      if (monthIndex(iso) % 2 !== monthIndex(model.anchor) % 2) classes += ' is-alt-month';
      if (!isDelivery(iso)) classes += ' is-off';
      if (!isCircles() && !model.wide[weekdayIndex(iso)]) classes += ' is-narrow';
      if (rows.length) classes += ' has-rows';
      if (iso === model.startDate) classes += ' is-start';
      if (iso > model.inRangeEnd) classes += ' is-out';
      if (isCircles()) {
        cells += '<div class="' + classes + ' dcal-d--circle" data-date="' + iso + '">' +
          circleHTML(iso, rows) + '</div>';
        continue;
      }
      var moved = variant === 'full' && rows.some(function (row) {
        var original = schedule.getOriginalRow(row.id);
        return original && original.dueDate && original.dueDate !== row.dueDate;
      });
      var day = hasPanel() && isDelivery(iso) ? schedule.scheduledDayFor(iso) : null;
      var top = '<span class="dcal-num">' + parseISO(iso).getUTCDate() + '</span>';
      if (!model.wide[weekdayIndex(iso)]) {
        cells += '<div class="' + classes + '" data-date="' + iso + '"><div class="dcal-d-top">' + top + '</div>' +
          (variant === 'full' ? cellBodyHTML(iso, weekSections, firstOfSection) : '') + '</div>';
        continue;
      }
      cells += '<div class="' + classes + '" data-date="' + iso + '">' +
        '<div class="dcal-d-top">' + top +
        (moved ? '<span class="dcal-moved" title="Moved from another date"></span>' : '') +
        (day !== null ? '<span class="dcal-daynum">Day ' + day + '</span>' : '') + '</div>' +
        cellBodyHTML(iso, weekSections, firstOfSection) + '</div>';
    }

    var acts = variant === 'full' ?
      '<span class="dcal-week-acts">' +
      '<button type="button" data-week-act="insert" data-week="' + weekISO + '" title="Insert a week before this one" aria-label="Insert a week before ' + shortDate(weekISO) + '">+</button>' +
      '<button type="button" data-week-act="remove" data-week="' + weekISO + '" title="Remove this week" aria-label="Remove the week of ' + shortDate(weekISO) + '">−</button>' +
      '</span>' : '';
    return '<div class="dcal-week" data-week="' + weekISO + '">' +
      '<div class="dcal-gutter"><span class="dcal-month">' + esc(monthLabel) + '</span>' + acts + '</div>' +
      cells + '</div>';
  }

  function gridHTML() {
    var cols = (variant === 'full' ? '44px' : '32px');
    // Circles and Split give every weekday the same width, like the Overview
    // calendar.
    var equal = isCircles();
    for (var i = 0; i < 7; i++) cols += equal || model.wide[i] ? ' minmax(0,1fr)' : ' 26px';
    var head = '<div class="dcal-dh"><span></span>';
    for (var j = 0; j < 7; j++) head += '<span>' + (equal || model.wide[j] ? DAY_SHORT[j] : DAY_SHORT[j].charAt(0)) + '</span>';
    head += '</div>';

    var weeks = '', labelled = null;
    for (var week = model.firstWeek; week <= model.lastWeek; week = addDays(week, 7)) {
      var monthAt = monthIndex(addDays(week, 6) > model.lastDate ? model.lastDate : addDays(week, 6));
      var label = monthAt !== labelled ? MONTH_SHORT[monthAt % 12] : '';
      labelled = monthAt;
      weeks += weekHTML(week, label);
    }
    return '<div class="dcal-grid" style="--dcal-cols:' + cols + '">' + head + weeks + '</div>';
  }

  function legendHTML() {
    if (variant === 'full') return '';
    var shown = [];
    model.rows.forEach(function (row) {
      if (row.dueDate >= model.firstWeek && shown.indexOf(row.sectionId) === -1) shown.push(row.sectionId);
    });
    shown.sort(function (a, b) { return sectionOf({ sectionId: a }).order - sectionOf({ sectionId: b }).order; });
    if (!shown.length) return '';
    var side = isCircles() ? ' dcal-legend--side' + (variant === 'split' ? ' is-right' : '') : '';
    return '<div class="dcal-legend' + side + '">' + shown.map(function (id) {
      var section = sectionOf({ sectionId: id });
      return '<span class="dcal-legend-item" data-sec="' + esc(id) + '">' +
        '<span class="dcal-swatch" style="--dm:' + section.color + '"></span>' + esc(section.name) + '</span>';
    }).join('') + '</div>';
  }

  function toolsHTML() {
    if (!hasTools()) return '';
    var types = movableTypes();
    var limited = variant === 'full' && !(types.launch && types.challenge && types.close);
    return '<div class="dcal-tools">' +
      '<div class="segmented dcal-seg" role="group" aria-label="What a drag moves">' +
      '<button type="button" data-dcal-mode="move" aria-pressed="' + !shiftLater + '">Move dates</button>' +
      '<button type="button" data-dcal-mode="shift" aria-pressed="' + shiftLater + '">Shift later dates</button>' +
      '</div>' +
      '<button class="' + BTN_OUTLINE + '" type="button" data-dcal-undo' + (undoStack.length ? '' : ' disabled') + '>' +
      'Undo' + (undoStack.length > 1 ? ' (' + undoStack.length + ')' : '') + '</button>' +
      (limited ? '<span class="dcal-note">Apply Changes To limits a drag to the ticked types.</span>' : '') +
      '</div>';
  }

  function render() {
    readPalette();
    model = buildModel();
    var range = shortDate(model.firstWeek) + ' – ' + shortDate(model.lastDate);
    var earlier = model.hidden.length ?
      '<button type="button" class="dcal-earlier" data-dcal-earlier>▸ Show ' + rowsLabel(model.hidden.length) +
      ' before ' + shortDate(model.firstWeek) + '</button>' :
      (showEarlier ? '<button type="button" class="dcal-earlier" data-dcal-earlier>▾ Hide earlier weeks</button>' : '');

    // Circles keeps the legend left of the grid; Split moves it to the right,
    // because the details pane takes the left of the row.
    var gridWrap = '<div class="dcal-grid-wrap">' + earlier + gridHTML() + '</div>';
    var cardHTML = '<div class="dcal-card' + (isCircles() ? ' dcal-card--circles' : '') + '">' +
      (isCircles()
        ? (variant === 'split' ? gridWrap + legendHTML() : legendHTML() + gridWrap)
        : earlier + gridHTML() + legendHTML()) +
      '</div>';
    var panelHTML = hasPanel() ? '<div class="dcal-panel" data-dcal-panel></div>' : '';

    mount.className = 'dcal border border-border-1 rounded-xl bg-bg-subtle mb-4 p-4';
    mount.dataset.variant = variant;
    mount.innerHTML =
      '<div class="dcal-head">' +
      '<label class="form-label">Calendar</label>' +
      '<span class="dcal-range">' + esc(range) + '</span>' +
      '<span class="dcal-proto">Prototype</span>' +
      '<div class="segmented dcal-seg" role="group" aria-label="Calendar version">' +
      VARIANTS.map(function (v) {
        return '<button type="button" data-dcal-variant="' + v.id + '" aria-pressed="' + (v.id === variant) + '">' +
          v.label + '</button>';
      }).join('') +
      '</div>' +
      '<button class="' + BTN_GHOST + '" type="button" data-dcal-reset>Reset dates</button>' +
      '</div>' +
      '<div class="input-explanation dcal-hint">' + esc(HINTS[variant]) + '</div>' +
      toolsHTML() +
      '<div class="dcal-body">' + (variant === 'split' ? panelHTML + cardHTML : cardHTML + panelHTML) + '</div>';

    if (flashDates.length) {
      flashDates.forEach(function (iso) {
        var cell = mount.querySelector('.dcal-d[data-date="' + iso + '"]');
        if (cell) cell.classList.add('is-flash');
      });
      flashDates = [];
    }
    decorate();
  }

  // Everything that changes without rebuilding the grid: hover, selection and
  // the drag preview.
  function decorate() {
    var plan = drag ? drag.plan : (weekPreview && weekPreview.plan);
    var sources = drag ? drag.sources : [];
    var picked = variant === 'full' ? selection : (hasPin() && pinnedISO ? [pinnedISO] : []);
    var willMove = plan && !plan.invalid ? plan.from : [];
    var willLand = plan && !plan.invalid ? plan.to : [];
    var doubled = plan && !plan.invalid ? plan.doubled : [];

    Array.prototype.forEach.call(mount.querySelectorAll('.dcal-d[data-date]'), function (cell) {
      var iso = cell.dataset.date;
      cell.classList.toggle('is-picked', picked.indexOf(iso) !== -1);
      cell.classList.toggle('is-linked', !drag && iso === linkedISO);
      cell.classList.toggle('is-drag-source', sources.indexOf(iso) !== -1);
      cell.classList.toggle('is-will-move', willMove.indexOf(iso) !== -1);
      cell.classList.toggle('is-will-land', willLand.indexOf(iso) !== -1);
      cell.classList.toggle('is-will-double', doubled.indexOf(iso) !== -1);
      cell.classList.toggle('is-drop-target', !!drag && iso === drag.target);
      cell.classList.toggle('is-drop-invalid', !!drag && iso === drag.target && !!plan && !!plan.invalid);
      cell.classList.toggle('is-sec-dim', !!hiSection && !drag && rowsOn(iso).length > 0 &&
        !sectionRowsOn(iso, hiSection).length);
      if (drag && iso === drag.target && plan) cell.dataset.dropTag = plan.tag;
      else delete cell.dataset.dropTag;
    });

    var panel = mount.querySelector('[data-dcal-panel]');
    if (panel) {
      var html = detailsContent();
      if (panel.dataset.html !== html) { panel.innerHTML = html; panel.dataset.html = html; }
    }
    updatePopup();
  }

  // ---- Popup (Simple) --------------------------------------------------------

  var popup = document.createElement('div');
  popup.className = 'dcal-pop';
  popup.style.display = 'none';
  document.body.appendChild(popup);

  function updatePopup() {
    if (hasPanel() || drag || !hoverISO || !rowsOn(hoverISO).length) {
      popup.style.display = 'none';
      return;
    }
    var cell = mount.querySelector('.dcal-d[data-date="' + hoverISO + '"]');
    if (!cell) { popup.style.display = 'none'; return; }
    if (popup.dataset.date !== hoverISO) {
      popup.innerHTML = detailsHTML(hoverISO);
      popup.dataset.date = hoverISO;
    }
    popup.style.display = '';
    var rect = cell.getBoundingClientRect(), box = popup.getBoundingClientRect();
    var left = rect.right + 10;
    if (left + box.width > window.innerWidth - 8) left = rect.left - box.width - 10;
    if (left < 8) left = 8;
    var top = rect.top;
    if (top + box.height > window.innerHeight - 8) top = window.innerHeight - box.height - 8;
    popup.style.left = Math.round(left) + 'px';
    popup.style.top = Math.round(Math.max(8, top)) + 'px';
  }

  // ---- Hover -----------------------------------------------------------------

  function elementAt(node, selector) {
    var el = node && node.nodeType === 1 ? node : (node && node.parentElement);
    return el && el.closest ? el.closest(selector) : null;
  }

  document.addEventListener('mouseover', function (e) {
    if (drag) return;
    var cell = elementAt(e.target, '.dcal-d[data-date]');
    var iso = cell && mount.contains(cell) ? cell.dataset.date : null;
    var secEl = elementAt(e.target, '[data-sec]');
    var sec = secEl && mount.contains(secEl) ? secEl.dataset.sec : null;
    var actEl = elementAt(e.target, '[data-week-act]');
    var actKey = actEl && mount.contains(actEl) ? actEl.dataset.weekAct + actEl.dataset.week : null;

    // Hovering a Schedule row below the calendar lights up its date.
    var linked = null;
    if (hasPanel()) {
      var item = elementAt(e.target, '[data-bulk-time-change-target="challengeItem"]');
      var article = item && item.querySelector('article.cl-row');
      var row = article && schedule.getRow(article.id);
      linked = row ? row.dueDate : null;
    }

    var changed = iso !== hoverISO || sec !== hiSection || linked !== linkedISO ||
      actKey !== (weekPreview && weekPreview.key);
    hoverISO = iso;
    if (iso) lastHoverISO = iso;
    hiSection = sec;
    linkedISO = linked;
    weekPreview = actEl && mount.contains(actEl) ?
      { key: actKey, plan: planWeek(actEl.dataset.week, actEl.dataset.weekAct === 'insert' ? 1 : -1) } : null;
    if (changed) decorate();
  });

  window.addEventListener('scroll', function () { if (popup.style.display !== 'none') updatePopup(); }, true);

  // ---- Dragging --------------------------------------------------------------

  function ghostLabel() {
    if (drag.kind === 'row') return model.rowById[drag.rowId].title;
    if (drag.kind === 'section') {
      return sectionOf({ sectionId: drag.secId }).name + ' · ' +
        rowsLabel(sectionRowsOn(drag.secDate, drag.secId).length);
    }
    var rows = drag.sources.reduce(function (n, iso) { return n + movableOn(iso).length; }, 0);
    var base = drag.sources.length === 1 ? shortDate(drag.sources[0]) + ' · ' + rowsLabel(rows) :
      drag.sources.length + ' dates · ' + rowsLabel(rows);
    return base + (shiftOn() ? ' and later' : '');
  }

  function planFor(target) {
    if (!target) return null;
    if (drag.kind === 'row') return planRow(drag.rowId, target);
    if (drag.kind === 'section') return planSection(drag.secDate, drag.secId, target);
    if (shiftOn()) return planShift(drag.sources[0], drag.anchor, target);
    return planDates(drag.sources, drag.anchor, target);
  }

  function startDrag() {
    if (press.rowId) {
      var row = model.rowById[press.rowId];
      if (!canDragRow() || !row) return false;
      drag = { kind: 'row', rowId: press.rowId, sources: [row.dueDate], anchor: row.dueDate, target: null, plan: null };
    } else if (press.secId) {
      if (!canDragSection() || !sectionRowsOn(press.secDate, press.secId).length) return false;
      drag = { kind: 'section', secId: press.secId, secDate: press.secDate, sources: [press.secDate],
        anchor: press.secDate, target: null, plan: null };
    } else {
      var sources = variant === 'full' && selection.indexOf(press.iso) !== -1 ? selection.slice().sort() : [press.iso];
      var hasRows = sources.some(function (iso) { return movableOn(iso).length > 0; });
      // With Shift later dates on, an empty date is still a handle for
      // everything after it.
      var laterRows = model.rows.some(function (r) { return r.movable && r.dueDate >= sources[0]; });
      if (!hasRows && !(shiftOn() && laterRows)) return false;
      if (variant === 'full' && selection.indexOf(press.iso) === -1) {
        selection = [press.iso];
        selectAnchor = press.iso;
      }
      drag = { kind: 'days', sources: sources, anchor: press.iso, target: null, plan: null };
    }
    mount.classList.add('is-dragging');
    popup.style.display = 'none';
    ghost = document.createElement('div');
    ghost.className = 'dcal-ghost';
    ghost.textContent = ghostLabel();
    document.body.appendChild(ghost);
    return true;
  }

  function endDrag() {
    if (ghost) { ghost.remove(); ghost = null; }
    drag = null;
    mount.classList.remove('is-dragging');
  }

  mount.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    if (elementAt(e.target, 'button')) return;
    var rowEl = elementAt(e.target, '.dcal-det-row[data-row-id]');
    var secEl = elementAt(e.target, '.dcal-det-sec[data-det-date]');
    var cell = elementAt(e.target, '.dcal-d[data-date]');
    if (!rowEl && !secEl && !cell) return;
    press = {
      x: e.clientX, y: e.clientY, blocked: false,
      rowId: rowEl ? rowEl.dataset.rowId : null,
      secId: secEl ? secEl.dataset.sec : null,
      secDate: secEl ? secEl.dataset.detDate : null,
      iso: cell ? cell.dataset.date : null,
      range: e.shiftKey, toggle: e.ctrlKey || e.metaKey
    };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('keydown', onKeyDown);
  });

  function onPointerMove(e) {
    if (!press) return;
    if (!drag) {
      if (press.blocked) return;
      if (Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) < 5) return;
      if (!startDrag()) { press.blocked = true; return; }
    }
    ghost.style.left = (e.clientX + 14) + 'px';
    ghost.style.top = (e.clientY + 14) + 'px';
    var cell = elementAt(document.elementFromPoint(e.clientX, e.clientY), '.dcal-d[data-date]');
    var target = cell && mount.contains(cell) ? cell.dataset.date : null;
    if (target !== drag.target) {
      drag.target = target;
      drag.plan = planFor(target);
      decorate();
    }
  }

  function onPointerUp() {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('keydown', onKeyDown);
    if (drag) {
      var plan = drag.plan;
      endDrag();
      if (plan && !plan.invalid) {
        if (variant === 'full' && plan.select && plan.select.length) {
          selection = plan.select.slice();
          selectAnchor = selection[0];
        }
        apply(plan);
      } else {
        decorate();
      }
    } else if (press && !press.blocked) {
      if (press.rowId) scrollToRow(press.rowId);
      else if (press.secId) {
        var first = sectionRowsOn(press.secDate, press.secId)[0];
        if (first) scrollToRow(first.id);
      } else if (press.iso) clickDate(press);
    }
    press = null;
  }

  function onKeyDown(e) {
    if (e.key !== 'Escape' || !drag) return;
    endDrag();
    decorate();
  }

  function clickDate(p) {
    if (variant === 'full') {
      if (p.range && selectAnchor) {
        var from = p.iso < selectAnchor ? p.iso : selectAnchor;
        var to = p.iso < selectAnchor ? selectAnchor : p.iso;
        selection = [];
        // Weekends only join a range once something is scheduled on them, so a
        // Mon–Thu range still counts in delivery days.
        for (var iso = from; iso <= to; iso = addDays(iso, 1)) if (isSlot(iso)) selection.push(iso);
      } else if (p.toggle) {
        var at = selection.indexOf(p.iso);
        if (at === -1) selection.push(p.iso); else selection.splice(at, 1);
        selectAnchor = p.iso;
      } else {
        selection = selection.length === 1 && selection[0] === p.iso ? [] : [p.iso];
        selectAnchor = p.iso;
      }
    } else if (hasPin()) {
      pinnedISO = pinnedISO === p.iso ? null : p.iso;
    }
    decorate();
  }

  function scrollToRow(rowId) {
    var article = document.getElementById(rowId);
    if (!article) return;
    var item = article.closest('[data-bulk-time-change-target="challengeItem"]') || article;
    item.scrollIntoView({ block: 'center', behavior: 'smooth' });
    item.classList.add('dcal-row-flash');
    setTimeout(function () { item.classList.remove('dcal-row-flash'); }, 1400);
  }

  // ---- Buttons ---------------------------------------------------------------

  mount.addEventListener('click', function (e) {
    var variantBtn = elementAt(e.target, '[data-dcal-variant]');
    if (variantBtn) {
      variant = variantBtn.dataset.dcalVariant;
      try { localStorage.setItem(VARIANT_KEY, variant); } catch (err) {}
      selection = [];
      selectAnchor = null;
      pinnedISO = null;
      hiSection = null;
      render();
      return;
    }
    var modeBtn = elementAt(e.target, '[data-dcal-mode]');
    if (modeBtn) { shiftLater = modeBtn.dataset.dcalMode === 'shift'; render(); return; }
    if (elementAt(e.target, '[data-dcal-undo]')) { undo(); return; }
    if (elementAt(e.target, '[data-dcal-earlier]')) { showEarlier = !showEarlier; render(); return; }
    if (elementAt(e.target, '[data-dcal-reset]')) { schedule.reset(); return; }
    var act = elementAt(e.target, '[data-week-act]');
    if (act) {
      var plan = planWeek(act.dataset.week, act.dataset.weekAct === 'insert' ? 1 : -1);
      weekPreview = null;
      apply(plan);
    }
  });

  // Apply Changes To changes which rows a drag moves.
  document.querySelectorAll('input[name="filters[types][]"]').forEach(function (box) {
    box.addEventListener('change', function () { if (variant === 'full') render(); });
  });

  schedule.subscribe(function (change) {
    if (change.type === 'reset') {
      undoStack = [];
      selection = [];
      pinnedISO = null;
    }
    render();
  });

  render();
})();

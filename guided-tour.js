(function () {
  // The Guided tour: eighteen steps that walk through the prototype, starting
  // on Badge Overview and finishing on Change Dates.
  //
  // Each step names the page it belongs to, what to ring, and how to tell it is
  // done. A step with a done test moves on by itself once the visitor does the
  // thing; a step without one waits for Next. The step in progress is kept in
  // sessionStorage, so the tour carries on when the Change Dates button opens
  // Change Dates, and ends when the tab does.
  //
  // The tour only watches: it reads the page and the Schedule store and never
  // changes either, except that starting it puts the store back to the
  // markup's dates (so the dates in the steps are the dates on screen) and
  // Change Dates steps switch the calendar to Split, the version they describe.

  var schedule = window.JourneySchedule;
  var PAGE = document.getElementById('dates-calendar') ? 'change-dates' :
    document.querySelector('[data-controller~="inline-date-editor"]') ? 'overview' : null;
  if (!schedule || !PAGE) return;

  var STEP_KEY = 'journey-tracker-tour-step';   // sessionStorage: step in progress
  var SEEN_KEY = 'journey-tracker-tour-seen';   // localStorage: welcome answered
  var PAGE_URL = { overview: 'index.html', 'change-dates': 'change-dates.html' };
  var PAGE_NAME = { overview: 'Badge Overview', 'change-dates': 'Change Dates' };

  // The dates the steps talk about, for the schedule the first steps set up:
  // a September 14 Start Date on Mon, Wed and Thu.
  var START_ISO = '2026-09-14';
  var START_LABEL = 'September 14, 2026';
  var DELIVERY_DAYS = ['monday', 'wednesday', 'thursday'];
  var DAY_OFF = '2026-09-30';
  var DAY_OFF_TO = '2026-09-29';
  var BONUS = '571803', WEEK_3 = '571799', WEEK_4 = '571800';

  var MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function parseISO(iso) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function toISO(d) { return d.toISOString().slice(0, 10); }
  function addDays(iso, n) { var d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); }
  function dayLabel(iso) { var d = parseISO(iso); return DAY_SHORT[d.getUTCDay()] + ' ' + MONTH_SHORT[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- Styles ----------------------------------------------------------------

  // Drawn from the page's tokens, the way the Change Dates calendar's popup
  // and ghost are. The page's own button rules were pruned from the Badge
  // Overview export, so the buttons are styled here too, to the same shape as
  // the Block actions' buttons.
  var styleTag = document.createElement('style');
  styleTag.textContent =
    '.tour-card{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);color:var(--fg-1);font-family:var(--font-body);font-size:13px;left:0;line-height:1.45;max-width:calc(100vw - 16px);padding:12px 14px;position:fixed;top:0;width:300px;z-index:1060}' +
    '@keyframes tour-in{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:none}}' +
    '.tour-card.is-entering{animation:tour-in .18s ease-out}' +
    '.tour-head{align-items:center;display:flex;gap:8px;justify-content:space-between;margin-bottom:4px}' +
    '.tour-count{color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;text-transform:uppercase}' +
    '.tour-close{align-items:center;background:transparent;border:0;border-radius:var(--radius-pill);color:var(--fg-3);cursor:pointer;display:inline-flex;height:22px;justify-content:center;margin:-4px -6px -4px 0;padding:0;width:22px}' +
    '.tour-close:hover{background:var(--bg-subtle);color:var(--fg-1)}' +
    '.tour-title{font-size:14px;font-weight:var(--weight-semibold);margin:0 0 4px}' +
    '.tour-text{color:var(--fg-2);margin:0}' +
    '.tour-progress{color:var(--fg-3);font-size:12px;margin:6px 0 0}' +
    '.tour-progress.is-done{color:var(--st-success);font-weight:var(--weight-semibold)}' +
    '.tour-actions{align-items:center;display:flex;gap:6px;margin-top:12px}' +
    '.tour-actions .tour-btn:first-child{margin-right:auto}' +
    '.tour-btn{align-items:center;border:1px solid transparent;border-radius:var(--radius-pill);cursor:pointer;display:inline-flex;font-family:inherit;font-size:12px;font-weight:var(--weight-semibold);height:28px;justify-content:center;letter-spacing:.1px;line-height:1;padding:0 12px;transition:background-color .15s,border-color .15s,color .15s;white-space:nowrap}' +
    '.tour-btn:focus-visible{box-shadow:var(--ring-focus);outline:0}' +
    '.tour-btn--ghost{background:transparent;color:var(--fg-2)}' +
    '.tour-btn--ghost:hover{background:var(--bg-subtle);color:var(--fg-1)}' +
    '.tour-btn--accent{background:var(--accent);box-shadow:var(--shadow-xs);color:var(--fg-on-accent)}' +
    '.tour-btn--accent:hover{background:var(--accent-hover)}' +
    // Tour ring: drawn over the element a step points at. Clicks pass through.
    '@keyframes tour-pulse{0%,100%{box-shadow:0 0 0 2px var(--accent),0 0 0 4px color-mix(in srgb,var(--accent) 30%,transparent)}50%{box-shadow:0 0 0 2px var(--accent),0 0 0 8px color-mix(in srgb,var(--accent) 0%,transparent)}}' +
    '.tour-ring{animation:tour-pulse 1.6s ease-in-out infinite;pointer-events:none;position:fixed;z-index:1055}' +
    // Tour button: inside the Copy notice, which lets clicks pass through, so
    // the button takes them back. The notice is centred from left:50%, so it
    // would shrink to half the window and wrap; max-content keeps it on one
    // line until its own max-width.
    '.copy-notice{width:max-content}' +
    '.tour-launch{background:var(--bg-surface);border:0;border-radius:var(--radius-pill);color:var(--fg-1);cursor:pointer;flex:none;font-family:inherit;font-size:12px;font-weight:var(--weight-semibold);line-height:1;margin-left:4px;padding:5px 10px;pointer-events:auto;white-space:nowrap}' +
    '.tour-launch:hover{background:var(--bg-subtle)}' +
    '@media print{.tour-card,.tour-ring{display:none}}';
  document.head.appendChild(styleTag);

  // ---- Page reads ------------------------------------------------------------

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function isShown(el) { return !!el && el.getClientRects().length > 0; }
  function closest(node, selector) {
    var el = node && node.nodeType === 1 ? node : node && node.parentElement;
    return el && el.closest ? el.closest(selector) : null;
  }

  function rowsOn(iso) { return schedule.getRows().filter(function (row) { return row.dueDate === iso; }); }
  function firstDateOf(sectionId) {
    return schedule.getRows().reduce(function (first, row) {
      return row.sectionId === sectionId && row.dueDate && (!first || row.dueDate < first) ? row.dueDate : first;
    }, null);
  }

  // Badge Overview: the Start Date editor.
  var editor = $('[data-controller~="inline-date-editor"]');
  var editMode = editor && $('[data-inline-date-editor-target="editMode"]', editor);
  function editOpen() { return !!editMode && !editMode.classList.contains('hidden'); }
  function editorPopup() {
    var field = editMode && $('[data-controller~="date-picker"]', editMode);
    var popup = field && document.getElementById(field.dataset.datePickerPopupIdValue);
    return popup && popup.style.display !== 'none' ? popup : null;
  }
  function checkedEditorDays() {
    return $$('[data-inline-date-editor-target="dayCheckbox"]', editor)
      .filter(function (box) { return box.checked; }).map(function (box) { return box.value; });
  }

  // Change Dates: the calendar, re-found every time since it redraws itself on
  // every change.
  function cal(selector) { return $('#dates-calendar ' + selector); }
  function cell(iso) { return cal('.dcal-d[data-date="' + iso + '"] .dcal-circle') || cal('.dcal-d[data-date="' + iso + '"]'); }
  function legendItem(sectionId) { return cal('.dcal-legend-item[data-sec="' + sectionId + '"]'); }
  function sectionName(sectionId) { var s = schedule.getSection(sectionId); return s ? s.name : ''; }

  // The steps say Split's words (pane, legend, Unscheduled), so they show it.
  function ensureSplit() {
    var mount = $('#dates-calendar');
    var btn = mount && mount.dataset.variant !== 'split' && $('[data-dcal-variant="split"]', mount);
    if (btn) btn.click();
  }

  // ---- What the visitor has done ---------------------------------------------

  // Reset at the start of every step, so a step only counts what was done
  // while it was showing.
  var seen;
  function resetSeen() { seen = { days: {}, legendHover: false, drops: [], changes: [] }; }
  resetSeen();

  // The Change Dates calendar applies a drop through the store, so the store's
  // change says something moved and the press that began it says what grain
  // was dragged: a whole date, a Section, a row, or a Section from the legend.
  var press = null;
  document.addEventListener('pointerdown', function (e) {
    var mount = $('#dates-calendar');
    press = null;
    if (!mount || !mount.contains(e.target) || closest(e.target, 'button')) return;
    var legend = closest(e.target, '.dcal-legend-item[data-sec]');
    var date = closest(e.target, '.dcal-d[data-date]');
    if (closest(e.target, '.dcal-det-row.is-unscheduled')) press = { kind: 'unscheduled' };
    else if (closest(e.target, '.dcal-det-row[data-row-id]')) press = { kind: 'row' };
    else if (closest(e.target, '[data-det-date][data-sec]')) press = { kind: 'section' };
    else if (legend) press = { kind: 'legend', sectionId: legend.dataset.sec };
    else if (date) press = { kind: 'date', iso: date.dataset.date };
  }, true);

  schedule.subscribe(function (change) {
    seen.changes.push(change.type);
    if (change.type === 'rows' && press) seen.drops.push(press);
    press = null;
    check();
  });

  document.addEventListener('mouseover', function (e) {
    var mount = $('#dates-calendar');
    if (!mount || !mount.contains(e.target)) return;
    var date = closest(e.target, '.dcal-d.has-rows[data-date]');
    if (date) seen.days[date.dataset.date] = true;
    if (closest(e.target, '.dcal-legend-item')) seen.legendHover = true;
  });

  function dropped(kind) { return seen.drops.some(function (d) { return d.kind === kind; }); }
  function changed(type) { return seen.changes.indexOf(type) !== -1; }

  // ---- Steps -----------------------------------------------------------------
  //
  //   page      where the step happens
  //   title     heading on the Tour card
  //   text      what to do; a function when it depends on the schedule
  //   ring      elements to ring
  //   anchor    elements the Tour card keeps clear of, besides the ring
  //   scroll    element brought into view when the step starts
  //   done      true once the step is done; no done means it waits for Next
  //   progress  a line under the text while the step is under way
  //   blocked   { text, ring } when the step can't be done from here yet
  //   enter     called when the step starts, e.g. to note where things are

  var steps = [
    {
      page: 'overview',
      title: 'Open the Start Date editor',
      text: 'Click the Start Date pill.',
      ring: function () { return [$('[data-action*="inline-date-editor#enterEditMode"]')]; },
      done: editOpen
    },
    {
      page: 'overview',
      title: 'Pick a new Start Date',
      text: 'Click the Date field and change the Start Date to September 14.',
      ring: function () {
        var popup = editorPopup();
        return [popup ? $('.cal-popup-d[data-date="' + START_ISO + '"]', popup) || popup :
          $('[data-action*="date-picker#toggle"]', editMode)];
      },
      anchor: function () { return [editMode, editorPopup()]; },
      blocked: needsEditor,
      done: function () {
        var label = editMode && $('[data-date-picker-target="label"]', editMode);
        return editOpen() && !!label && label.textContent.trim() === START_LABEL;
      }
    },
    {
      page: 'overview',
      title: 'Change the Delivery Days',
      text: 'Set the Delivery Days to Mon, Wed and Thu: untick Tue.',
      ring: function () { return [$('.badge-start-date-delivery-days-edit', editMode)]; },
      anchor: function () { return [editMode]; },
      blocked: needsEditor,
      done: function () { return editOpen() && checkedEditorDays().join() === DELIVERY_DAYS.join(); }
    },
    {
      page: 'overview',
      title: 'Open the calendar',
      text: 'The Overview calendar already shows the new dates. Hover over it and click Change Times & Date.',
      ring: function () { return [$('.overview-cal', editMode)]; },
      anchor: function () { return [editMode]; },
      blocked: needsEditor,
      // Done by the Change Dates button itself: see the click listener below.
      // Skip follows the same link, so Change Dates still gets the new dates.
      follow: function () { return $('[data-overview-cal-target="open"]', editMode); }
    },
    {
      page: 'change-dates',
      title: 'Your changes carried over',
      text: 'The Start Date field and Quest Delivery Days picked up September 14 and Mon, Wed, Thu, ' +
        'and the Change Dates calendar below is laid out on them. Nothing is saved yet.',
      ring: function () {
        var field = $('#day-schedule-form [data-controller~="date-picker"]');
        var box = $('input[name$="[delivery_days][]"]');
        return [field && field.closest('.form-group'), box && box.closest('.mb-4')];
      },
      enter: ensureSplit
    },
    {
      page: 'change-dates',
      title: 'Look around the calendar',
      text: 'Hover over a few days in the Change Dates calendar. The pane on the left lists what is on each.',
      ring: function () { return [cal('.dcal-grid-wrap')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      progress: function () {
        var n = Math.min(Object.keys(seen.days).length, 3);
        return n + ' of 3 days';
      },
      done: function () { return Object.keys(seen.days).length >= 3; }
    },
    {
      page: 'change-dates',
      title: 'Move a day off',
      text: 'You have ' + dayLabel(DAY_OFF) + ' off. Drag it onto ' + dayLabel(DAY_OFF_TO) + ' to move it there.',
      ring: function () { return [cell(DAY_OFF), cell(DAY_OFF_TO)]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return !rowsOn(DAY_OFF).length && rowsOn(DAY_OFF_TO).length > 0; }
    },
    {
      page: 'change-dates',
      title: 'Swap for a rain day',
      text: 'It’s raining on the 29th, and its challenge requires going outside. ' +
        'Drag the 29th onto another day that week to swap them.',
      ring: function () { return [cal('.dcal-week[data-week="' + addDays(DAY_OFF_TO, -2) + '"]')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: function (data) {
        ensureSplit();
        data.ids = rowsOn(DAY_OFF_TO).map(function (row) { return row.id; });
      },
      done: function (data) {
        // Without rows on the 29th to follow, any whole-date drop will do.
        if (!data.ids.length) return dropped('date');
        var weekFirst = addDays(DAY_OFF_TO, -2), weekLast = addDays(DAY_OFF_TO, 4);
        var dates = data.ids.map(function (id) { return schedule.getRow(id).dueDate; });
        return dates.every(function (iso) {
          return iso && iso === dates[0] && iso !== DAY_OFF_TO && iso >= weekFirst && iso <= weekLast;
        });
      }
    },
    {
      page: 'change-dates',
      title: 'Select a day',
      text: 'Click a date in the calendar to keep it in the pane.',
      ring: function () { return [cal('.dcal-grid-wrap')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return !!cal('.dcal-d.is-picked'); }
    },
    {
      page: 'change-dates',
      title: 'Move one challenge',
      text: 'Drag a challenge from the pane onto another date. Only that challenge moves.',
      ring: function () { return [cal('[data-dcal-panel]')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return dropped('row'); }
    },
    {
      page: 'change-dates',
      title: 'Move a Section',
      text: 'Drag a Section header in the pane, the coloured name above its rows, onto another date. ' +
        'Only that Section’s rows on that day move.',
      ring: function () {
        var headers = $$('#dates-calendar [data-dcal-panel] [data-det-date][data-sec]');
        return headers.length ? headers : [cal('[data-dcal-panel]')];
      },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return dropped('section'); }
    },
    {
      page: 'change-dates',
      title: 'Browse by Section',
      text: 'Hover over a Section in the legend to light up its dates. Then click BONUS.',
      ring: function () { return [seen.legendHover ? legendItem(BONUS) : cal('.dcal-legend')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { var item = legendItem(BONUS); return !!item && item.classList.contains('is-picked'); }
    },
    {
      page: 'change-dates',
      title: 'Schedule a challenge',
      text: 'BONUS challenges with no date are listed under Unscheduled at the foot of the pane. ' +
        'Drag one onto the calendar.',
      ring: function () { return [cal('.dcal-det--unsched') || cal('[data-dcal-panel]')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      // The pane follows the pointer over the grid, so what counts is that a
      // Section with unscheduled rows is still kept in it.
      blocked: function () {
        if (cal('.dcal-legend-item.is-picked .dcal-legend-count') || cal('.dcal-det--unsched')) return null;
        return { text: 'Click BONUS in the legend to list its unscheduled challenges.', ring: [legendItem(BONUS)] };
      },
      done: function () { return dropped('unscheduled'); }
    },
    {
      page: 'change-dates',
      title: 'Swap Week 3 and Week 4',
      text: function (data) {
        return 'You need to switch Week 3 and Week 4. Drag Week 3 from the legend onto ' + dayLabel(data.week4) +
          ', where Week 4 starts, then drag Week 4 onto ' + dayLabel(data.week3) + '.';
      },
      ring: function (data) {
        // The two legend items touch, so they share one ring.
        return [[legendItem(WEEK_3), legendItem(WEEK_4)], cell(data.week3), cell(data.week4)];
      },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: function (data) {
        ensureSplit();
        data.week3 = firstDateOf(WEEK_3);
        data.week4 = firstDateOf(WEEK_4);
      },
      progress: function () {
        return [WEEK_3, WEEK_4].map(function (id) {
          return sectionName(id).split(' –')[0] + (legendDropped(id) ? ' ✓' : ' …');
        }).join(' · ');
      },
      done: function () {
        var w3 = firstDateOf(WEEK_3), w4 = firstDateOf(WEEK_4);
        return legendDropped(WEEK_3) && legendDropped(WEEK_4) && !!w3 && !!w4 && w3 > w4;
      }
    },
    {
      page: 'change-dates',
      title: 'Reset dates',
      text: 'Nevermind. Click Reset dates to start over.',
      ring: function () { return [cal('[data-dcal-reset]')]; },
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return changed('reset'); }
    },
    {
      page: 'change-dates',
      title: 'Reset to Defaults',
      text: 'Go back further still: click Reset to Defaults at the bottom of the page, then confirm.',
      ring: function () { return [resetConfirmButton() || $('[data-reset-defaults]')]; },
      anchor: function () { return [$('.block-confirm .modal')]; },
      scroll: function () { return $('#reset-defaults-block'); },
      done: function () { return changed('defaults'); }
    },
    {
      page: 'change-dates',
      title: 'Undo',
      text: function () {
        var d = schedule.getDefaultSchedule();
        return 'The calendar now starts on ' + dayLabel(d.startDate) + ' with Tue, Wed and Thu, and Week 6 and ' +
          'BONUS are unscheduled. Maybe I Went Too Far. Press Ctrl+Z (⌘Z on a Mac) to undo Reset to Defaults.';
      },
      ring: function () { return [cal('.dcal-grid-wrap')]; },
      anchor: calendarBody,
      scroll: calendarBlock,
      enter: ensureSplit,
      done: function () { return changed('undo'); }
    },
    {
      page: 'change-dates',
      title: 'You’re done',
      text: 'That’s the tour. Free roam from here: drag anything, try the other calendar versions, ' +
        'or change a Time group’s time. Ctrl+Z undoes any change. Ctrl+Y redoes it.',
      ring: function () { return []; },
      last: true
    }
  ];

  function needsEditor() {
    return editOpen() ? null : {
      text: 'The Start Date editor closed. Click the Start Date pill to open it again.',
      ring: [$('[data-action*="inline-date-editor#enterEditMode"]')]
    };
  }
  function resetConfirmButton() { return $('.block-confirm [data-jt-confirm-role="confirm"]'); }
  function calendarBody() { return [cal('.dcal-body')]; }
  function calendarBlock() { return $('#dates-calendar'); }
  function legendDropped(sectionId) {
    return seen.drops.some(function (d) { return d.kind === 'legend' && d.sectionId === sectionId; });
  }

  // ---- Tour state ------------------------------------------------------------

  function storedStep() {
    try {
      var n = parseInt(sessionStorage.getItem(STEP_KEY), 10);
      return n >= 0 && n < steps.length ? n : null;
    } catch (e) { return null; }
  }
  function storeStep(n) {
    try {
      if (n === null) sessionStorage.removeItem(STEP_KEY);
      else sessionStorage.setItem(STEP_KEY, String(n));
    } catch (e) {}
  }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {} }
  function wasSeen() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; } }

  var current = null;   // index of the step showing, or null
  var welcome = false;  // the welcome card is showing instead of a step
  var data = {};        // what the current step noted when it started
  var finishing = false;

  function go(n) {
    current = n;
    welcome = false;
    finishing = false;
    storeStep(n);
    resetSeen();
    data = {};
    var step = steps[n];
    if (step && step.page === PAGE) {
      if (step.enter) step.enter(data);
      var target = step.scroll && step.scroll();
      if (target) bringIntoView(target);
      else {
        var first = elementsOf(visible(step.ring(data)))[0];
        if (first) bringIntoView(first);
      }
    }
    draw(true);
  }

  function start() {
    markSeen();
    // Back to the markup's dates, so September 14 and the rest mean what the
    // steps say they mean.
    schedule.reset();
    if (PAGE !== 'overview') { storeStep(0); window.location.href = PAGE_URL.overview; return; }
    go(0);
  }

  function stop() {
    current = null;
    welcome = false;
    storeStep(null);
    markSeen();
    draw(true);
  }

  function showWelcome() {
    welcome = true;
    current = null;
    draw(true);
  }

  // A done step says so for a moment before the next one takes the card.
  function check() {
    if (current === null || finishing) return;
    var step = steps[current];
    if (!step || step.page !== PAGE || !step.done || step.blocked && step.blocked(data)) return;
    if (!step.done(data)) return;
    finishing = true;
    draw(false);
    var from = current;
    setTimeout(function () { if (current === from) go(from + 1); }, 700);
  }

  // The Change Dates button is how step 4 is done. The step is stored before
  // the link is followed, so Change Dates opens on step 5.
  document.addEventListener('click', function (e) {
    if (current !== 3 || PAGE !== 'overview') return;
    if (closest(e.target, '[data-overview-cal-target="open"]')) storeStep(4);
  }, true);

  // ---- Tour card and rings ---------------------------------------------------

  var card = document.createElement('div');
  card.className = 'tour-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Guided tour');
  card.hidden = true;
  document.body.appendChild(card);
  // A press on the card is not a press on the page: it mustn't let the Split
  // pane go or close the Date-select Calendar.
  card.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  card.addEventListener('click', function (e) {
    e.stopPropagation();
    var btn = closest(e.target, '[data-tour]');
    if (!btn) return;
    var act = btn.dataset.tour;
    if (act === 'start') start();
    else if (act === 'later') { markSeen(); welcome = false; draw(true); }
    else if (act === 'close' || act === 'finish') stop();
    else if ((act === 'next' || act === 'skip') && steps[current].follow) {
      storeStep(current + 1);
      window.location.href = steps[current].follow().href;
    }
    else if (act === 'next' || act === 'skip') go(current + 1);
    else if (act === 'back') go(current - 1);
    else if (act === 'page') window.location.href = PAGE_URL[steps[current].page];
  });

  var X_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  function button(act, label, style) {
    return '<button type="button" class="tour-btn tour-btn--' + style + '" data-tour="' + act + '">' + label + '</button>';
  }

  function cardHTML() {
    if (welcome) {
      return '<div class="tour-head"><span class="tour-count">Guided tour · ' + steps.length + ' steps</span>' +
        '<button type="button" class="tour-close" data-tour="later" aria-label="Close">' + X_SVG + '</button></div>' +
        '<p class="tour-title">Take the tour</p>' +
        '<p class="tour-text">Pick a new Start Date here, then move days, challenges and whole weeks on the ' +
        'Change Dates calendar. Starting puts the demo schedule back to its original dates.</p>' +
        '<div class="tour-actions">' + button('later', 'Not now', 'ghost') + button('start', 'Start tour', 'accent') + '</div>';
    }
    var step = steps[current];
    var head = '<div class="tour-head"><span class="tour-count">Step ' + (current + 1) + ' of ' + steps.length +
      ' · ' + PAGE_NAME[step.page] + '</span>' +
      '<button type="button" class="tour-close" data-tour="close" aria-label="End tour">' + X_SVG + '</button></div>';
    var back = current > 0 ? button('back', 'Back', 'ghost') : '<span></span>';

    if (step.page !== PAGE) {
      return head + '<p class="tour-title">' + esc(step.title) + '</p>' +
        '<p class="tour-text">This step is on ' + PAGE_NAME[step.page] + '.</p>' +
        '<div class="tour-actions">' + back + button('page', 'Go to ' + PAGE_NAME[step.page], 'accent') + '</div>';
    }

    var blocked = step.blocked && step.blocked(data);
    var text = blocked ? blocked.text : typeof step.text === 'function' ? step.text(data) : step.text;
    var progress = finishing ? '<p class="tour-progress is-done">Done ✓</p>' :
      step.progress && !blocked ? '<p class="tour-progress">' + esc(step.progress(data)) + '</p>' : '';
    var forward = step.last ? button('finish', 'Finish', 'accent') :
      step.done || step.follow ? button('skip', 'Skip', 'ghost') : button('next', 'Next', 'accent');
    return head + '<p class="tour-title">' + esc(step.title) + '</p>' +
      '<p class="tour-text">' + esc(text) + '</p>' + progress +
      '<div class="tour-actions">' + back + forward + '</div>';
  }

  var launch = null;
  function draw(entering) {
    var open = welcome || current !== null;
    if (launch) launch.hidden = open;
    if (!open) { card.hidden = true; card.dataset.html = ''; hideRings(); return; }
    var html = cardHTML();
    if (card.dataset.html !== html) { card.innerHTML = html; card.dataset.html = html; }
    if (card.hidden || entering) {
      card.classList.remove('is-entering');
      void card.offsetWidth;
      card.classList.add('is-entering');
      lastSpot = null;
    }
    card.hidden = false;
  }

  // Tour button, in the Copy notice on both pages.
  var notice = $('.copy-notice');
  if (notice) {
    launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'tour-launch';
    launch.textContent = 'Take the tour';
    launch.addEventListener('click', function () { if (PAGE === 'overview') showWelcome(); else start(); });
    notice.appendChild(launch);
  }

  var rings = [];
  function hideRings() { rings.forEach(function (r) { r.hidden = true; }); }
  // A ring entry is an element, or a list of elements that share one ring.
  function visible(list) {
    return (list || []).map(function (entry) {
      if (!Array.isArray(entry)) return isShown(entry) ? entry : null;
      var shown = entry.filter(isShown);
      return shown.length ? shown : null;
    }).filter(Boolean);
  }
  function elementsOf(list) { return [].concat.apply([], list); }

  function bringIntoView(el) {
    var rect = el.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) return;
    el.scrollIntoView({ block: rect.height < window.innerHeight - 40 ? 'center' : 'start', behavior: 'smooth' });
  }

  function drawRings(list) {
    list.forEach(function (entry, i) {
      var ring = rings[i];
      if (!ring) {
        ring = rings[i] = document.createElement('div');
        ring.className = 'tour-ring';
        document.body.appendChild(ring);
      }
      var group = [].concat(entry), el = group[0];
      var rect = union(group.map(function (g) { return g.getBoundingClientRect(); }));
      rect.width = rect.right - rect.left;
      rect.height = rect.bottom - rect.top;
      var style = getComputedStyle(el);
      var round = style.borderRadius === '50%' || parseFloat(style.borderRadius) >= Math.min(rect.width, rect.height) / 2;
      var pad = round ? 5 : 4;
      ring.style.left = (rect.left - pad) + 'px';
      ring.style.top = (rect.top - pad) + 'px';
      ring.style.width = (rect.width + pad * 2) + 'px';
      ring.style.height = (rect.height + pad * 2) + 'px';
      ring.style.borderRadius = round ? '9999px' : 'calc(' + (parseFloat(style.borderRadius) || 0) + 'px + ' + pad + 'px)';
      ring.hidden = false;
    });
    for (var j = list.length; j < rings.length; j++) rings[j].hidden = true;
  }

  // ---- Placement -------------------------------------------------------------

  // The card sits beside what the step points at, on whichever side has room,
  // and otherwise in a corner of the window. It keeps clear of the ring, the
  // step's anchor and the Copy notice. The side it last took is kept while it
  // still fits, so it doesn't hop about as the page changes under it.
  var lastSpot = null;
  var EDGE = 8, GAP = 12;

  function clipped(rect) {
    var l = Math.max(rect.left, 0), t = Math.max(rect.top, 0);
    var r = Math.min(rect.right, window.innerWidth), b = Math.min(rect.bottom, window.innerHeight);
    return r > l && b > t ? { left: l, top: t, right: r, bottom: b } : null;
  }
  function union(rects) {
    return rects.reduce(function (u, r) {
      return !u ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } :
        { left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) };
    }, null);
  }
  function overlap(a, b) {
    var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    var h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }

  function place(avoidEls) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var maxL = vw - cw - EDGE, maxT = vh - ch - EDGE;
    var avoid = avoidEls.map(function (el) { return clipped(el.getBoundingClientRect()); }).filter(Boolean);
    var a = union(avoid);
    var spots = [];
    if (a) {
      spots.push({ key: 'right', left: a.right + GAP, top: clamp(a.top, EDGE, maxT) });
      spots.push({ key: 'left', left: a.left - GAP - cw, top: clamp(a.top, EDGE, maxT) });
      spots.push({ key: 'below', left: clamp(a.left, EDGE, maxL), top: a.bottom + GAP });
      spots.push({ key: 'above', left: clamp(a.left, EDGE, maxL), top: a.top - GAP - ch });
    }
    spots.push({ key: 'bottom-right', left: maxL - 16, top: maxT - 16 });
    spots.push({ key: 'bottom-left', left: EDGE + 16, top: maxT - 16 });
    spots.push({ key: 'top-right', left: maxL - 16, top: EDGE + 16 });
    spots.push({ key: 'top-left', left: EDGE + 16, top: EDGE + 16 });

    var noticeRect = notice && clipped(notice.getBoundingClientRect());
    var best = null;
    spots.forEach(function (s) {
      if (s.left < EDGE || s.top < EDGE || s.left > maxL || s.top > maxT) return;
      var box = { left: s.left, top: s.top, right: s.left + cw, bottom: s.top + ch };
      s.score = avoid.reduce(function (n, r) { return n + overlap(box, r); }, 0) * 10 +
        (noticeRect ? overlap(box, noticeRect) : 0);
      if (lastSpot && s.key === lastSpot && s.score === 0) s.score = -1;
      if (!best || s.score < best.score) best = s;
    });
    if (!best) best = { key: 'bottom-right', left: clamp(maxL - 16, EDGE, maxL), top: clamp(maxT - 16, EDGE, maxT) };
    lastSpot = best.key;
    card.style.left = Math.round(best.left) + 'px';
    card.style.top = Math.round(best.top) + 'px';
  }

  // Every frame while the card is up: the calendar redraws and the page
  // scrolls under the rings, so they are measured afresh each time.
  function frame() {
    if (!card.hidden) {
      var step = current !== null && steps[current];
      var ringEls = [], anchorEls = [];
      if (step && step.page === PAGE) {
        var blocked = step.blocked && step.blocked(data);
        ringEls = visible(blocked ? blocked.ring : step.ring(data));
        anchorEls = visible(blocked ? [] : step.anchor ? step.anchor(data) : []);
        // A blocked step's text differs, and a progress line changes as the
        // visitor goes; the card only rewrites itself when its HTML does.
        draw(false);
      }
      drawRings(ringEls);
      place(elementsOf(ringEls).concat(anchorEls));
    }
    window.requestAnimationFrame(frame);
  }

  // ---- Start -----------------------------------------------------------------

  function init() {
    var params = new URLSearchParams(window.location.search);
    var n = storedStep();
    if (n !== null) go(n);
    else if (PAGE === 'overview' && (params.has('tour') || !wasSeen())) showWelcome();
    else draw(true);
    // Hover and drag steps are checked as they happen; this catches the rest,
    // such as a checkbox or a date pick.
    setInterval(check, 250);
    window.requestAnimationFrame(frame);
  }

  // After change-dates-page.js has put the Prefill parameters into the store,
  // so step 5 starts on the carried-over schedule.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

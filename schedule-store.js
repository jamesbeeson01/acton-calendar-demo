(function () {
  // Every date and day shown on the page is rendered from this store, so a
  // calendar view only has to change the data. The store is seeded from the
  // page's own markup (so the first render changes nothing), writes back into
  // existing elements' text, data attributes and checkbox state only (never
  // structure), and keeps changes in localStorage so Badge Overview and
  // Change Dates agree.

  var STORAGE_KEY = 'journey-tracker-schedule';
  var MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTH_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  var TIME = /^\d{2}:\d{2}$/;

  // Hard-coded because Change Dates doesn't show section names. Ids match
  // [data-milestone-id] on both pages; order is the Badge Overview order.
  var SECTIONS = [
    { id: '571796', name: 'SETUP' },
    { id: '571797', name: 'Week 1 – Welcome to the Carnival' },
    { id: '571798', name: 'Week 2 – Building Together' },
    { id: '571799', name: 'Week 3 – Responsibility' },
    { id: '571800', name: 'Week 4 – Culture' },
    { id: '571801', name: 'Week 5 – Opening Day' },
    { id: '571802', name: 'Week 6 – Heroes & Games (optional)' },
    { id: '571803', name: 'BONUS Launches & Core Systems' }
  ];

  // The badge ships with these two Sections unscheduled, so the defaults the
  // Reset to defaults block restores leave every row in them without a date.
  var UNSCHEDULED_SECTIONS = ['571802', '571803'];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function parseISO(iso) { var p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function toISO(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function addDays(iso, n) { var d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); }
  function weekdayOf(iso) { return WEEKDAYS[parseISO(iso).getUTCDay()]; }
  function copy(obj) { return obj ? Object.assign({}, obj) : null; }
  // Delivery days are always kept in week order, e.g. ["monday","thursday"].
  function weekOrder(days) { return WEEKDAYS.filter(function (d) { return days.indexOf(d) !== -1; }); }
  function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }

  // Formats, each matching what the static markup already contains.

  // Date pill: "12:00am on Aug 20, 2026", " 3:00pm on Sep 23, 2026" (hour is space-padded)
  function formatDatePill(iso, time) {
    var d = parseISO(iso), t = time.split(':').map(Number);
    return String(t[0] % 12 || 12).padStart(2, ' ') + ':' + pad2(t[1]) + (t[0] < 12 ? 'am' : 'pm') +
      ' on ' + MONTH_SHORT[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  // Day pill: "Day -10"
  function formatDayPill(day) { return 'Day ' + day; }
  // data-due-date: "2026-08-20 00:00:00 -0600"
  function formatDueDateAttr(row) { return row.dueDate + ' ' + row.dueTime + ':00 ' + row.utcOffset; }
  // data-original-due-date: "2026-08-20T00:00:00-06:00"
  function formatDueDateTimeISO(row) {
    return row.dueDate + 'T' + row.dueTime + ':00' + row.utcOffset.slice(0, 3) + ':' + row.utcOffset.slice(3);
  }
  // Start Date field: "September 8, 2026"
  function formatLong(iso) { var d = parseISO(iso); return MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }

  // ---- Seed: read what the page already shows --------------------------------

  var seed = { startDate: null, deliveryDays: [], rows: {} };
  var rowOrder = [];
  var bindings = {}; // row id -> { articles: [Schedule row], items: [Change Dates preview item] }

  function pillTextEl(article, name) {
    return article.querySelector('[data-pill="' + name + '"] [data-pill-text]');
  }

  function readPage() {
    var editor = document.querySelector('[data-controller~="inline-date-editor"]');
    var dayForm = document.getElementById('day-schedule-form');
    if (editor) {
      seed.startDate = editor.dataset.inlineDateEditorOriginalStartAtValue || null;
      seed.deliveryDays = weekOrder(JSON.parse(editor.dataset.inlineDateEditorOriginalDeliveryDaysValue || '[]'));
    } else if (dayForm) {
      var popup = dayForm.querySelector('[data-calendar-popup-selected-value]');
      seed.startDate = (popup && popup.dataset.calendarPopupSelectedValue) || null;
      seed.deliveryDays = weekOrder(JSON.parse(dayForm.dataset.selectedDeliveryDays || '[]'));
    }

    var defaultOffset = null;
    document.querySelectorAll('article.cl-row').forEach(function (article) {
      var id = article.id;
      if (!bindings[id]) {
        var due = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):\d{2} ([+-]\d{4})$/.exec(article.getAttribute('data-due-date') || '');
        var dayEl = pillTextEl(article, 'scheduled-day');
        var titleEl = article.querySelector('.cl-title');
        var sectionEl = article.closest('[data-milestone-id]');
        if (due && !defaultOffset) defaultOffset = due[3];
        seed.rows[id] = {
          id: id,
          type: article.classList.contains('close-challenge') ? 'close' : article.classList.contains('launch') ? 'launch' : 'challenge',
          title: titleEl ? titleEl.textContent.trim() : '',
          sectionId: sectionEl ? sectionEl.dataset.milestoneId : null,
          position: parseInt(article.dataset.position, 10),
          dueDate: due ? due[1] : null,
          dueTime: due ? due[2] : null,
          utcOffset: due ? due[3] : null,
          scheduledDay: dayEl ? parseInt(dayEl.textContent.replace('Day', ''), 10) : null
        };
        bindings[id] = { articles: [], items: [] };
        rowOrder.push(id);
      }
      bindings[id].articles.push(article);
      var item = article.closest('[data-bulk-time-change-target="challengeItem"]');
      if (item) bindings[id].items.push(item);
    });
    // Undated rows need an offset in case they are given a date later.
    rowOrder.forEach(function (id) { if (!seed.rows[id].utcOffset) seed.rows[id].utcOffset = defaultOffset; });
  }

  // ---- State and persistence -------------------------------------------------

  var state;
  // Only differences from the seed are stored. Rows missing from this page
  // (undated rows aren't on Change Dates) keep their stored entries untouched.
  var stored = { rows: {} };

  function loadStored() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s && typeof s === 'object' && s.rows) stored = s;
    } catch (e) {}
  }

  function buildState() {
    state = { startDate: seed.startDate, deliveryDays: seed.deliveryDays.slice(), rows: {} };
    if (hasOwn(stored, 'startDate')) state.startDate = stored.startDate;
    if (hasOwn(stored, 'deliveryDays')) state.deliveryDays = weekOrder(stored.deliveryDays);
    rowOrder.forEach(function (id) { state.rows[id] = Object.assign({}, seed.rows[id], stored.rows[id]); });
  }

  // The intended original schedule: the markup's own start date, delivery days
  // and dates, minus the Sections the badge ships unscheduled. It is built
  // from the seed, not the stored state, so it never moves with a change.
  var defaults;

  function buildDefaults() {
    defaults = { startDate: seed.startDate, deliveryDays: seed.deliveryDays.slice(), rows: {} };
    rowOrder.forEach(function (id) {
      var row = seed.rows[id], off = UNSCHEDULED_SECTIONS.indexOf(row.sectionId) !== -1;
      defaults.rows[id] = {
        dueDate: off ? null : row.dueDate,
        dueTime: off ? null : row.dueTime,
        scheduledDay: off ? null : row.scheduledDay
      };
    });
  }

  function save() {
    rowOrder.forEach(function (id) {
      var row = state.rows[id], base = seed.rows[id];
      if (row.dueDate === base.dueDate && row.dueTime === base.dueTime && row.scheduledDay === base.scheduledDay) delete stored.rows[id];
      else stored.rows[id] = { dueDate: row.dueDate, dueTime: row.dueTime, scheduledDay: row.scheduledDay };
    });
    if (state.startDate === seed.startDate) delete stored.startDate;
    else stored.startDate = state.startDate;
    if (state.deliveryDays.join() === seed.deliveryDays.join()) delete stored.deliveryDays;
    else stored.deliveryDays = state.deliveryDays;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch (e) {}
  }

  // ---- Render: write data into existing elements -----------------------------

  function setAttr(el, name, value) { if (el.getAttribute(name) !== value) el.setAttribute(name, value); }
  function setText(el, value) { if (el && el.textContent !== value) el.textContent = value; }
  // The one thing rendered as style rather than text: an unscheduled row shows
  // no Date or Day pill, and no Preview item, the way Change Dates leaves out
  // the rows that never had a date.
  function showEl(el, on) { if (el && el.style.display !== (on ? '' : 'none')) el.style.display = on ? '' : 'none'; }
  function isShown(el) { return el.style.display !== 'none'; }

  function renderRow(id) {
    var row = state.rows[id], b = bindings[id];
    b.articles.forEach(function (article) {
      showEl(article.querySelector('[data-pill="date"]'), !!row.dueDate);
      showEl(article.querySelector('[data-pill="scheduled-day"]'), !!row.dueDate && row.scheduledDay !== null);
      if (!row.dueDate) { setAttr(article, 'data-due-date', ''); return; }
      setAttr(article, 'data-due-date', formatDueDateAttr(row));
      setText(pillTextEl(article, 'date'), formatDatePill(row.dueDate, row.dueTime));
      if (row.scheduledDay !== null) setText(pillTextEl(article, 'scheduled-day'), formatDayPill(row.scheduledDay));
    });
    b.items.forEach(function (item) {
      showEl(item, !!row.dueDate);
      if (!row.dueDate) return;
      if (row.scheduledDay !== null) setAttr(item, 'data-scheduled-day', String(row.scheduledDay));
      setAttr(item, 'data-original-time', row.dueTime);
      setAttr(item, 'data-original-due-date', formatDueDateTimeISO(row));
      setAttr(item, 'data-before-day', weekdayOf(row.dueDate));
      setAttr(item, 'data-preview-date', row.dueDate);
    });
  }

  // A time group's day mirrors its first preview item. Its time is left
  // alone: moving rows between time groups would be a structure change.
  function renderTimeGroups() {
    document.querySelectorAll('[data-target="bulk-time-change.timeGroup"]').forEach(function (group) {
      var shown = Array.prototype.filter.call(
        group.querySelectorAll('[data-bulk-time-change-target="challengeItem"]'), isShown);
      // A Time group whose rows are all unscheduled has nothing left to preview.
      showEl(group, shown.length > 0);
      if (shown.length) setAttr(group, 'data-scheduled-day', shown[0].getAttribute('data-scheduled-day'));
    });
  }

  // Start date and delivery days. The Badge Overview editor renders its own
  // field, pill and checkboxes from the store (see badge-overview-page.js),
  // so only its data attributes are written here.
  function renderScheduleSettings() {
    var days = JSON.stringify(state.deliveryDays);
    document.querySelectorAll('[data-controller~="inline-date-editor"]').forEach(function (editor) {
      setAttr(editor, 'data-inline-date-editor-original-start-at-value', state.startDate || '');
      setAttr(editor, 'data-inline-date-editor-original-delivery-days-value', days);
    });
    document.querySelectorAll('[data-controller~="date-picker"]').forEach(function (field) {
      if (field.closest('[data-controller~="inline-date-editor"]')) return;
      setText(field.querySelector('[data-date-picker-target="label"]'),
        state.startDate ? formatLong(state.startDate) : field.dataset.datePickerPlaceholderValue);
      var popup = document.getElementById(field.dataset.datePickerPopupIdValue);
      if (popup) setAttr(popup, 'data-calendar-popup-selected-value', state.startDate || '');
    });
    var dayForm = document.getElementById('day-schedule-form');
    if (dayForm) setAttr(dayForm, 'data-selected-delivery-days', days);
    document.querySelectorAll('input[type="checkbox"][name$="[delivery_days][]"]').forEach(function (box) {
      if (box.closest('[data-controller~="inline-date-editor"]')) return;
      box.checked = state.deliveryDays.indexOf(box.value) !== -1;
    });
  }

  function render() {
    rowOrder.forEach(renderRow);
    renderTimeGroups();
    renderScheduleSettings();
  }

  // ---- Day numbers -----------------------------------------------------------

  function isDeliveryDay(iso) { return state.deliveryDays.indexOf(weekdayOf(iso)) !== -1; }

  // Only delivery days are counted. The start date is Day 1 and there is no
  // Day 0: the last delivery day before the start date is Day -1.
  function scheduledDayFor(iso) {
    if (!state.startDate || !state.deliveryDays.length) return null;
    var n = 0, d;
    if (iso >= state.startDate) {
      for (d = state.startDate; d <= iso; d = addDays(d, 1)) if (isDeliveryDay(d)) n++;
    } else {
      for (d = iso; d < state.startDate; d = addDays(d, 1)) if (isDeliveryDay(d)) n--;
    }
    return n;
  }

  // settings: optional { startDate, deliveryDays } to count with instead of the
  // saved schedule, e.g. to preview Start Date editor choices before Save.
  function dateForScheduledDay(day, settings) {
    var startDate = settings ? settings.startDate : state.startDate;
    // weekOrder drops anything that isn't a weekday name, so the loop always ends.
    var days = settings ? weekOrder(settings.deliveryDays || []) : state.deliveryDays;
    if (!startDate || !ISO_DATE.test(startDate) || !days.length || !day) return null;
    var step = day > 0 ? 1 : -1, n = 0;
    for (var d = day > 0 ? startDate : addDays(startDate, -1); ; d = addDays(d, step)) {
      if (days.indexOf(weekdayOf(d)) !== -1) { n += step; if (n === day) return d; }
    }
  }

  // ---- Public API ------------------------------------------------------------

  var listeners = [];

  function commit(change) {
    save();
    render();
    listeners.slice().forEach(function (fn) { fn(change); });
  }

  function checkRowChanges(id, changes) {
    if (!state.rows[id]) throw new Error('Unknown schedule row: ' + id);
    if ('dueDate' in changes && changes.dueDate !== null && !ISO_DATE.test(changes.dueDate)) throw new Error('dueDate must be YYYY-MM-DD or null');
    if ('dueTime' in changes && changes.dueTime !== null && !TIME.test(changes.dueTime)) throw new Error('dueTime must be HH:MM or null');
  }

  function applyRowChanges(id, changes) {
    var row = state.rows[id];
    if ('dueDate' in changes) row.dueDate = changes.dueDate;
    if ('dueTime' in changes) row.dueTime = changes.dueTime;
    // A null dueDate unschedules the row, so it keeps no time or day either.
    if (!row.dueDate) { row.dueDate = null; row.dueTime = null; row.scheduledDay = null; return; }
    if (!row.dueTime) row.dueTime = '00:00';
    if ('scheduledDay' in changes) row.scheduledDay = changes.scheduledDay;
    else if ('dueDate' in changes) row.scheduledDay = scheduledDayFor(row.dueDate);
  }

  // changes: { dueDate: 'YYYY-MM-DD' | null, dueTime: 'HH:MM' | null, scheduledDay: n },
  // all optional. A new dueDate recalculates scheduledDay unless one is passed
  // too; a null dueDate unschedules the row.
  function updateRow(id, changes) {
    checkRowChanges(id, changes);
    applyRowChanges(id, changes);
    commit({ type: 'row', rowId: id });
    return copy(state.rows[id]);
  }

  // list: [{ id, dueDate, dueTime, scheduledDay }], each entry like updateRow's
  // changes. Applied as one change, so moving a whole date on a calendar saves,
  // renders and notifies once, and can be undone in one step. Nothing is
  // applied unless every entry is valid.
  function updateRows(list) {
    list.forEach(function (changes) { checkRowChanges(changes.id, changes); });
    list.forEach(function (changes) { applyRowChanges(changes.id, changes); });
    commit({ type: 'rows', rowIds: list.map(function (changes) { return changes.id; }) });
  }

  // changes: { startDate: 'YYYY-MM-DD' | null, deliveryDays: ['monday', ...] }, both optional.
  // Every dated row keeps its day number and time and moves to the date that
  // day number now falls on. Rows are never re-ordered.
  function setSchedule(changes) {
    if ('startDate' in changes && changes.startDate !== null && !ISO_DATE.test(changes.startDate)) {
      throw new Error('startDate must be YYYY-MM-DD or null');
    }
    if ('deliveryDays' in changes && !(Array.isArray(changes.deliveryDays) &&
        changes.deliveryDays.every(function (d) { return WEEKDAYS.indexOf(d) !== -1; }))) {
      throw new Error('deliveryDays must be lowercase weekday names, e.g. ["monday"]');
    }
    if ('startDate' in changes) state.startDate = changes.startDate;
    if ('deliveryDays' in changes) state.deliveryDays = weekOrder(changes.deliveryDays);
    rowOrder.forEach(function (id) {
      var row = state.rows[id];
      // Without a start date or any delivery days there is no date to move to.
      var date = row.dueDate && row.scheduledDay ? dateForScheduledDay(row.scheduledDay) : null;
      if (date) row.dueDate = date;
    });
    commit({ type: 'schedule' });
  }

  function reset() {
    stored = { rows: {} };
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    buildState();
    commit({ type: 'reset' });
  }

  // Drops every stored change and puts the page back to the intended original
  // schedule, which leaves Week 6 and BONUS unscheduled. Unlike reset() that
  // is a change like any other, so it is stored and the Time groups show it.
  function resetToDefaults() {
    stored = { rows: {} };
    buildState();
    state.startDate = defaults.startDate;
    state.deliveryDays = defaults.deliveryDays.slice();
    rowOrder.forEach(function (id) { Object.assign(state.rows[id], defaults.rows[id]); });
    commit({ type: 'defaults' });
  }

  function byPosition(a, b) { return a.position - b.position; }

  readPage();
  buildDefaults();
  loadStored();
  buildState();
  render();

  window.JourneySchedule = {
    getStartDate: function () { return state.startDate; },
    getDeliveryDays: function () { return state.deliveryDays.slice(); },
    setSchedule: setSchedule,
    getSections: function () { return SECTIONS.map(copy); },
    getSection: function (sectionId) {
      return copy(SECTIONS.filter(function (s) { return s.id === sectionId; })[0]);
    },
    // Rows present on this page, in page order.
    getRows: function () { return rowOrder.map(function (id) { return copy(state.rows[id]); }); },
    getRow: function (id) { return copy(state.rows[id]); },
    // The row as the page's markup has it, before any stored change.
    getOriginalRow: function (id) { return copy(seed.rows[id]); },
    // The row in the intended original schedule: no dates at all in the
    // Sections the badge ships unscheduled.
    getDefaultRow: function (id) { return copy(defaults.rows[id]); },
    getDefaultSchedule: function () {
      return { startDate: defaults.startDate, deliveryDays: defaults.deliveryDays.slice() };
    },
    // Rows present on this page, in their order within the section.
    getRowsInSection: function (sectionId) {
      return rowOrder.map(function (id) { return state.rows[id]; })
        .filter(function (row) { return row.sectionId === sectionId; })
        .sort(byPosition)
        .map(copy);
    },
    getSectionOfRow: function (id) {
      var row = state.rows[id];
      return row ? window.JourneySchedule.getSection(row.sectionId) : null;
    },
    updateRow: updateRow,
    updateRows: updateRows,
    scheduledDayFor: scheduledDayFor,
    dateForScheduledDay: dateForScheduledDay,
    // fn({ type: 'row' | 'rows' | 'schedule' | 'reset' | 'defaults', rowId,
    // rowIds }); returns an unsubscribe function.
    subscribe: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (l) { return l !== fn; }); };
    },
    // Drops all stored changes and restores the dates in the markup.
    reset: reset,
    // Restores the intended original schedule instead of the markup's dates.
    resetToDefaults: resetToDefaults
  };
})();

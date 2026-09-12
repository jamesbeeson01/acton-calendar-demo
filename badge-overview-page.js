(function () {
  // Some static exports of this page prune CSS rules for widgets that weren't
  // open at capture time, leaving classes like .d-inline-flex without their
  // styles. Re-declaring them here is harmless when the rules already exist
  // (identical values) and required when they don't. The Date-select
  // Calendar's own rules travel with it, in date-picker.js.
  var styleTag = document.createElement('style');
  styleTag.textContent =
    // The display pill was collapsed at capture time, so its utilities were
    // pruned too: without these it renders flat and unfilled instead of
    // matching the pill on the non-pressed export.
    // Scoped so this !important rule cannot outrank .sf-hidden/.hidden, which
    // is how the editor toggles the pill away when it opens.
    '.d-inline-flex:not(.hidden):not(.sf-hidden){display:inline-flex!important}' +
    '.py-1{padding-top:var(--space-1);padding-bottom:var(--space-1)}' +
    '.bg-bg-subtle{background-color:var(--bg-subtle)}' +
    '.ml-2{margin-left:var(--space-2)}' +
    // Overview calendar. It sits on a white card because the edit panel's own
    // grey would hide the month tint.
    '.overview-cal-edit{margin-top:10px}' +
    '.overview-cal-head{align-items:center;display:flex;flex-wrap:wrap;gap:4px 8px;margin-bottom:6px}' +
    '.overview-cal-range{color:var(--fg-3);font-size:11px;margin-right:auto}' +
    // View toggle uses the page's .segmented track; its button rules were
    // pruned from this export, so the buttons are styled here.
    '.overview-cal-view{display:inline-flex;padding:2px}' +
    '.overview-cal-view button{background:transparent;border:0;border-radius:var(--radius-pill);color:var(--fg-3);cursor:pointer;font-size:11px;font-weight:var(--weight-semibold);line-height:1;padding:4px 10px}' +
    '.overview-cal-view button[aria-pressed="true"]{background:var(--bg-surface);box-shadow:var(--shadow-xs);color:var(--fg-1)}' +
    '.overview-cal{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:8px;padding:2px 4px 4px;position:relative}' +
    // Change Dates button: centred over the calendar while it is hovered or the
    // button has keyboard focus. Styled like the Change Times link's .btn-icon;
    // the page's own .btn rules were pruned from this export.
    '.overview-cal-open{align-items:center;background:var(--bg-surface);border:1px solid var(--border-2);border-radius:var(--radius-pill);box-shadow:var(--shadow-md);display:inline-flex;font-size:12px;font-weight:var(--weight-semibold);gap:6px;left:50%;line-height:1;opacity:0;padding:7px 12px;pointer-events:none;position:absolute;text-decoration:none;top:50%;transform:translate(-50%,-50%);transition:opacity .12s ease,background-color .12s ease;white-space:nowrap}' +
    '.overview-cal-open:link,.overview-cal-open:visited{color:var(--fg-1)}' +
    '.overview-cal:hover .overview-cal-open,.overview-cal-open:focus-visible{opacity:1;pointer-events:auto}' +
    '.overview-cal-open:hover{background:var(--bg-subtle);text-decoration:none}' +
    '.overview-cal-open:focus-visible{box-shadow:var(--ring-focus),var(--shadow-md);outline:0}' +
    '.overview-cal-open svg{color:var(--fg-2);flex:none}' +
    '.overview-cal-grid{display:grid;grid-template-columns:26px repeat(7,minmax(26px,1fr));text-align:center}' +
    '.overview-cal-month{align-self:center;color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;text-transform:uppercase}' +
    '.overview-cal-d{align-items:center;display:flex;flex-direction:column;gap:2px;height:28px;justify-content:center}' +
    // Rows view: room for two lines of dots under the number.
    '.overview-cal[data-view="rows"] .overview-cal-d{height:34px;justify-content:flex-start;padding-top:3px}' +
    '.overview-cal-d.is-alt-month{background:var(--bg-offset)}' +
    '.overview-cal-num{align-items:center;border-radius:var(--radius-pill);color:var(--fg-1);display:inline-flex;font-size:11px;height:18px;justify-content:center;width:18px}' +
    '.overview-cal-d.is-out .overview-cal-num{color:var(--fg-3);opacity:.4}' +
    '.overview-cal-num.is-selected,.overview-cal-num.is-scheduled{background:var(--accent);color:var(--fg-on-accent);font-weight:var(--weight-semibold)}' +
    // contain:inline-size keeps a long run of dots from widening the edit panel;
    // they wrap inside the day's column instead.
    '.overview-cal-dots{align-self:stretch;contain:inline-size;display:flex;flex-wrap:wrap;gap:2px;justify-content:center;padding:0 2px}' +
    '.overview-cal-dot{border-radius:var(--radius-pill);display:inline-block;flex:none;height:4px;width:4px}' +
    // Same colours as the Type pills.
    '.overview-cal-dot--launch{background:var(--st-launch)}' +
    '.overview-cal-dot--challenge{background:var(--st-info)}' +
    '.overview-cal-dot--close{background:var(--st-close)}' +
    '.overview-cal-legend{color:var(--fg-3);display:flex;flex-wrap:wrap;font-size:11px;gap:4px 12px;justify-content:center;margin-top:6px}' +
    '.overview-cal-legend-item{align-items:center;display:inline-flex;gap:4px}' +
    '.overview-cal-empty{color:var(--fg-3);font-size:12px;margin:0;padding:12px 8px;text-align:center;white-space:normal}';
  document.head.appendChild(styleTag);

  var MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function isoDate(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); }
  function parseISO(iso) {
    var p = iso.split('-').map(Number);
    return { y: p[0], m: p[1] - 1, d: p[2] };
  }
  function formatShort(iso) { var p = parseISO(iso); return MONTH_SHORT[p.m] + ' ' + p.d + ', ' + p.y; }
  function formatMonthDay(iso) { var p = parseISO(iso); return MONTH_SHORT[p.m] + ' ' + p.d; }
  function addDaysISO(iso, n) {
    var p = parseISO(iso), d = new Date(p.y, p.m, p.d + n);
    return isoDate(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function weekdayIndex(iso) { var p = parseISO(iso); return new Date(p.y, p.m, p.d).getDay(); }

  var PENCIL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.8-6.29c.07-.25.2-.48.38-.66L14.06 5.17a2.5 2.5 0 0 1 3.54 0l1.23 1.23a2.5 2.5 0 0 1 0 3.54L9.96 19.82c-.18.18-.41.31-.66.38L3 21z"></path><path d="M12.75 7.5l3.75 3.75"></path></svg>';
  var CAL_SVG_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
  var X_SVG_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var X_SVG_18 = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var CHECK_SVG_18 = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function buildSaveCancelHTML() {
    return '' +
      '<button class="inline-date-action-btn inline-date-action-btn--save bg-transparent inline-flex items-center justify-center rounded-full border-0 p-0 cursor-pointer transition-opacity hover:opacity-80 text-[#28a745]" type="submit" data-tooltip="Save">' +
      CHECK_SVG_18 +
      '</button>' +
      '<span class="inline-date-action-btn inline-date-action-btn--cancel inline-flex items-center justify-center rounded-full border-0 p-0 cursor-pointer transition-opacity hover:opacity-80 text-[#6c757d]" data-action="click->inline-date-editor#cancel" data-tooltip="Cancel">' +
      X_SVG_18 +
      '</span>';
  }

  function buildDisplayPillHTML(pillText, modalIdParam) {
    return '' +
      '<div class="inline-flex items-center">' +
      '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-subtle border border-border-1 text-sm text-fg-1 cursor-pointer hover:bg-bg-offset" data-action="click->inline-date-editor#enterEditMode">' +
      CAL_SVG_14 +
      '<span class="pill-date-text">' + pillText + '</span>' +
      PENCIL_SVG +
      '</span>' +
      '<button type="button" class="btn-icon hover:no-underline shrink-0 ml-2" aria-label="Clear Start Date" data-tooltip="Clear Start Date" data-controller="modal" data-action="click->modal#open" data-modal-id-param="' + modalIdParam + '">' +
      X_SVG_14 +
      '</button>' +
      '</div>';
  }

  // Same icon, label and page as the Change Times link.
  var CLOCK_SVG_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 2.5"></path></svg>';
  var CHANGE_DATES_URL = 'change-dates.html';

  // change-dates-page.js reads these to fill its Start Date field and Quest
  // Delivery Days.
  function changeDatesURL(startISO, deliveryDays) {
    return CHANGE_DATES_URL + '?start_date=' + (startISO || '') + '&delivery_days=' + deliveryDays.join(',');
  }

  function buildOverviewCalendarHTML() {
    return '' +
      '<div class="overview-cal-edit pt-[10px] border-t border-[#e2e8f0]">' +
      '<div class="overview-cal-head">' +
      '<span class="block text-[11px] font-semibold text-[#374151] uppercase tracking-[0.5px]">Schedule</span>' +
      '<span class="overview-cal-range" data-overview-cal-target="range"></span>' +
      '<div class="segmented overview-cal-view" role="group" aria-label="Calendar view">' +
      '<button type="button" data-overview-cal-view="days" aria-pressed="true">Days</button>' +
      '<button type="button" data-overview-cal-view="rows" aria-pressed="false">Rows</button>' +
      '</div>' +
      '</div>' +
      '<div class="overview-cal" data-overview-cal-target="card">' +
      '<div class="overview-cal-grid" data-overview-cal-target="grid"></div>' +
      '<p class="overview-cal-empty" data-overview-cal-target="empty"></p>' +
      '<a class="overview-cal-open" data-overview-cal-target="open" href="' + CHANGE_DATES_URL + '">' + CLOCK_SVG_14 + 'Change Times &amp; Date</a>' +
      '</div>' +
      '<div class="overview-cal-legend" data-overview-cal-target="legend"></div>' +
      '</div>';
  }

  // Dot and legend order; labels match the Type pills.
  var ROW_TYPES = [
    { type: 'launch', label: 'Launch' },
    { type: 'challenge', label: 'Challenge' },
    { type: 'close', label: 'Close' }
  ];

  // Schedule rows on positive days, by date, counted from a Start Date and
  // Delivery Days that may not be saved yet:
  // { 'YYYY-MM-DD': { day: 3, types: ['launch', 'challenge', 'challenge'] } }
  function rowsByDate(schedule, settings) {
    var dateOfDay = {}, byDate = {};
    schedule.getRows().forEach(function (row) {
      if (!row.dueDate || !(row.scheduledDay > 0)) return;
      if (!(row.scheduledDay in dateOfDay)) dateOfDay[row.scheduledDay] = schedule.dateForScheduledDay(row.scheduledDay, settings);
      var date = dateOfDay[row.scheduledDay];
      if (!date) return;
      (byDate[date] || (byDate[date] = { day: row.scheduledDay, types: [] })).types.push(row.type);
    });
    return byDate;
  }

  // One run of weeks from the Start Date's week to the last scheduled day's
  // week, so a schedule crossing months never needs paging. The Days view fills
  // every scheduled day; the Rows view puts a dot under a day for each Schedule
  // row, coloured by type.
  function initOverviewCalendar(el, schedule) {
    var VIEW_KEY = 'journey-tracker-overview-calendar-view';
    var card = el.querySelector('[data-overview-cal-target="card"]');
    var grid = el.querySelector('[data-overview-cal-target="grid"]');
    var empty = el.querySelector('[data-overview-cal-target="empty"]');
    var range = el.querySelector('[data-overview-cal-target="range"]');
    var legend = el.querySelector('[data-overview-cal-target="legend"]');
    var open = el.querySelector('[data-overview-cal-target="open"]');
    var viewBtns = el.querySelectorAll('[data-overview-cal-view]');

    var view = 'days';
    try { if (localStorage.getItem(VIEW_KEY) === 'rows') view = 'rows'; } catch (e) {}
    var lastArgs = null; // the latest render's arguments, to redraw on a view change

    viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        view = btn.dataset.overviewCalView;
        try { localStorage.setItem(VIEW_KEY, view); } catch (err) {}
        if (lastArgs) render(lastArgs.startISO, lastArgs.deliveryDays);
      });
    });

    function span(className, text) {
      var s = document.createElement('span');
      s.className = className;
      if (text) s.textContent = text;
      return s;
    }

    function render(startISO, deliveryDays) {
      lastArgs = { startISO: startISO, deliveryDays: deliveryDays };
      card.dataset.view = view;
      viewBtns.forEach(function (btn) { btn.setAttribute('aria-pressed', String(btn.dataset.overviewCalView === view)); });

      var message = !startISO ? 'Pick a start date to see the schedule.'
        : !deliveryDays.length ? 'Pick a delivery day to see the schedule.' : '';
      empty.textContent = message;
      empty.style.display = message ? '' : 'none';
      grid.style.display = message ? 'none' : '';
      // Hidden with the message, which it would cover.
      open.style.display = message ? 'none' : '';
      open.href = changeDatesURL(startISO, deliveryDays);
      grid.innerHTML = '';
      range.textContent = '';
      legend.innerHTML = '';
      legend.style.display = 'none';
      if (message) return;

      var byDate = rowsByDate(schedule, { startDate: startISO, deliveryDays: deliveryDays });
      var typesShown = {};
      var lastISO = Object.keys(byDate).reduce(function (a, b) { return b > a ? b : a; }, startISO);
      range.textContent = formatMonthDay(startISO) + (lastISO > startISO ? ' – ' + formatMonthDay(lastISO) : '');

      var frag = document.createDocumentFragment();
      frag.appendChild(span('overview-cal-month'));
      ['S','M','T','W','T','F','S'].forEach(function (l) { frag.appendChild(span('cal-popup-dh', l)); });

      var start = parseISO(startISO);
      var firstISO = addDaysISO(startISO, -weekdayIndex(startISO));
      var endISO = addDaysISO(lastISO, 6 - weekdayIndex(lastISO));
      var labelledMonth = null;
      for (var iso = firstISO; iso <= endISO; iso = addDaysISO(iso, 1)) {
        var p = parseISO(iso);
        if (weekdayIndex(iso) === 0) {
          // The first week is labelled with the Start Date's month; later weeks
          // only when a new month begins within the range.
          var weekLast = addDaysISO(iso, 6);
          var month = iso === firstISO ? start.m : parseISO(weekLast < lastISO ? weekLast : lastISO).m;
          frag.appendChild(span('overview-cal-month', month !== labelledMonth ? MONTH_SHORT[month] : ''));
          labelledMonth = month;
        }
        // Every other month is tinted so a month change is visible mid-week.
        var monthOffset = (p.y - start.y) * 12 + p.m - start.m;
        var inRange = iso >= startISO && iso <= lastISO;
        var dayEl = span('overview-cal-d' + (monthOffset % 2 ? ' is-alt-month' : '') + (inRange ? '' : ' is-out'));
        dayEl.dataset.date = iso;
        var scheduled = byDate[iso];
        var numClass = iso === startISO ? ' is-selected' : view === 'days' && scheduled ? ' is-scheduled' : '';
        dayEl.appendChild(span('overview-cal-num' + numClass, String(p.d)));
        var tip = [];
        if (iso === startISO) tip.push('Start Date');
        if (scheduled) {
          tip.push('Day ' + scheduled.day + ': ' + scheduled.types.length + (scheduled.types.length === 1 ? ' row' : ' rows'));
          if (view === 'rows') {
            var dots = dayEl.appendChild(span('overview-cal-dots'));
            ROW_TYPES.forEach(function (t) {
              scheduled.types.forEach(function (type) {
                if (type !== t.type) return;
                dots.appendChild(span('overview-cal-dot overview-cal-dot--' + type));
                typesShown[type] = true;
              });
            });
          }
        }
        if (tip.length) dayEl.setAttribute('data-tooltip', tip.join(' · '));
        frag.appendChild(dayEl);
      }
      grid.appendChild(frag);

      ROW_TYPES.forEach(function (t) {
        if (!typesShown[t.type]) return;
        var item = span('overview-cal-legend-item');
        item.appendChild(span('overview-cal-dot overview-cal-dot--' + t.type));
        item.appendChild(document.createTextNode(t.label));
        legend.appendChild(item);
      });
      legend.style.display = legend.childNodes.length ? '' : 'none';
    }

    return { render: render };
  }

  function initInlineDateEditor(wrap) {
    var displayMode = wrap.querySelector('[data-inline-date-editor-target="displayMode"]');
    var editMode = wrap.querySelector('[data-inline-date-editor-target="editMode"]');
    var field = editMode.querySelector('[data-controller~="date-picker"]');
    var form = editMode.querySelector('[data-inline-date-editor-target="form"]');

    // Static export artifact: these structural wrappers may carry a leftover
    // "sf-hidden"/"hidden" class from whichever state was captured. Clear
    // only these known wrappers (never leaf elements like the chevron,
    // which is intentionally always hidden) so edit mode can render.
    [
      editMode.querySelector('[data-inline-date-editor-target="editPill"]'),
      editMode.querySelector('.inline-date-content'),
      form,
      editMode.querySelector('.badge-start-date-old-ui-form'),
      editMode.querySelector('.badge-start-date-old-ui-date-row'),
      field,
      field ? field.querySelector('.relative.w-full') : null
    ].forEach(function (el) { if (el) el.classList.remove('sf-hidden', 'hidden'); });

    if (!editMode.querySelector('[data-action*="inline-date-editor#cancel"]')) {
      field.insertAdjacentHTML('afterend', buildSaveCancelHTML());
    }
    var cancelBtn = editMode.querySelector('[data-action*="inline-date-editor#cancel"]');
    var dayCheckboxes = editMode.querySelectorAll('[data-inline-date-editor-target="dayCheckbox"]');

    // schedule-store.js owns the start date when it's loaded.
    var schedule = window.JourneySchedule;
    var originalISO = wrap.dataset.inlineDateEditorOriginalStartAtValue || null;
    var currentISO = schedule ? schedule.getStartDate() : originalISO;

    // The Overview calendar needs the store for row dates and Day numbers.
    var overviewCal = null;
    if (schedule) {
      if (!editMode.querySelector('.overview-cal-edit')) {
        editMode.querySelector('.badge-start-date-delivery-days-edit').insertAdjacentHTML('afterend', buildOverviewCalendarHTML());
      }
      overviewCal = initOverviewCalendar(editMode.querySelector('.overview-cal-edit'), schedule);
    }

    function checkedDeliveryDays() {
      return Array.prototype.filter.call(dayCheckboxes, function (box) { return box.checked; })
        .map(function (box) { return box.value; });
    }

    // Previews the editor's current choices, saved or not.
    function renderOverviewCalendar() {
      if (overviewCal) overviewCal.render(datePicker.getSelectedISO(), checkedDeliveryDays());
    }
    dayCheckboxes.forEach(function (box) { box.addEventListener('change', renderOverviewCalendar); });

    displayMode.innerHTML = buildDisplayPillHTML(currentISO ? formatShort(currentISO) : 'Pick a date', 'confirm_clear_start_date_modal');
    displayMode.querySelector('[data-action*="inline-date-editor#enterEditMode"]').addEventListener('click', function (e) {
      e.preventDefault();
      openEdit();
    });

    var datePicker = window.JourneyDatePicker.init(field, currentISO, renderOverviewCalendar);

    function openEdit() {
      datePicker.resetTo(currentISO);
      // Show the saved delivery days, discarding any change that was cancelled.
      if (schedule) {
        var days = schedule.getDeliveryDays();
        dayCheckboxes.forEach(function (box) { box.checked = days.indexOf(box.value) !== -1; });
      }
      renderOverviewCalendar();
      displayMode.classList.add('hidden', 'sf-hidden');
      editMode.classList.remove('hidden', 'sf-hidden');
    }

    function closeEdit() {
      datePicker.closePopup();
      editMode.classList.add('hidden', 'sf-hidden');
      displayMode.classList.remove('hidden', 'sf-hidden');
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        e.preventDefault();
        datePicker.resetTo(currentISO);
        closeEdit();
      });
    }

    // The static capture froze this widget mid-edit; always boot collapsed.
    closeEdit();

    function showStartDate() {
      displayMode.querySelector('.pill-date-text').textContent = currentISO ? formatShort(currentISO) : 'Pick a date';
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        currentISO = datePicker.getSelectedISO();
        showStartDate();
        closeEdit();
        if (schedule) {
          schedule.setSchedule({ startDate: currentISO, deliveryDays: checkedDeliveryDays() });
        }
      });
    }

    // Follow changes made outside this editor (e.g. the calendar view).
    if (schedule) {
      schedule.subscribe(function () {
        if (schedule.getStartDate() !== currentISO) {
          currentISO = schedule.getStartDate();
          showStartDate();
          datePicker.resetTo(currentISO);
        }
        renderOverviewCalendar();
      });
    }
  }

  document.querySelectorAll('[data-controller~="inline-date-editor"]').forEach(initInlineDateEditor);
})();

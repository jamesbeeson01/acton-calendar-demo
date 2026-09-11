(function () {
  // Some static exports of this page prune CSS rules for widgets that weren't
  // open at capture time (e.g. the calendar grid), leaving classes like
  // .cal-popup-grid without their styles. Re-declaring them here is harmless
  // when the rules already exist (identical values) and required when they don't.
  var styleTag = document.createElement('style');
  styleTag.textContent = '.cal-popup-h{justify-content:space-between}' +
    '.cal-popup-grid{display:grid;text-align:center}' +
    '.cal-popup-dh{color:var(--fg-3);font-size:10px;font-weight:var(--weight-semibold);letter-spacing:.05em;padding:var(--space-1) 0;text-transform:uppercase}' +
    '.cal-popup-d,.cal-popup-grid button{align-items:center;background:transparent;border:none;border-radius:var(--radius-pill);color:var(--fg-1);cursor:pointer;display:inline-flex;font-size:var(--text-sm);font-weight:var(--weight-regular);justify-content:center;margin:0 auto;position:relative;transition:background .1s ease;width:32px}' +
    '.cal-popup-d:hover,.cal-popup-grid button:hover{background:var(--bg-offset)}' +
    '.cal-popup-d.is-today,.cal-popup-grid button.is-today{color:var(--accent);font-weight:var(--weight-bold)}' +
    '.cal-popup-d.is-selected,.cal-popup-grid button.is-selected{background:var(--accent);color:var(--fg-on-accent);font-weight:var(--weight-semibold)}' +
    '.cal-popup-d.is-other,.cal-popup-grid button.is-other{color:var(--fg-3);opacity:.4}' +
    '.cal-popup-foot{align-items:center;border-top:1px solid var(--border-1);gap:var(--space-2)}' +
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
    '.overview-cal{background:var(--bg-surface);border:1px solid var(--border-1);border-radius:8px;padding:2px 4px 4px}' +
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

  var MONTH_LONG =['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function pad2(n) { return String(n).padStart(2, '0'); }
  function isoDate(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); }
  function isoToday() { var t = new Date(); return isoDate(t.getFullYear(), t.getMonth(), t.getDate()); }
  function parseISO(iso) {
    var p = iso.split('-').map(Number);
    return { y: p[0], m: p[1] - 1, d: p[2] };
  }
  function formatLong(iso) { var p = parseISO(iso); return MONTH_LONG[p.m] + ' ' + p.d + ', ' + p.y; }
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
  var CHEVRON_LEFT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>';
  var CHEVRON_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>';
  var CHEVRON_DOWN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>';
  var X_SVG_12 = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
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

  function buildDatePickerControlsHTML() {
    return '' +
      '<button type="button" class="input w-full inline-flex items-center gap-2 text-left cursor-pointer pr-9" data-action="date-picker#toggle" data-date-picker-target="btn">' +
      '<span class="text-fg-3 shrink-0 inline-flex">' + CAL_SVG_14 + '</span>' +
      '<span class="truncate text-fg-1" data-date-picker-target="label"></span>' +
      '</button>' +
      '<span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-fg-3 hidden sf-hidden" data-date-picker-target="chevron">' + CHEVRON_DOWN_SVG + '</span>' +
      '<button type="button" class="absolute inset-y-0 right-2.5 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer" data-action="date-picker#clear" data-date-picker-target="clearBtn" data-tooltip="Clear date" data-tooltip-position="bottom" aria-label="Clear date">' +
      '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-fg-3 hover:text-fg-1 hover:bg-bg-subtle transition-colors">' + X_SVG_12 + '</span>' +
      '</button>';
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

  function buildCalendarPopupHTML() {
    var navBtnClasses = 'inline-flex items-center justify-center h-9 w-9 rounded-full cursor-pointer hover:no-underline active:scale-[0.96] transition-[background-color,border-color,color,transform] duration-150 shrink-0 border-0 bg-accent text-fg-on-accent hover:text-fg-on-accent shadow-xs hover:bg-accent-hover';
    var todayBtnClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.1px] whitespace-nowrap leading-none border cursor-pointer no-underline hover:no-underline focus-visible:outline-none focus-visible:shadow-focus active:translate-y-px transition-[background-color,border-color,color,box-shadow] duration-150 disabled:bg-bg-offset disabled:text-fg-3 disabled:cursor-not-allowed disabled:shadow-none border-transparent bg-transparent text-fg-2 hover:bg-bg-subtle hover:text-fg-1 focus:text-fg-2 focus-visible:text-fg-2 active:text-fg-2 visited:text-fg-2 h-7 px-3 text-[12px]';
    return '' +
      '<div class="field mb-2" data-calendar-popup-target="typeField">' +
      '<input type="text" class="input w-full" placeholder="MM/DD/YYYY" autocomplete="off" aria-label="Type a date" data-calendar-popup-target="typeInput">' +
      '</div>' +
      '<div class="cal-popup-h" style="margin-bottom:4px;display:flex;align-items:center;gap:4px">' +
      '<button type="button" class="' + navBtnClasses + '" aria-label="Previous" data-cal-nav="prev">' + CHEVRON_LEFT_SVG + '</button>' +
      '<div style="flex:1;display:flex;gap:4px;justify-content:center">' +
      '<button type="button" class="px-1 text-base font-semibold text-fg-1 hover:text-accent transition-colors bg-transparent border-0 cursor-pointer" data-calendar-popup-target="monthBtn" aria-label="Pick month"></button>' +
      '<button type="button" class="px-1 text-base font-semibold text-fg-1 hover:text-accent transition-colors bg-transparent border-0 cursor-pointer" data-calendar-popup-target="yearBtn" aria-label="Pick year"></button>' +
      '</div>' +
      '<button type="button" class="' + navBtnClasses + '" aria-label="Next" data-cal-nav="next">' + CHEVRON_RIGHT_SVG + '</button>' +
      '</div>' +
      '<div data-calendar-popup-target="dowHeader" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;font-size:11px;margin-bottom:2px;text-align:center">' +
      ['S','M','T','W','T','F','S'].map(function (l) { return '<span class="cal-popup-dh">' + l + '</span>'; }).join('') +
      '</div>' +
      '<div class="cal-popup-grid" data-calendar-popup-target="grid" style="gap:1px;font-size:11px;grid-template-columns:repeat(7,1fr)"></div>' +
      '<div class="cal-popup-foot" style="margin-top:12px;padding-top:8px;display:flex;justify-content:flex-end">' +
      '<button class="' + todayBtnClasses + '" type="button" data-cal-today="1">Today</button>' +
      '</div>';
  }

  function initCalendarPopup(popupEl) {
    popupEl.innerHTML = buildCalendarPopupHTML();

    var state = {
      grid: popupEl.querySelector('[data-calendar-popup-target="grid"]'),
      dowHeader: popupEl.querySelector('[data-calendar-popup-target="dowHeader"]'),
      foot: popupEl.querySelector('.cal-popup-foot'),
      monthBtn: popupEl.querySelector('[data-calendar-popup-target="monthBtn"]'),
      yearBtn: popupEl.querySelector('[data-calendar-popup-target="yearBtn"]'),
      typeInput: popupEl.querySelector('[data-calendar-popup-target="typeInput"]'),
      mode: 'day',
      viewYear: null,
      viewMonth: null,
      selectedISO: popupEl.dataset.calendarPopupSelectedValue || null
    };

    if (state.selectedISO) {
      var p = parseISO(state.selectedISO);
      state.viewYear = p.y;
      state.viewMonth = p.m;
    } else {
      var t = new Date();
      state.viewYear = t.getFullYear();
      state.viewMonth = t.getMonth();
    }

    var onCommit = function () {};

    function makeDayCell(iso, label, extraClass, disabled) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cal-popup-d' + (extraClass ? ' ' + extraClass : '');
      b.style.cssText = 'aspect-ratio:unset;height:22px';
      if (iso) b.dataset.date = iso;
      if (disabled) b.disabled = true;
      b.textContent = label;
      return b;
    }

    function renderDayGrid() {
      state.mode = 'day';
      state.grid.style.gridTemplateColumns = 'repeat(7,1fr)';
      state.dowHeader.style.display = '';
      state.foot.style.display = '';
      state.grid.innerHTML = '';
      var year = state.viewYear, month = state.viewMonth;
      var firstDow = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var todayISO = isoToday();
      var frag = document.createDocumentFragment();
      var i;
      for (i = 0; i < firstDow; i++) frag.appendChild(makeDayCell(null, '', 'is-other', true));
      for (var d = 1; d <= daysInMonth; d++) {
        var iso = isoDate(year, month, d);
        var cls = '';
        if (iso === todayISO) cls += 'is-today';
        if (iso === state.selectedISO) cls += (cls ? ' ' : '') + 'is-selected';
        frag.appendChild(makeDayCell(iso, String(d), cls, false));
      }
      var totalCells = firstDow + daysInMonth;
      var trailing = (7 - (totalCells % 7)) % 7;
      for (i = 0; i < trailing; i++) frag.appendChild(makeDayCell(null, '', 'is-other', true));
      state.grid.appendChild(frag);
      state.monthBtn.textContent = MONTH_LONG[month];
      state.yearBtn.textContent = String(year);
    }

    function renderMonthPicker() {
      state.mode = 'month';
      state.grid.style.gridTemplateColumns = 'repeat(4,1fr)';
      state.dowHeader.style.display = 'none';
      state.foot.style.display = 'none';
      state.grid.innerHTML = '';
      var frag = document.createDocumentFragment();
      MONTH_SHORT.forEach(function (name, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cal-popup-d' + (idx === state.viewMonth ? ' is-selected' : '');
        b.style.cssText = 'aspect-ratio:unset;height:32px';
        b.dataset.pick = 'month';
        b.dataset.value = idx;
        b.textContent = name;
        frag.appendChild(b);
      });
      state.grid.appendChild(frag);
      state.monthBtn.textContent = MONTH_LONG[state.viewMonth];
      state.yearBtn.textContent = String(state.viewYear);
    }

    function renderYearPicker() {
      state.mode = 'year';
      state.grid.style.gridTemplateColumns = 'repeat(4,1fr)';
      state.dowHeader.style.display = 'none';
      state.foot.style.display = 'none';
      state.grid.innerHTML = '';
      var startYear = state.viewYear - 5;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < 12; i++) {
        var y = startYear + i;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cal-popup-d' + (y === state.viewYear ? ' is-selected' : '');
        b.style.cssText = 'aspect-ratio:unset;height:32px';
        b.dataset.pick = 'year';
        b.dataset.value = y;
        b.textContent = y;
        frag.appendChild(b);
      }
      state.grid.appendChild(frag);
      state.monthBtn.textContent = MONTH_LONG[state.viewMonth];
      state.yearBtn.textContent = String(state.viewYear);
    }

    function goPrev() {
      if (state.mode === 'year') { state.viewYear -= 12; renderYearPicker(); }
      else if (state.mode === 'month') { state.viewYear -= 1; renderMonthPicker(); }
      else {
        state.viewMonth--;
        if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
        renderDayGrid();
      }
    }
    function goNext() {
      if (state.mode === 'year') { state.viewYear += 12; renderYearPicker(); }
      else if (state.mode === 'month') { state.viewYear += 1; renderMonthPicker(); }
      else {
        state.viewMonth++;
        if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
        renderDayGrid();
      }
    }

    popupEl.querySelector('[data-cal-nav="prev"]').addEventListener('click', function (e) { e.preventDefault(); goPrev(); });
    popupEl.querySelector('[data-cal-nav="next"]').addEventListener('click', function (e) { e.preventDefault(); goNext(); });
    state.monthBtn.addEventListener('click', function (e) { e.preventDefault(); renderMonthPicker(); });
    state.yearBtn.addEventListener('click', function (e) { e.preventDefault(); renderYearPicker(); });
    popupEl.querySelector('[data-cal-today="1"]').addEventListener('click', function (e) {
      e.preventDefault();
      commitISO(isoToday());
    });

    state.grid.addEventListener('click', function (e) {
      var pickBtn = e.target.closest('[data-pick]');
      if (pickBtn) {
        if (pickBtn.dataset.pick === 'month') state.viewMonth = parseInt(pickBtn.dataset.value, 10);
        else state.viewYear = parseInt(pickBtn.dataset.value, 10);
        renderDayGrid();
        return;
      }
      var dayBtn = e.target.closest('[data-date]');
      if (dayBtn && !dayBtn.disabled) commitISO(dayBtn.dataset.date);
    });

    state.typeInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(state.typeInput.value.trim());
      if (!m) return;
      var mo = parseInt(m[1], 10) - 1, da = parseInt(m[2], 10), yr = parseInt(m[3], 10);
      var test = new Date(yr, mo, da);
      if (test.getFullYear() !== yr || test.getMonth() !== mo || test.getDate() !== da) return;
      commitISO(isoDate(yr, mo, da));
    });

    function commitISO(iso) {
      state.selectedISO = iso;
      var p = parseISO(iso);
      state.viewYear = p.y;
      state.viewMonth = p.m;
      popupEl.dataset.calendarPopupSelectedValue = iso;
      state.typeInput.value = '';
      onCommit(iso);
      close();
    }

    var anchorEl = null;

    function isOpen() { return popupEl.style.display !== 'none'; }
    function open(anchor) {
      anchorEl = anchor;
      if (state.selectedISO) {
        var p = parseISO(state.selectedISO);
        state.viewYear = p.y;
        state.viewMonth = p.m;
      } else {
        var t = new Date();
        state.viewYear = t.getFullYear();
        state.viewMonth = t.getMonth();
      }
      renderDayGrid();
      var rect = anchor.getBoundingClientRect();
      popupEl.style.left = Math.round(rect.left) + 'px';
      popupEl.style.top = Math.round(rect.bottom + 6) + 'px';
      popupEl.style.display = 'block';
    }
    function close() {
      if (state.mode !== 'day') renderDayGrid();
      popupEl.style.display = 'none';
    }
    function setSelected(iso) {
      state.selectedISO = iso;
      if (iso) { popupEl.dataset.calendarPopupSelectedValue = iso; }
      else { popupEl.removeAttribute('data-calendar-popup-selected-value'); }
      if (state.mode === 'day') renderDayGrid();
    }

    renderDayGrid();

    return {
      open: open,
      close: close,
      isOpen: isOpen,
      setSelected: setSelected,
      setOnCommit: function (fn) { onCommit = fn; },
      getAnchor: function () { return anchorEl; }
    };
  }

  function initDatePicker(field, wrap, getCurrentISO, onChange) {
    var popupId = field.dataset.datePickerPopupIdValue;
    var popupEl = document.getElementById(popupId);
    var placeholder = field.dataset.datePickerPlaceholderValue || 'Pick a date';

    if (!field.querySelector('[data-action*="date-picker#toggle"]')) {
      popupEl.insertAdjacentHTML('beforebegin', buildDatePickerControlsHTML());
    }
    var toggleBtn = field.querySelector('[data-action*="date-picker#toggle"]');
    var clearBtn = field.querySelector('[data-action*="date-picker#clear"]');
    var labelEl = field.querySelector('[data-date-picker-target="label"]');

    var selectedISO = getCurrentISO();
    labelEl.textContent = selectedISO ? formatLong(selectedISO) : placeholder;
    var api = initCalendarPopup(popupEl);
    api.setOnCommit(function (iso) {
      selectedISO = iso;
      labelEl.textContent = formatLong(iso);
      onChange();
    });

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (api.isOpen()) api.close();
      else api.open(toggleBtn);
    });

    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      selectedISO = null;
      labelEl.textContent = placeholder;
      api.setSelected(null);
      api.close();
      onChange();
    });

    document.addEventListener('click', function (e) {
      if (!api.isOpen()) return;
      if (popupEl.contains(e.target)) return;
      if (toggleBtn.contains(e.target)) return;
      api.close();
    });

    if (api.isOpen()) api.open(toggleBtn);

    return {
      getSelectedISO: function () { return selectedISO; },
      resetTo: function (iso) {
        selectedISO = iso;
        labelEl.textContent = iso ? formatLong(iso) : placeholder;
        api.setSelected(iso);
        api.close();
      },
      closePopup: function () { api.close(); },
      isPopupOpen: api.isOpen,
      popupEl: popupEl,
      toggleBtn: toggleBtn
    };
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

    var datePicker = initDatePicker(field, wrap, function () { return currentISO; }, renderOverviewCalendar);

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

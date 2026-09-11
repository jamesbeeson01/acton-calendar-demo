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
    '.ml-2{margin-left:var(--space-2)}';
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

  function initDatePicker(field, wrap, getCurrentISO) {
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

    var originalISO = wrap.dataset.inlineDateEditorOriginalStartAtValue || null;
    var currentISO = originalISO;

    displayMode.innerHTML = buildDisplayPillHTML(currentISO ? formatShort(currentISO) : 'Pick a date', 'confirm_clear_start_date_modal');
    displayMode.querySelector('[data-action*="inline-date-editor#enterEditMode"]').addEventListener('click', function (e) {
      e.preventDefault();
      openEdit();
    });

    var datePicker = initDatePicker(field, wrap, function () { return currentISO; });

    function openEdit() {
      datePicker.resetTo(currentISO);
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

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        currentISO = datePicker.getSelectedISO();
        displayMode.querySelector('.pill-date-text').textContent = currentISO ? formatShort(currentISO) : 'Pick a date';
        closeEdit();
      });
    }
  }

  document.querySelectorAll('[data-controller~="inline-date-editor"]').forEach(initInlineDateEditor);
})();

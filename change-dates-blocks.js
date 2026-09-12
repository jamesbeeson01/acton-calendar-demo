(function () {
  // Two things that sit around the Blocks on Change Dates:
  //
  //   Block actions      Save and Cancel at the bottom of every Block. Cancel
  //                      puts that Block back to how it was when the page
  //                      loaded or the Block was last saved; Save takes that
  //                      mark again. Nothing leaves the page either way: the
  //                      form's own Save at the bottom is still what submits.
  //   Reset to defaults  A red Block under the Time groups that drops every
  //                      change and restores the badge's intended original
  //                      schedule, with Week 6 and BONUS unscheduled. This is
  //                      not the calendar's Reset dates button, which only
  //                      undoes the changes made in this session.

  var schedule = window.JourneySchedule;
  var body = document.getElementById('bulk-time-change-body');
  if (!schedule || !body) return;

  // The page's own button classes, so these match the form's Save and Cancel.
  var BTN_BASE = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.1px] whitespace-nowrap leading-none border cursor-pointer no-underline hover:no-underline focus-visible:outline-none focus-visible:shadow-focus active:translate-y-px transition-[background-color,border-color,color,box-shadow] duration-150 disabled:bg-bg-offset disabled:text-fg-3 disabled:cursor-not-allowed disabled:shadow-none ';
  var BTN_OUTLINE = BTN_BASE + 'bg-bg-surface text-fg-1 hover:text-fg-1 focus:text-fg-1 focus-visible:text-fg-1 active:text-fg-1 visited:text-fg-1 border-border-2 shadow-xs hover:bg-bg-subtle hover:border-border-3 h-7 px-3 text-[12px]';
  var BTN_ACCENT = BTN_BASE + 'border-transparent bg-accent text-fg-on-accent hover:text-fg-on-accent focus:text-fg-on-accent focus-visible:text-fg-on-accent active:text-fg-on-accent visited:text-fg-on-accent shadow-xs hover:bg-accent-hover h-7 px-3 text-[12px]';
  var BTN_DANGER = BTN_BASE + 'block-danger-btn border-transparent shadow-xs h-9 px-4 text-[13px]';

  // ---- Styles ----------------------------------------------------------------

  // The page has no rule for a danger button or for the confirm's card, so
  // both are drawn here from the same tokens the rest of the page uses.
  var styleTag = document.createElement('style');
  styleTag.textContent =
    '.block-actions{align-items:center;border-top:1px solid var(--border-1);display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px}' +
    '.block-actions-note{color:var(--fg-3);font-size:11px;margin-right:auto}' +
    '.block-actions-note.is-saved{color:var(--st-success)}' +
    '.reset-block{background:var(--st-overdue-soft);border:1px solid var(--st-overdue-ring)}' +
    '.reset-block .form-label{color:var(--st-overdue)}' +
    '.reset-block .input-explanation{margin:0 0 12px}' +
    '.block-danger-btn{background:var(--st-overdue);color:#fff}' +
    '.block-danger-btn:hover,.block-danger-btn:focus,.block-danger-btn:visited{color:#fff;filter:brightness(.94)}' +
    '.block-confirm .modal{background:var(--bg-surface);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);max-width:460px;padding:20px;width:100%}' +
    // This copy of the page has no whitespace-pre-line rule, so the blank line
    // before the reminder about Save would otherwise collapse.
    '.block-confirm [data-jt-confirm-role="message"]{white-space:pre-line}' +
    '.block-confirm [data-jt-confirm-variant="danger"]{background:var(--st-overdue);border-color:transparent;color:#fff}' +
    '.block-confirm [data-jt-confirm-variant="danger"]:hover{filter:brightness(.94)}';
  document.head.appendChild(styleTag);

  // ---- Confirm ---------------------------------------------------------------

  // Built from the page's own confirm template so it looks like every other
  // "Are you sure?" in Journey Tracker.
  function confirmDialog(opts, onConfirm) {
    var template = document.getElementById('jt-global-confirm-template');
    if (!template) { onConfirm(); return; }
    var node = template.content.firstElementChild.cloneNode(true);
    node.classList.add('block-confirm');
    node.querySelector('[data-jt-confirm-role="title"]').textContent = opts.title;
    node.querySelector('[data-jt-confirm-role="message"]').textContent = opts.message;
    node.querySelectorAll('[data-jt-confirm-role="confirm"]').forEach(function (btn) {
      if (btn.dataset.jtConfirmVariant !== opts.variant) btn.remove();
      else btn.textContent = opts.confirmLabel;
    });

    function close() {
      document.removeEventListener('keydown', onKey);
      node.remove();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    node.addEventListener('click', function (e) {
      if (e.target === node || e.target.closest('[data-jt-confirm-role="cancel"]')) { close(); return; }
      if (e.target.closest('[data-jt-confirm-role="confirm"]')) { close(); onConfirm(); }
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(node);
    node.querySelector('[data-jt-confirm-role="confirm"]').focus();
  }

  // ---- Reset to defaults Block -----------------------------------------------

  function addResetBlock() {
    var formContainer = document.getElementById('change-time-form-container');
    if (!formContainer) return;
    var block = document.createElement('div');
    block.id = 'reset-defaults-block';
    block.className = 'reset-block rounded-xl mb-4 p-4';
    block.innerHTML =
      '<label class="form-label">Reset to Defaults</label>' +
      '<div class="input-explanation">' +
      'Puts the whole schedule back to this badge&rsquo;s original dates and times. ' +
      'Week 6 and BONUS challenges go back to unscheduled. This is not the calendar&rsquo;s ' +
      'Reset dates button, which only undoes the changes made here since the page loaded.' +
      '</div>' +
      '<div class="flex justify-end">' +
      '<button class="' + BTN_DANGER + '" type="button" data-reset-defaults>Reset to Defaults</button>' +
      '</div>';
    formContainer.parentNode.insertBefore(block, formContainer);
  }

  function resetToDefaults() {
    confirmDialog({
      title: 'Reset to Defaults?',
      message: 'Every date and time goes back to this badge’s original schedule, and the ' +
        'Week 6 and BONUS challenges become unscheduled again. Everything changed on this ' +
        'page is dropped.\n\n' +
        'This does not save on its own — you still need to hit Save at the bottom of the page.',
      variant: 'danger',
      confirmLabel: 'Reset to Defaults'
    }, function () { schedule.resetToDefaults(); });
  }

  // ---- Block actions ---------------------------------------------------------

  // A Block's kind decides what its Cancel puts back, on top of the form
  // fields inside it: the first Block owns the schedule settings, the calendar
  // owns every row's date, and a Time group owns its own rows' times.
  function kindOf(el) {
    if (el.id === 'dates-calendar') return 'calendar';
    if (el.classList.contains('time-group-section')) return 'time';
    return 'settings';
  }

  function footerHTML(kind) {
    return '<div class="block-actions" data-block-actions="' + kind + '">' +
      '<span class="block-actions-note" data-block-note></span>' +
      '<button class="' + BTN_OUTLINE + '" type="button" data-block-action="cancel">Cancel</button>' +
      '<button class="' + BTN_ACCENT + '" type="button" data-block-action="save">Save</button>' +
      '</div>';
  }

  var blocks = [];

  // The Date-select Calendar's Type-in box sits inside the first Block but is
  // the picker's own scratch field, not one of the Block's: what it commits
  // reaches the Block through the Schedule store like any other date change.
  function fields(el) {
    return Array.prototype.filter.call(el.querySelectorAll('input, select, textarea'),
      function (f) { return !f.closest('.cal-popup'); });
  }
  function readFields(el) {
    return fields(el).map(function (f) {
      return f.type === 'checkbox' || f.type === 'radio' ? f.checked : f.value;
    });
  }
  function writeFields(el, values) {
    fields(el).forEach(function (f, i) {
      if (i >= values.length) return;
      if (f.type === 'checkbox' || f.type === 'radio') f.checked = values[i];
      else f.value = values[i];
    });
  }

  function readStore(block) {
    if (block.kind === 'settings') {
      return { startDate: schedule.getStartDate(), deliveryDays: schedule.getDeliveryDays() };
    }
    return block.rowIds.map(function (id) {
      var row = schedule.getRow(id);
      return block.kind === 'calendar' ?
        { id: id, dueDate: row.dueDate, scheduledDay: row.scheduledDay } :
        { id: id, dueTime: row.dueTime };
    });
  }

  function writeStore(block, base) {
    if (block.kind === 'settings') {
      var now = readStore(block);
      if (now.startDate === base.startDate && now.deliveryDays.join() === base.deliveryDays.join()) return;
      schedule.setSchedule({ startDate: base.startDate, deliveryDays: base.deliveryDays });
      return;
    }
    var changes = base.filter(function (was) {
      var row = schedule.getRow(was.id);
      if (!row) return false;
      // A row that had no time was unscheduled: its date, not its time, is
      // what the calendar Block puts back.
      if (block.kind === 'time') return was.dueTime !== null && row.dueTime !== was.dueTime;
      return row.dueDate !== was.dueDate;
    });
    if (changes.length) schedule.updateRows(changes);
  }

  function snapshot(block) { return { fields: readFields(block.el), store: readStore(block) }; }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  function footerOf(block) { return block.el.querySelector('[data-block-actions]'); }

  function refresh(block) {
    var footer = footerOf(block);
    if (!footer) return;
    var dirty = !same(snapshot(block), block.base);
    footer.querySelectorAll('[data-block-action]').forEach(function (btn) { btn.disabled = !dirty; });
    var note = footer.querySelector('[data-block-note]');
    if (!block.saved) note.textContent = dirty ? 'Not saved yet' : '';
  }

  function refreshAll() { blocks.forEach(refresh); }

  function saveBlock(block) {
    block.base = snapshot(block);
    var note = footerOf(block).querySelector('[data-block-note]');
    note.textContent = 'Saved. The page’s Save at the bottom still submits the badge.';
    note.classList.add('is-saved');
    block.saved = true;
    clearTimeout(block.timer);
    block.timer = setTimeout(function () {
      block.saved = false;
      note.classList.remove('is-saved');
      refresh(block);
    }, 4000);
    refresh(block);
  }

  function cancelBlock(block) {
    writeStore(block, block.base.store);
    writeFields(block.el, block.base.fields);
    block.saved = false;
    var note = footerOf(block).querySelector('[data-block-note]');
    note.classList.remove('is-saved');
    note.textContent = '';
    refreshAll();
  }

  // A Time group's rows are the Schedule rows inside it; the calendar's are
  // every row, because a drag there can move any of them.
  function rowsOf(el, kind) {
    if (kind === 'settings') return [];
    if (kind === 'calendar') return schedule.getRows().map(function (row) { return row.id; });
    return Array.prototype.map.call(el.querySelectorAll('article.cl-row'), function (a) { return a.id; });
  }

  function addBlocks() {
    body.querySelectorAll('.rounded-xl.border-border-1').forEach(function (el) {
      var kind = kindOf(el);
      var block = { el: el, kind: kind, rowIds: rowsOf(el, kind), saved: false, timer: null };
      // The calendar rewrites its own contents, so it draws the footer itself
      // from footerHTML; every other Block gets one appended once.
      if (!footerOf(block)) el.insertAdjacentHTML('beforeend', footerHTML(kind));
      block.base = snapshot(block);
      blocks.push(block);
    });
  }

  // ---- Wiring ----------------------------------------------------------------

  addResetBlock();
  addBlocks();
  refreshAll();

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-block-action]');
    var block = btn && blocks.filter(function (b) { return b.el.contains(btn); })[0];
    if (e.target.closest('[data-reset-defaults]')) resetToDefaults();
    else if (block && btn.dataset.blockAction === 'save') saveBlock(block);
    else if (block) cancelBlock(block);
    // The calendar redraws its footer on a Version or tool click, so the
    // buttons it just drew need their state back.
    setTimeout(refreshAll, 0);
  });

  document.addEventListener('change', refreshAll);
  schedule.subscribe(refreshAll);

  window.JourneyBlockActions = { footerHTML: footerHTML };
})();

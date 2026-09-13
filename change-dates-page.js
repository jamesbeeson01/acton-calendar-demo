(function () {
  // The Start Date field and Quest Delivery Days at the top of the first
  // Block, and the Prefill parameters that fill them on load.
  //
  // The pair works like the Start Date editor's Date field and Delivery Days
  // checkboxes on Badge Overview: the same Date-select Calendar opens under
  // the field (date-picker.js draws both), and a change is a preview rather
  // than a submit. What the preview is differs. The editor previews into its
  // own Overview calendar and only touches the Schedule store on its Save;
  // here the Change Dates calendar and the Time groups below it are the
  // preview, and both are rendered from the store, so a change goes straight
  // into the store and the Block Cancel above the Time groups is what puts it
  // back. Nothing is submitted either way: the form's Save at the bottom of
  // the page still does that.

  var WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  var DELIVERY_DAY_SELECTOR = 'input[type="checkbox"][name$="[delivery_days][]"]';

  var params = new URLSearchParams(window.location.search);
  var form = document.getElementById('day-schedule-form');
  if (!form) return;

  var field = form.querySelector('[data-controller~="date-picker"]');
  var popup = field && document.getElementById(field.dataset.datePickerPopupIdValue);

  function parseRealDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var p = iso.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    if (d.getFullYear() !== p[0] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[2]) return null;
    return { y: p[0], m: p[1] - 1, d: p[2] };
  }

  // ---- Prefill ---------------------------------------------------------------

  // The Overview calendar's Change Dates button opens this page with the Start
  // Date editor's choices, saved or not:
  //   ?start_date=YYYY-MM-DD&delivery_days=monday,tuesday
  // They are applied like a change made in the two fields, once the page has
  // loaded (see the end of this file), so the Change Dates calendar and the
  // Time groups show them straight away.
  var prefill = {};

  // Start Date field. An empty value clears it; an invalid one is ignored.
  if (params.has('start_date')) {
    var startISO = params.get('start_date');
    if (parseRealDate(startISO)) prefill.startDate = startISO;
    else if (startISO === '') prefill.startDate = null;
  }

  // Quest Delivery Days. Unknown names are dropped; days are kept in week order.
  if (params.has('delivery_days')) {
    var requested = params.get('delivery_days').split(',');
    prefill.deliveryDays = WEEKDAYS.filter(function (d) { return requested.indexOf(d) !== -1; });
  }

  // ---- Into the store --------------------------------------------------------

  var schedule = window.JourneySchedule;
  if (!schedule || !field || !window.JourneyDatePicker) return;

  var dayCheckboxes = document.querySelectorAll(DELIVERY_DAY_SELECTOR);

  function checkedDeliveryDays() {
    return Array.prototype.filter.call(dayCheckboxes, function (box) { return box.checked; })
      .map(function (box) { return box.value; });
  }

  // Both fields go in together, the way the Start Date editor's Save sends
  // both.
  function applySettings() {
    schedule.setSchedule({ startDate: datePicker.getSelectedISO(), deliveryDays: checkedDeliveryDays() });
  }

  var selectedISO = (popup && popup.getAttribute('data-calendar-popup-selected-value')) || null;
  var datePicker = window.JourneyDatePicker.init(field, selectedISO, applySettings);

  dayCheckboxes.forEach(function (box) { box.addEventListener('change', applySettings); });

  // Follow changes made outside these two fields — a drag on the calendar, a
  // Block Cancel, Reset dates or Reset to Defaults. The store rewrites the
  // field's own label and the popup's selected date; the Date-select Calendar
  // keeps its own copy, so it is put back here.
  schedule.subscribe(function () {
    if (schedule.getStartDate() !== datePicker.getSelectedISO()) datePicker.resetTo(schedule.getStartDate());
  });

  // The Prefill parameters go into the store after every script on the page
  // has run, so the Blocks take their Block Cancel mark from the schedule as
  // it was saved: the prefill is an ordinary unsaved change to the first
  // Block, which its Block Cancel or Undo takes back. The store rewrites both
  // fields and the calendar redraws from its change.
  if ('startDate' in prefill || 'deliveryDays' in prefill) {
    document.addEventListener('DOMContentLoaded', function () { schedule.setSchedule(prefill); });
  }
})();

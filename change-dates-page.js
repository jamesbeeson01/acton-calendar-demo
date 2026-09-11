(function () {
  // The Overview calendar's Change Dates button opens this page with the Start
  // Date editor's choices, saved or not:
  //   ?start_date=YYYY-MM-DD&delivery_days=monday,tuesday
  // They fill the Start Date field and Quest Delivery Days like form defaults.
  // Nothing is saved: the Schedule store and every row's date stay as they
  // were, and the store rewrites these fields on its next change.

  var MONTH_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  var params = new URLSearchParams(window.location.search);
  var form = document.getElementById('day-schedule-form');
  if (!form) return;

  function parseRealDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var p = iso.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    if (d.getFullYear() !== p[0] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[2]) return null;
    return { y: p[0], m: p[1] - 1, d: p[2] };
  }

  // Start Date field. An empty value clears it; an invalid one is ignored.
  if (params.has('start_date')) {
    var startISO = params.get('start_date');
    var start = parseRealDate(startISO);
    var field = form.querySelector('[data-controller~="date-picker"]');
    if (field && (start || startISO === '')) {
      var label = field.querySelector('[data-date-picker-target="label"]');
      var popup = document.getElementById(field.dataset.datePickerPopupIdValue);
      if (label) label.textContent = start ? MONTH_LONG[start.m] + ' ' + start.d + ', ' + start.y : field.dataset.datePickerPlaceholderValue;
      if (popup) popup.setAttribute('data-calendar-popup-selected-value', startISO);
    }
  }

  // Quest Delivery Days. Unknown names are dropped; days are kept in week order.
  if (params.has('delivery_days')) {
    var requested = params.get('delivery_days').split(',');
    var days = WEEKDAYS.filter(function (d) { return requested.indexOf(d) !== -1; });
    form.setAttribute('data-selected-delivery-days', JSON.stringify(days));
    document.querySelectorAll('input[type="checkbox"][name$="[delivery_days][]"]').forEach(function (box) {
      box.checked = days.indexOf(box.value) !== -1;
    });
  }
})();

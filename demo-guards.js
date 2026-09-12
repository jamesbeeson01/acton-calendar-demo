(function () {
  // Both pages are captures of the live app, so they still carry its own
  // forms and links: the form's Save at the bottom of Change Dates posts to
  // /schools/.../bulk_time_change, the Share and theme buttons post too, and
  // every nav, logo and Cancel link points at journey.actonacademy.org.
  // None of them belong to the prototype. Wherever the files are served from
  // they would only navigate away and lose the page, but served from the real
  // origin they would reach the real endpoints, so they are stopped here
  // instead of being relied on to 404.
  //
  // The prototype's own saves are untouched: everything it changes lives in
  // the Schedule store's localStorage entry (schedule-store.js) and nothing in
  // it makes a request. The Start Date editor's Save button is a submit inside
  // the live app's form, so its handler in badge-overview-page.js still runs —
  // preventing the default submit doesn't stop the listeners that follow.

  var LIVE_HOST = 'journey.actonacademy.org';

  function blocked(what) {
    if (window.console && console.info) console.info('[demo] ' + what + ' blocked: this is a prototype, nothing is sent.');
  }

  // Capture phase, so the default is gone before any page handler decides
  // what to do with the event.
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    blocked('form submit');
  }, true);

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link || link.hostname !== LIVE_HOST) return;
    e.preventDefault();
    blocked('link to ' + LIVE_HOST);
  }, true);
})();

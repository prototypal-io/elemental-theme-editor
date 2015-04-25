// Actual Bookmarklet that loads this file:
//
// javascript: (function() {
//   var s = document.createElement('script');
//   s.src = '//ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
//   document.body.appendChild(s);
// }());

// for now just put all this in the bookmark location :)

// javascript:

(function() {
  var url = 'http://localhost:5555';
  var themeEditorWindow = window.open(url);
  var script = document.createElement('script');
  script.src = url + '/elemental-actions.js';

  document.body.appendChild(script);

  window.addEventListener('message', receiveMessage, false);

  function receiveMessage(event) {
    if (event.data === 'reloadCSS') {
      Elemental.reloadCSS();
    }
  }


})();

// What the actual Bookmarklet will look like:
//
// javascript: (function() {
//   var s = document.createElement('script');
//   s.src = '//ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
//   document.body.appendChild(s);
// }());

// for now just put all this in the bookmark location :)

// NOTE: firefox doesn't like minified js bookmarklets

// javascript:
(function() {
  var url = 'http://localhost:5555';
  var themeEditorWindow;

  window.addEventListener('message', receiveMessage, false);
  var script = document.createElement('script');
  script.src = url + '/elemental-actions.js';
  document.body.appendChild(script);

  themeEditorWindow = window.open(url, "elemental-theme-editor", "width=550,height=400,scrollbars=yes,status=1");
  window._openedWindow = themeEditorWindow;

  function receiveMessage(event) {
    var message = JSON.parse(event.data),
        action = message.action,
        port,
        response;
    if (action === 'ete-port-setup') {
      port = event.ports[0];
      if (Elemental) {
        Elemental._port = port;
      } else {
        window.Elemental = { _port: port };
      }

      port.onmessage = function(event) {
        var message = event.data;
        window.Elemental.send(message.action, message.data);
      };

      response = { action: 'ete-port-setup-complete', data: window.location.origin };
      port.postMessage(response);
    }
  }
})();

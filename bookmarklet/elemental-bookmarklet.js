// Actual Bookmarklet that loads this file:
//
// javascript: (function() {
//   var s = document.createElement('script');
//   s.src = '//ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
//   document.body.appendChild(s);
// }());

// for now just put all this in the bookmark location :)


// firefox doesn't like minified js bookmarklets
// javascript:

// idea:
// var link = document.createElement('link');
// link.rel ='stylesheet';
// link.type = 'text/css';
// link.href = url + '/elemental-styles.css';
// document.head.appendChild(link);

// var Elemental = window.Elemental;
// if (Elemental) { Elemental.send(action); }

// TODO: you should be able to serve this from the ember-cli addon via express? or use a known URL

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
        port;
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
      }
    }
  }
})();

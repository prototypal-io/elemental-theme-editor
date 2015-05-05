(function(global) {
  global.addEventListener('message', function(event) {
    var port, action
    console.log(event);
    if (event.data.action === 'elemental-actions-setup') {
      port = event.ports[0];
      listenToPort(port);
    }
  });

  function listenToPort(port) {
    port.postMessage({ action: 'portSetupComplete' });
    // Listens to messages coming directly from background script
    chrome.runtime.onMessage.addListener(function(message, sender) {
      if (message.from === 'devtools') {
        port.postMessage(message);
      }
    });

    // Listens for messages coming from elemental-actions.js
    // and sends them to the background script with the current tabId
    port.onmessage = function(event) {
      var message = event.data;
      message.from = 'elemental-actions';
      chrome.runtime.sendMessage(message);
    };
  }
})(window);

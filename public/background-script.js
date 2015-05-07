(function(global) {
  var connections = {};

  chrome.runtime.onConnect.addListener(function (port) {

    function extensionListener(message, sender, sendResponse) {
      // The original connection event doesn't include the tab ID of the
      // DevTools page, so we need to send it explicitly.
      if (message.name == "el-bs-init") {
        connections[message.tabId] = port;
        // when background script receives init from DT,
        // set up post message listening on CS
        chrome.tabs.sendMessage(message.tabId, { from: 'devtools', action: 'el-cs-init' });
      }

    	// other message handling
    }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
      port.onMessage.removeListener(extensionListener);

      var tabs = Object.keys(connections);
      for (var i = 0, l = tabs.length; i < l; i++) {
        var tabId = tabs[i];
        if (connections[tabId] === port) {
          connections[tabId] = undefined;
          break;
        }
      }
    });
  });

  // Receive message from content script and relay to the devTools page for the
  // current tab
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Messages from content scripts should have sender.tab set

    // if request is from devtools, send it along to the tab's content script
    // otherwise, the message is from a content script that needs to be send to
    // its respective devtools connection
    if (request.from === 'devtools') {
      chrome.tabs.sendMessage(request.tabId, { from: request.from, action: request.action, data: request.data });
    } else if (sender.tab) {
      var tabId = sender.tab.id;
      if (tabId in connections) {
        connections[tabId].postMessage(request);
      } else {
        console.log("Tab not found in connection list.");
      }
    } else {
      console.log("sender.tab not defined.");
    }
    return true;
  });
})(window);

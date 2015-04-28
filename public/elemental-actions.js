// TODO: figure out how to load stylez

// idea: adding styles is handled in two ways:
// 1.) non-bookmarklet:
// _styles property set on window through eval before this file is run
// 2.) bookmarklet:
// elemental-styles.css + this file are appended
(function(global) {
  global.Elemental = {
    _inspecting: false,

    // a _port property (MessageChannel port) is set on
    // this object to communicate with the extension
    postMessage: function(message) {
      if (global._openedWindow) {
        global._openedWindow.postMessage(message, '*');
      } else if (this._port) {
        this._port.postMessage(message);
      }
    },

    _loadCSS: function() {
      console.log('loaded css');
      $('head').append('<style> .elemental-inspected { border-style: dotted; border-width: 1px; } </style>');
    },

    _connectToContentScript: function() {
      var channel = new MessageChannel();
      this._port = channel.port1;
      global.postMessage('elemental-actions-setup', '*', [channel.port2]);

      this._port.onmessage = function(event) {
        var action = event.data;
        Elemental.send(action);
      };
    },

    send: function(actionName) {
      if (this.actions[actionName]) {
        this.actions[actionName]();
      }
    },

    actions: {
      reloadCSS: function() {
        var links = $('link');
        links.remove();
        links.appendTo('head');
        console.log('reloaded css!');
      },

      inspect: function() {
        if (this._inspecting) {
          console.log('inspecting turned off!');
          this._inspecting = false;
          document.removeEventListener('mouseover', this.highlightComponents, false);
          document.removeEventListener('click', this.selectComponent, false);
        } else {
          console.log('inspecting!');
          this._inspecting = true;
          document.addEventListener('mouseover', this.highlightComponents, false);
          document.addEventListener('click', this.selectComponent, false);
        }
      }
    },

    findComponentForEvent: function(e) {
      var current = e.target;

      while (current) {
        if (isComponent(current)) { break; }
        current = current.parentElement;
      }

      return current;
    },

    // determine if ember component and apply highlight class if true
    highlightComponents: function(e) {
      $(".elemental-inspected").removeClass("elemental-inspected");
      var componentEl = this.findComponentForEvent(e);
      if (!componentEl) { return; }
      componentEl.classList.add("elemental-inspected");
    },

    // determine if ember component and send message w/ component if true
    selectComponent: function(e) {
      var componentEl = this.findComponentForEvent(e);
      if (!componentEl) { return; }
      var component = Ember.View.views[componentEl.id];
      var componentName = component._debugContainerKey.replace('component:', '');
      console.log('COMPONENT CLICKED - SENDING ACTION TO DEVTOOLS!');
      this.postMessage(componentName);
    },

    bindActions: function() {
      var actions = this.actions;
      for (var key in actions) {
        if (!actions.hasOwnProperty(key)) { continue; }
        actions[key] = actions[key].bind(this);
      }
    },

    init: function() {
      this.bindActions();
      this.highlightComponents = this.highlightComponents.bind(this);
      this.selectComponent     = this.selectComponent.bind(this);
      this._loadCSS();
      this._connectToContentScript();
    }
  };

  function isComponent(el) {
    return el.className.indexOf('ember-view') !== -1;
  }

  Elemental.init();
})(window);

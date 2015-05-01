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
    },

    _connectToContentScript: function() {
      var channel = new MessageChannel();
      this._port = channel.port1;
      global.postMessage('elemental-actions-setup', '*', [channel.port2]);

      this._port.onmessage = function(event) {
        var message = event.data;
        Elemental.send(message.action, message.data);
      };
    },

    send: function(actionName, data) {
      if (this.actions[actionName]) {
        this.actions[actionName](data);
      }
    },

    actions: {
      reloadCSS: function(themeJson) {
        var links = $('link');
        links.remove();
        links.appendTo('head');

        var style = document.createElement('style');
        var fontFamily = "body {\nfont-family:"+ themeJson.globals.fontFamily + ";\n}";
        var surfaceColor = ".surface-4, .surface-3, .surface-2, .surface-1, .surface--custom {\ncolor:" + themeJson.globals.color + ";\n}";
        var lightSurface = ".surface-4 {\nborder: none !important;\nbackground-color: rgb(255, 255, 255);\nbox-shadow: 0rem 0.5rem 1rem grey;\n}\n.surface-3 {\nbackground-color: rgb(232, 232, 232);\nbox-shadow: 0rem 0.5rem 1rem grey;\n}\n.surface-2 {\nborder: none !important;\nbackground-color: rgb(212, 213, 213);\nbox-shadow: 0rem 0.25rem 0.5rem grey;\n}\n.surface-1 {\nbackground-color: rgb(196, 196, 196);\n}\n.surface--custom {\ncolor: rgb(255, 255, 255);\nbackground-color: rgb(0, 0, 0);\n}\n";
        var darkSurface = ".surface-4 {\ncolor: rgb(255, 255, 255);\nborder: none !important;\nborder-radius: 2px;\nbackground-color: rgb(73, 73, 73);\nbox-shadow: 0rem 0.5rem 1.5rem rgba(0, 0, 0, 0.5), inset 0 0 0.1rem grey;\n}\n.surface-3 {\ncolor: rgb(255, 255, 255);\nbackground-color: rgb(59, 59, 59);\nbox-shadow: 0rem 0.25rem 0.5rem black;\n}\n.surface-2 {\ncolor: rgb(212, 213, 213);\nborder: none !important;\nbackground-color: rgb(42, 43, 43);\nbox-shadow: 0rem 0.1rem 0.15rem #000000;\nbox-shadow: 0rem 0.1rem 0.15rem rgba(0, 0, 0, 0.5);\n}\n.surface-1 {\ncolor: rgb(255, 255, 255);\nbackground-color: rgb(59, 59, 59);\n}\n.surface--custom {\ncolor: rgb(255, 255, 255);\nborder: none !important;\nbackground-color: rgb(0, 0, 0);\n}\n";
        var output = "";

        output += (fontFamily + surfaceColor);
        if (themeJson.globals.surface === true) {
          output += lightSurface;
        } else {
          output += darkSurface;
        }

        style.innerHTML = output;
        document.head.appendChild(style);

        console.log('reloaded css!');
      },

      inspect: function() {
        if (this._inspecting) {
          console.log('inspecting turned off!');
          var highlightBox = document.querySelector('.elemental-inspected');
          if (highlightBox) { highlightBox.style.display = "none"; }

          this._inspecting = false;
          document.removeEventListener('mouseover', this.highlightComponents, false);
          document.removeEventListener('click', this.selectComponent, false);
        } else {
          console.log('inspecting!');
          var highlightBox = document.querySelector('.elemental-inspected');
          if (highlightBox) { highlightBox.style.display = "block"; }

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
      var rect, width, height, top, left, div;
      var highlightBox = document.querySelector('.elemental-inspected');

      if (!this._elementSelected) {
        if (highlightBox) {
          highlightBox.style.height = 0;
          highlightBox.style.width = 0;
          highlightBox.style.outline = "none";
        }
      }

      var componentEl = this.findComponentForEvent(e);
      if (!componentEl) { return; }

      rect = componentEl.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      top = rect.top;
      left = rect.left;

      // if no highlight box, create it
      if (!highlightBox) {
        div = document.createElement('div');
        div.classList.add('elemental-inspected');
        div.style.top = top + "px";
        div.style.left = left + "px";
        div.style.width = width + "px";
        div.style.height = height + "px";

        // >>>>  all of this shit can be put in elemental styles >>>>>>
        div.style.outline = "3px solid #888888";
        div.style['background-color'] = "#D8D8D8"
        div.style.opacity = "0.25";
        div.style.position = "absolute";
        div.style['pointer-events'] = 'none';
        div.style['transitionProperty'] = "top, left, width, height";
        div.style['transitionDuration'] = "0.1s,0.1s,0.1s,0.1s";
        // <<<<<<<<<<<<<<<
        document.body.appendChild(div);
      } else if (!this._elementSelected) {
        highlightBox.style.outline = "3px solid #888888";
        highlightBox.style.top = top + "px";
        highlightBox.style.left = left + "px";
        highlightBox.style.width = width + "px";
        highlightBox.style.height = height + "px";
      }

      // componentEl.classList.add("elemental-inspected");
    },

    _elementSelected: false,

    // determine if ember component and send message w/ component if true
    selectComponent: function(e) {
      var componentEl = this.findComponentForEvent(e);
      if (!componentEl) { return; }

      if (this._elementSelected === componentEl) {
        this._elementSelected = false;
      } else {
        this._elementSelected = componentEl;
      }
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

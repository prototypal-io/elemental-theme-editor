// TODO: figure out how to load stylez

// idea: adding styles is handled in two ways:
// 1.) non-bookmarklet:
// _styles property set on window through eval before this file is run
// 2.) bookmarklet:
// elemental-styles.css + this file are appended

window.Elemental = {
  // a _port property (MessageChannel port) is set on
  // this object to communicate with the extension
  postMessage: function(message) {
    if (window._openedWindow) {
      window._openedWindow.postMessage(message, '*');
    } else if (this._port) {
      this._port.postMessage(message);
    }
  },

  _loadCSS: function() {
    console.log('loaded css');
    $('head').append('<style>' + '.elemental-inspected { border-style: dotted; border-width: 1px; }' + '</style>');
  },

  _connectToContentScript: function() {
    var channel = new MessageChannel();
    this._port = channel.port1;
    window.postMessage('elemental-actions-setup', '*', [channel.port2]);

    this._port.onmessage = function(event) {
      var action = event.data;
      if (Elemental[action]) {
        Elemental[action]();
      }
    };
  },

  reloadCSS: function() {
    var links = $('link');
    links.remove()
    links.appendTo('head');
    console.log('reloaded css!');
  },

  _inspecting: false,

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
  },

  determineTarget: function(e) {
    var $targetArray = $(e.target);
    var $target = $targetArray[0];
    var emberId

    if ($targetArray.hasClass('ember-view')) {
      emberId = $target.id
    } else if ($targetArray.parents('.ember-view').length > 0) {
      $target = $targetArray.parents('.ember-view')[0];
      emberId = $target.id;
    }

    return { $target: $target, emberId: emberId }
  },

  // determine if ember component and apply highlight class if true
  highlightComponents: function(e) {
    var component
    var targetInfo = Elemental.determineTarget(e);
    var emberId = targetInfo.emberId;
    var $target = targetInfo.$target;


    $(document).find("*").removeClass("elemental-inspected");

    if (emberId && Em.View.views[emberId] instanceof Ember.Component) {
      $target.classList.add("elemental-inspected");
    }
  },

  // determine if ember component and send message w/ component if true
  selectComponent: function(e) {
    var targetInfo = Elemental.determineTarget(e);
    var emberId = targetInfo.emberId;
    var $target = targetInfo.$target;

    if (emberId && Em.View.views[emberId] instanceof Ember.Component) {
      component = Em.View.views[emberId]._debugContainerKey.replace('component:', '');
      console.log('COMPONENT CLICKED - SENDING ACTION TO DEVTOOLS!');
      Elemental.postMessage(component);
    }
  }
};



Elemental._loadCSS();
Elemental._connectToContentScript();

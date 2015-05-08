import Ember from 'ember';

export default Ember.Service.extend({
  _tabId: null,
  _theme: null,
  // _reloadCSSReady means ele-actions.js is set up and a connection has been established
  _reloadCSSReady: false,
  _inspectedWindowUrlPromise: null,
  _findInspectedWindowUrlDeferred: null,
  _setupContentScriptDeferred: null,

  init() {
    // this is starting to get gross - might want to split bookmarklet and chrome adapters up
    this._super(...arguments);
    this.router = this.container.lookup('router:main');

    this._setupContentScriptDeferred = this._setupContentScript();
    this._loadingActionsPromise = this._loadElementalActions();
    this._inspectedWindowUrlPromise = this._loadInspectedWindowUrl();

    if (this._isChromeDevtools()) {
      this._setupChromeBackgroundPage();
    } else if (window.opener) {
      this._bookmarkletSetup();
    }
  },

  _isChromeDevtools() {
    if ((typeof chrome !== "undefined") && chrome.devtools) {
      return true;
    } else {
      return false;
    }
  },

  _setupContentScript() {
    let deferred = Promise.defer();

    if (!this._isChromeDevtools()) {
      deferred.resolve();
    }

    return deferred;
  },

  _loadInspectedWindowUrl() {
    let deferred = this._findInspectedWindowUrlDeferred = Promise.defer();

    if (this._isChromeDevtools()) {
      chrome.devtools.inspectedWindow.eval("window.location.origin", windowUrl => {
        deferred.resolve(windowUrl);
      });
    } else if (ElementalThemeEditor.testing) {
      deferred.resolve('http://testing-url:1337');
    }

    return deferred.promise;
  },

  _setupChromeBackgroundPage() {
    let devtools = chrome.devtools;
    let runtime  = chrome.runtime;

    if (!devtools || !runtime) { return; }

    let tabId = this._tabId = devtools.inspectedWindow.tabId;
    let backgroundPageConnection = runtime.connect({
      name: 'elemental-pane'
    });

    backgroundPageConnection.postMessage({
      name: 'el-bs-init',
      tabId: tabId
    });

    backgroundPageConnection.onMessage.addListener(message => {
      this._handleIncomingMessage(message);
    });
  },

  _bookmarkletSetup() {
    let channel = new MessageChannel();
    this._port = channel.port1;
    let message = { action: 'ete-port-setup' };
    let stringifiedMessage = JSON.stringify(message);

    this._port.onmessage = event => {

      let message = event.data;
      this._handleIncomingMessage(message);
    };

    window.opener.postMessage(stringifiedMessage, '*', [channel.port2]);
  },

  _handleIncomingMessage(message) {
    if (message.action === 'fetchCSS') { // this is not going to be necessary
      if (this._theme) {
        this.callAction('reloadCSS', this._theme);
      } else {
        this._reloadCSSReady = true;
      }
    } else if (message.action === 'componentClicked') {
      let componentName = message.data;
      this.router.transitionTo('component', componentName);
    } else if (message.action === 'el-cs-init-complete') {
      // once content script init is complete,
      // devtools evals EA to inspected window
      this._setupContentScriptDeferred.resolve();
    } else if (message.action === 'ete-port-setup-complete') {
      this._findInspectedWindowUrlDeferred.resolve(message.data);
    }
  },

  callAction(action, data) {
    this._loadingActionsPromise.then(() => {
      this._call(action, data);
    }, e => {
      console.warn(e);
    });
  },

  _call(action, data) {
    // TODO: see if we can just use a MessageChannel port with Chrome dev tools?
    if (this._isChromeDevtools()) {
      chrome.extension.sendMessage({from: 'devtools', action: action, tabId: this._tabId, data: data});
    } else if (window.opener) {
      this._port.postMessage({ action: action, data: data });
    }
  },

  _eval(src) {
    return chrome.devtools.inspectedWindow.eval(src);
  },

  _loadElementalActions() {
    return this._setupContentScriptDeferred.promise.then(() => {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url;

        // the content script promise filters out the bookmarklet
        // because it is already loaded, but ff devtools are not supported yet
        if (!this._isChromeDevtools()) {
          resolve();
          return;
        }

        // the following chrome checks are just reminders for when we add ff devtools
        url = 'elemental-actions.js';
        if (this._isChromeDevtools()) {
          url = chrome.extension.getURL(url);
        }

        xhr.open("GET", url, true);
        xhr.send();
        xhr.onload = e => {
          Ember.run(() => {
            let contents = xhr.responseText;
            this._eval(contents + '//@ sourceURL=elemental-actions.js');
            resolve(e);
          });
        };

        xhr.onerror = e => {
          reject(e);
        };
      });
    });
  }
});

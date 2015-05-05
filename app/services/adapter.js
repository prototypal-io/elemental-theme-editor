import Ember from 'ember';

export default Ember.Service.extend({
  _tabId: null,
  _theme: null,
  // _reloadCSSReady means ele-actions.js is set up and a connection has been established
  _reloadCSSReady: false,

  init() {
    this._super(...arguments);
    this.router = this.container.lookup('router:main');
    this._loadingActionsPromise = this._loadElementalActions();

    if (this._isChromeDevtools()) {
      this._chromeSetup();
    } else {
      window.addEventListener('message', event => {
        this._handleIncomingMessage()
      }, false);
    }
  },

  _isChromeDevtools() {
    if ((typeof chrome !== "undefined") && chrome.devtools) {
      return true;
    } else {
      return false;
    }
  },

  _handleIncomingMessage(message) {
    if (message.action === 'fetchCSS') {
      if (this._theme) {
        this.callAction('reloadCSS', this._theme);
      } else {
        this._reloadCSSReady = true;
      }
    } else if (message.action === 'componentClicked') {
      let componentName = message.data;
      this.router.transitionTo('component', componentName);
    }
  },

  _chromeSetup() {
    let devtools = chrome.devtools;
    let runtime  = chrome.runtime;

    if (!devtools || !runtime) { return; }

    let tabId = this._tabId = devtools.inspectedWindow.tabId;
    let backgroundPageConnection = runtime.connect({
      name: 'elemental-pane'
    });

    backgroundPageConnection.postMessage({
      name: 'init',
      tabId: tabId
    });

    backgroundPageConnection.onMessage.addListener(message => {
      this._handleIncomingMessage(message);
    });
  },

  callAction(action, data) {
    this._loadingActionsPromise.then(() => {
      this._call(action, data);
    }, e => {
      console.warn(e);
    });
  },

  _call(action, data) {
    if (this._isChromeDevtools()) {
      chrome.extension.sendMessage({from: 'devtools', action: action, tabId: this._tabId, data: data});
    } else if (window.opener) {
      // need action + data
      window.opener.postMessage(action, '*');
    }
  },

  _loadElementalActions() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url;

      // if bookmarklet or not chrome devtools, immediately exit because
      // elemental-actions.js is either already loaded (bookmarklet)
      // or not supported yet (ff devtools)
      if (window.opener || !this._isChromeDevtools()) {
        resolve();
        return;
      }

      // the following chrome checks are just reminders for when we add ff devtools
      url = 'elemental-actions.js';
      if (this._isChromeDevtools()) {
        url = chrome.extension.getURL(url);
      }

      xhr.open("GET", url, true);
      xhr.onload = e => {
        Ember.run(() => {
          let contents = xhr.responseText;
          let evalFn;

          // why is ElementalThemeEditor defined here but not outside the run loop?
          // if (ElementalThemeEditor.testing) {
            // what's the best way to handle mocking eval for tests?
            // should I even do this? :/
            // evalFn = chrome.devtools.inspectedWindow.testingEval;
          // } else
          if (this._isChromeDevtools()) {
            evalFn = chrome.devtools.inspectedWindow.eval;
          }
          evalFn(contents + '//@ sourceURL=elemental-actions.js');
          resolve(e);
        });
      };

      xhr.onerror = e => {
        reject(e);
      };

      xhr.send();
    });
  }
});

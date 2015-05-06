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

  _bookmarkletSetup() {
    window.addEventListener('message', event => {
      let message = event.data;
      this._handleIncomingMessage(message);
    }, false);

    // because the event listener is usually not set up by the
    //  time fetchCSS is fired, the initial reloadCSS is handled here
    if (this._theme) {
      this.callAction('reloadCSS', this._theme);
    } else {
      this._reloadCSSReady = true;
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
      let message = { action: action, data: data };
      let stringifiedMessage = JSON.stringify(message);
      window.opener.postMessage(stringifiedMessage, '*');
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
      xhr.send();
      xhr.onload = e => {
        Ember.run(() => {
          let contents = xhr.responseText;
          let evalFn;

          // we can't bind eval, is this a good workaround?
          if (ElementalThemeEditor.testing) {
            evalFn = chrome.devtools.inspectedWindow.testingEval;
          } else if (this._isChromeDevtools()) {
            evalFn = chrome.devtools.inspectedWindow.eval;
          }
          evalFn(contents + '//@ sourceURL=elemental-actions.js');
          resolve(e);
        });
      };

      xhr.onerror = e => {
        reject(e);
      };
    });
  }
});

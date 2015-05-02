import Ember from 'ember';

export default Ember.Service.extend({
  _tabId: null,

  init() {
    this._super(...arguments);
    this.router = this.container.lookup('router:main');
    this._loadingActionsPromise = this._loadElementalActions();
    if (this._isChromeDevtools()) {
      this._chromeSetup();
    } else {
      window.addEventListener('message', event => {
        let componentName = event.data;
        this.router.transitionTo('component', componentName);
      }, false);
    }
  },

  _isChromeDevtools() {
    return (typeof chrome !== "undefined") && chrome.devtools;
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

    // the message data might become more complex, but for now it's just
    // the name of a component that a user clicked in magnification mode
    backgroundPageConnection.onMessage.addListener(message => {
      let componentName = message.data;
      this.router.transitionTo('component', componentName);
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

      debugger;
      // if bookmarklet or not chrome devtools, immediately exit because
      // elemental-actions.js is either already loaded (bookmarklet)
      // or not supported yet (ff devtools)
      if (window.opener || !this._isChromeDevtools()) {
        resolve();
        return;
      }

      // the following chrome checks are just reminders for when we add ff devtools
      if (this._isChromeDevtools()) {
        url = chrome.extension.getURL(url);
      }

      xhr.open("GET", url, true);
      xhr.onload = e => {
        let contents = xhr.responseText;
        let evalFn;
        if (this._isChromeDevtools()) {
          evalFn = chrome.devtools.inspectedWindow.eval
        }
        evalFn(contents + '//@ sourceURL=elemental-actions.js');
        resolve(e);
      };

      xhr.onerror = e => {
        reject(e);
      };

      xhr.send();
    });
  }
});

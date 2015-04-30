/* globals Elemental */
import Ember from 'ember';
// import ChromeAdapter from '../adapters/chrome';
// import config from '../config/environment';

export default Ember.Service.extend({
  _tabId: null,

  init() {
    this._super(...arguments);
    this.router = this.container.lookup('router:main');
    this._loadingActionsPromise = this._loadElementalActions();
    if (this._isChrome()) {
      this._setupChrome();
    } else {
      window.addEventListener('message', event => {
        let componentName = event.data;
        this.router.transitionTo('component', componentName);
      }, false);
    }
  },

  _isChrome() {
    return typeof chrome !== "undefined";
  },

  _setupChrome() {
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
    if (this._isChrome()) {
      chrome.extension.sendMessage({from: 'devtools', action: action, tabId: this._tabId, data: data});
    } else if (window.opener) {
      // need action + data
      window.opener.postMessage(action, '*');
    }
  },

  _loadElementalActions() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      // if bookmarklet, immediately exit because shit's already loaded
      if (window.opener) { resolve(); return; }

      let url = '/elemental-actions.js';
      if (this._isChrome()) {
        url = chrome.extension.getURL(url);
      }

      xhr.open("GET", url, true);
      xhr.onload = e => {
        let contents = xhr.responseText;
        let evalFn = this._isChrome() ? chrome.devtools.inspectedWindow.eval : eval;
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

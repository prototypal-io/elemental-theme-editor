import Ember from 'ember';

export default Ember.Service.extend({
  _tabId: null,
  _theme: null,
  // _reloadCSSReady means ele-actions.js is set up and a connection has been established
  _reloadCSSReady: false,
  _bookmarkletInspectedWindowUrl: null,
  _bookmarkletInspectedWindowUrlResolve: null,

  init() {
    // this is starting to get gross - might want to split bookmarklet and chrome adapters up
    this._super(...arguments);
    this.router = this.container.lookup('router:main');

    this._setupDeferred = Ember.RSVP.defer();
    this._loadingActionsPromise = this._loadElementalActions();

    debugger;
    this._bookmarkletInspectedWindowUrlPromise = new Promise(resolve => {
      if (this._isChromeDevtools()) {
        resolve();
      } else if (window.opener) {
        this._bookmarkletInspectedWindowUrlResolve = resolve;
      } else if (ElementalThemeEditor.testing) {
        resolve();
      }
    });

    this._inspectedWindowUrlPromise = this._loadInspectedWindowUrl();

    if (this._isChromeDevtools()) {
      this._chromeSetup();
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

  _loadInspectedWindowUrl() {
    return this._bookmarkletInspectedWindowUrlPromise.then(() => {
      return new Promise(resolve => {
        if (this._isChromeDevtools()) {
          chrome.devtools.inspectedWindow.eval("window.location.origin", windowUrl => {
            resolve(windowUrl);
          });
        } else if (window.opener) {
          resolve(this._bookmarkletInspectedWindowUrl);
        } else if (ElementalThemeEditor.testing) {
          callback('http://testing-url:1337');
        }
      });
    });
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
      name: 'el-bs-init',
      tabId: tabId
    });

    backgroundPageConnection.onMessage.addListener(message => {
      this._handleIncomingMessage(message);
    });
  },

  _bookmarkletSetup() {
    debugger;
    let channel = new MessageChannel();
    this._port = channel.port1;
    let message = { action: 'ete-port-setup' };
    let stringifiedMessage = JSON.stringify(message);

    // this shouldn't even have to happen
    // refactor the init/_loadElementalActions
    this._setupDeferred.resolve();

    this._port.onmessage = event => {
      debugger;
      let message = event.data;
      this._handleIncomingMessage(message);
    };

    window.opener.postMessage(stringifiedMessage, '*', [channel.port2]);

    // // because the event listener is usually not set up by the
    // //  time fetchCSS is fired, the initial reloadCSS is handled here
    // if (this._theme) {
    //   this.callAction('reloadCSS', this._theme);
    // } else {
    //   this._reloadCSSReady = true;
    // }
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
    } else if (message.action === 'el-cs-init-complete') {
      this._setupDeferred.resolve();
      // once content script init is complete,
      // devtools evals EA to inspected window
    } else if (message.action === 'ete-port-setup-complete') {
      debugger;
      this._bookmarkletInspectedWindowUrl = message.data;
      this._bookmarkletInspectedWindowUrlResolve();
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
      this._port.postMessage({ action: action, data: data });
    }
  },

  _loadElementalActions() {
    return this._setupDeferred.promise.then(() => {
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
    });
  }
});

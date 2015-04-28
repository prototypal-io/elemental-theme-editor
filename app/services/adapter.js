/* globals Elemental */
import Ember from 'ember';
// import ChromeAdapter from '../adapters/chrome';
// import config from '../config/environment';

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this._router = this.container.lookup('router:main');
    this._backgroundPageSetup();
    this._loadingActionsPromise = this._loadElementalActions();
    if (chrome && chrome.devtools) {
      this._tabId = chrome.devtools.inspectedWindow.tabId;
    }
  },

  _backgroundPageSetup() {
    var backgroundPageConnection = chrome.runtime.connect({
      name: 'elemental-pane'
    });

    backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    backgroundPageConnection.onMessage.addListener(message => {
      let componentName = message.data;
      this._router.transitionTo('component', componentName);
    });
  },

  callAction(action) {
    this._loadingActionsPromise.then(() => {
      this._call(action);
    }, e => {
      console.warn(e);
    });
  },

  _call(action) {
    if (chrome && chrome.extension) {
      chrome.extension.sendMessage({
        from: 'devtools',
        action: action,
        tabId: this._tabId
      });
    } else if (window.opener) {
      window.opener.postMessage(action, '*');
    }
  },

  _loadElementalStyles() {
    return this._loadAsset('styles');
  },

  _loadElementalActions() {
    return this._loadAsset('actions');
  },

  _loadAsset(asset) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url;

      // if bookmarklet, immediately exit because shit's already loaded
      if (window.opener) { resolve(); return; }

      if (chrome && chrome.extension) {
        url = chrome.extension.getURL('/elemental-actions.js');
      } else {
        url = '/elemental-actions.js';
      }

      xhr.open("GET", url , true);
      xhr.onload = e => {
        let elementalAsset = xhr.responseText;
        if (chrome && chrome.devtools) {
          chrome.devtools.inspectedWindow.eval(elementalAsset);
        } else {
          eval(elementalAsset);
        }

        // if (window.opener) {
        //   window.opener.postMessage('setUpChannel', '*', [channel.port2]);
        // } else {
        //   // debugger;
        //   this._call('setUpChannel', {  });
        // }

        resolve(e);
      };

      xhr.onerror = e => {
        reject(e);
      };

      xhr.send();
    });
  }

  // _adapter() {
    // let adapterName = config.default.APP.adapter;
    // let adapterName = 'chrome';
    // return this.container.lookup(`adapter:${adapterName}`) || this.container.lookup(`adapter:basic`);
  // }

});

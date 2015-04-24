import Ember from 'ember';
// import ChromeAdapter from '../adapters/chrome';
// import config from '../config/environment';

export default Ember.Service.extend({

  init() {
    this._super(...arguments);
    this._loadingPromise = this._loadElementalActions();
  },

  reloadCSS() {
    let resolved;
    if (resolved) {
      this._evalReloadCSS();
    } else {
      this._loadingPromise.then(e => {
        resolved = true
        this._evalReloadCSS();
      }, e => {
        console.warn(e);
      });
    }
  },

  _evalReloadCSS() {
    if (chrome && chrome.devtools) {
      chrome.devtools.inspectedWindow.eval("Elemental.reloadCSS();");
    } else {
      Elemental.reloadCSS();
    }
  },

  _loadElementalActions() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url;
      if (chrome && chrome.extension) {
        url = chrome.extension.getURL('/elemental-actions.js');
      } else {
        url = '/elemental-actions.js';
      }

      xhr.open("GET", url , true);
      xhr.onload = e => {
        let elementalActions = xhr.responseText;
        if (chrome && chrome.devtools) {
          chrome.devtools.inspectedWindow.eval(elementalActions);

        } else {
          eval(elementalActions);
        }
        resolve(e);
      };

      xhr.onerror = e => {
        reject(e);
      }
      xhr.send();
    });
  }

  // _adapter() {
    // let adapterName = config.default.APP.adapter;
    // let adapterName = 'chrome';
    // return this.container.lookup(`adapter:${adapterName}`) || this.container.lookup(`adapter:basic`);
  // }

});

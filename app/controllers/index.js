import Ember from 'ember';

export default Ember.Controller.extend({
  init: function() {
    this._loadElementalActions();
    Ember.$.getJSON('http://localhost:4200/theme').then(json => {
      this.setProperties(json);
    });
  },

  _loadElementalActions() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('/elemental-actions.js'), false);
    xhr.send();
    let elementalActions = xhr.responseText;

    chrome.devtools.inspectedWindow.eval(elementalActions);
  },

  fontFamily: null,
  scale: null,
  color: null,

  actions: {
    reload() {
      window.location.reload();
    },

    edit() {
      console.log('editing');
      let data = this.getProperties('fontFamily', 'scale', 'color');

      Ember.$.ajax('http://localhost:4200/theme', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).then(json => {
        chrome.devtools.inspectedWindow.eval("elemental.reloadCSS();");
      }, xhr => {
        console.log('failure');
      });
    }
  }
});

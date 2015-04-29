import Ember from 'ember';

export default Ember.Component.extend({
  adapter: Ember.inject.service(),
  fontFamily: null,
  scale: null,
  color: null,

  init: function() {
    this._super(...arguments);
    let adapter = this.get('adapter'); // instantiate this immediately
    Ember.$.getJSON('http://localhost:4200/theme').then(themeJSON => {
      this.setProperties(themeJSON.globals);
    });
  },

  actions: {
    reload() {
      window.location.reload();
    },

    save() {
      console.log('saving settings!');
      let themeJSON = {};
      themeJSON.globals = this.getProperties('fontFamily', 'scale', 'color');

      Ember.$.ajax('http://localhost:4200/theme', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(themeJSON)
      }).then(json => {
        this.get('adapter').callAction('reloadCSS');
      }, xhr => {
        console.log('failure');
      });
    },

    inspect() {
      this.get('adapter').callAction('inspect');
    }
  }
});

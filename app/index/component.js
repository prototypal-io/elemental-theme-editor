import Ember from 'ember';

export default Ember.Component.extend({
  init: function() {
    this._super(...arguments);
    Ember.$.getJSON('http://localhost:4200/theme').then(json => {
      this.setProperties(json);
    });
  },

  adapter: Ember.inject.service(),
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
        this.get('adapter').reloadCSS();
      }, xhr => {
        console.log('failure');
      });
    }
  }
});

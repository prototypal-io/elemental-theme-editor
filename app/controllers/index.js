import Ember from 'ember';

export default Ember.Controller.extend({
  init: function() {
    Ember.$.getJSON('http://localhost:4200/theme').then(json => {
      this.setProperties(json);
    });
  },

  fontFamily: null,
  scale: null,
  color: null,

  actions: {
    reload() {
      window.location.reload();
    },

    edit() {
      console.log('editing')
      let data = this.getProperties('fontFamily', 'scale', 'color');

      Ember.$.ajax('http://localhost:4200/theme', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).then(json => {
        console.log('success');
      }, xhr => {
        console.log('failure');
      });
    }
  }
});

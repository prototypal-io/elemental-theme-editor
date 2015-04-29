import Ember from 'ember';

export default Ember.Component.extend({
  init: function() {
    this._super(...arguments);
    Ember.$.getJSON('http://localhost:4200/theme').then(themeJSON => {
      // this component is expecting the component's properties to be in theme.json
      this.setProperties(themeJSON[this.get('model')]);

      // this.set('settings', themeJSON[this.get('model')]);

      // if you want this to handle components generally, you'll
      // need to be able to iterate across the settings in the form.
      // we will need to handle each setting differently based on
      // its name i.e. backgroundColor vs scale -- or the setting can provide
      // some information on what type of input type to use
    });
  },

  actions: {
    save() {
      themeJSON[this.get('model')] = this.getProperties();

      Ember.$.ajax('http://localhost:4200/theme', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(themeJSON)
      }).then(json => {
        this.get('adapter').callAction('reloadCSS');
      }, xhr => {
        console.log('failure');
      });
    }
  }
});

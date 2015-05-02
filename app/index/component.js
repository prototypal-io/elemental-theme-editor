import Ember from 'ember';

export default Ember.Component.extend({
  _themeJSON: null,
  _inspectActive: null,
  adapter: Ember.inject.service(),
  fontFamily: null,
  scale: null,
  color: null,
  surface: false,
  inspectActive: Ember.computed('_inspectActive', function() {
    if (this._inspectActive) { return 'inspect-active'; }
  }),

  init: function() {
    this._super(...arguments);

    let xhr = new XMLHttpRequest();
    xhr.open('get', 'http://localhost:4200/theme', true);
    xhr.onload = e => {
      Ember.run(() => {
        let themeJSON = JSON.parse(xhr.responseText);
        this._themeJSON = themeJSON;
        this.setProperties(themeJSON.globals);
      });
    };
  },

  didInsertElement() {
    var iconic = new IconicJS();
    iconic.update();
  },

  actions: {
    reload() {
      window.location.reload();
    },

    save() {
      console.log('saving settings!');
      this._themeJSON.globals = this.getProperties('fontFamily', 'scale', 'color', 'surface');

      Ember.$.ajax('http://localhost:4200/theme', {
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this._themeJSON)
      }).then(json => {
        this.get('adapter').callAction('reloadCSS', json.theme);
      }, xhr => {
        console.warn('FAILURE:');
        console.log(xhr);
      });
    },

    inspect() {
      this.toggleProperty('_inspectActive');
      this.get('adapter').callAction('inspect');
    }
  }
});

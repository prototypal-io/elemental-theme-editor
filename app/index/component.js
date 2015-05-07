import Ember from 'ember';

export default Ember.Component.extend({
  _theme: null,
  _inspectActive: null,
  adapter: Ember.inject.service(),
  fontFamily: null,
  scale: null,
  color: null,
  surface: false,
  inspectActive: Ember.computed('_inspectActive', function() {
    if (this._inspectActive) { return 'inspect-active'; }
  }),
  fonts: [
    "Arial",
    "Arial Black",
    "Book Antiqua",
    "Charcoal",
    "Comic Sans MS",
    "Courier New",
    "Georgia",
    "Helvetica",
    "Impact",
    "Lucida Console",
    "Lucida Sans Unicode",
    "monospace",
    "Monaco",
    "Palatino Linotype",
    "sans-serif",
    "serif",
    "Tahoma",
    "Trebuchet MS",
    "Verdana"
  ],

  init: function() {
    this._super(...arguments);
    let adapter = this.get('adapter');

    let xhr = new XMLHttpRequest();
    this.get('adapter')._windowUrl(windowUrl => {
      xhr.open('get', windowUrl + '/theme', true);
      xhr.send();
    });

    xhr.onload = () => {
      Ember.run(() => {
        console.log('loaded theme settings!');
        let theme = JSON.parse(xhr.responseText) || null;
        this._theme = theme;
        this.setProperties(theme.globals);

        // debugger;
        // if the adapter/ele-actions.js is ready to reload the CSS,
        // do it - otherwise, set the loaded theme on the adapter
        if (adapter._reloadCSSReady) {
          adapter.callAction('reloadCSS', theme);
        } else {
          adapter._theme = theme;
        }
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
      if (!this._theme) { console.log('no _theme - halting'); return; }

      this._theme.globals = this.getProperties('fontFamily', 'scale', 'color', 'surface');

      let xhr = new XMLHttpRequest();
      this.get('adapter')._windowUrl(windowUrl => {
        xhr.open('post', windowUrl + '/theme', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(this._theme));
      });

      xhr.onload = () => {
        Ember.run(() => {
          console.log('saving settings!');
          let response = JSON.parse(xhr.responseText);
          let theme = response.theme;
          this.get('adapter').callAction('reloadCSS', theme);
        });
      };
    },

    inspect() {
      this.toggleProperty('_inspectActive');
      this.get('adapter').callAction('inspect');
    }
  }
});

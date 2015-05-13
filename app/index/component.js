import Ember from 'ember';

export default Ember.Component.extend({
  _theme: null,

  inspector: Ember.inject.service(),
  adapter: Ember.inject.service(),

  fontFamily: null,
  scale: null,
  color: null,
  surface: false,
  inspectActive: Ember.computed('inspector.inspecting', function() {
    if (this.get('inspector.inspecting')) {
      return 'inspect-active';
    }
  }),

  // TODO: auto-detect available fonts (if possible?)
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

    // TODO: Should likely be fetching our model data in the route
    adapter._inspectedWindowUrlPromise.then(windowUrl => {
      let xhr = new XMLHttpRequest();
      xhr.open('get', windowUrl + '/theme');
      xhr.send();

      xhr.onload = () => {
        Ember.run(() => {
          console.log('loaded theme settings!');
          let theme = JSON.parse(xhr.responseText) || null;
          this._theme = theme;
          this.setProperties(theme.globals);

          // if the adapter/ele-actions.js is ready to reload the CSS,
          // or it's the bookmarklet (we already know EA.js is loaded)
          // do it - otherwise, set the loaded theme on the adapter
          if (adapter._reloadCSSReady || window.opener) {
            adapter.callAction('reloadCSS', theme);
          } else {
            // TODO: nuke me when we get proper theming support in our prebuilt CSS
            adapter._theme = theme;
          }
        });
      };
    });
  },

  actions: {
    reload() {
      window.location.reload();
    },

    save() {
      if (!this._theme) { console.log('no _theme - halting'); return; }

      this._theme.globals = this.getProperties('fontFamily', 'scale', 'color', 'surface');

      let xhr = new XMLHttpRequest();
      this.get('adapter')._inspectedWindowUrlPromise.then(windowUrl => {
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
      this.get('inspector').toggleProperty('inspecting');
      this.get('adapter').callAction('inspect');
    }
  }
});

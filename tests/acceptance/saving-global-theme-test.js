import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'elemental-theme-editor/tests/helpers/start-app';
import Pretender from 'pretender';

var application;

module('Acceptance: SavingGlobalTheme', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /saving-global-theme', function(assert) {
  let themeJSON = {
    "globals": {
      "fontFamily": "Arial",
      "scale": "2:1",
      "color": "#D8D8D8",
      "surface": "true"
    }
  };

  fakehr.start();
  visit('/');
  andThen(() => {
    let request = fakehr.match('GET', 'http://localhost:4200/theme');
    request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(themeJSON));
    assert.equal(find('input[name=fontFamily]')[0].value, 'Arial');
    assert.equal(find('input[name=scale]')[0].value, '2:1');
    assert.equal(find('input[name=color]')[0].value, '#D8D8D8');
    assert.equal(find('input[name=surface]')[0].value, 'on');
  });




});

import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'elemental-theme-editor/tests/helpers/start-app';

var application;

module('Acceptance: SavingGlobalTheme', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visit root and ensure theme.json data loads and save sends correct data', function(assert) {
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
    let request = fakehr.match('get', 'http://localhost:4200/theme');
    request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(themeJSON));
    assert.equal(find('input[name=fontFamily]')[0].value, 'Arial');
    assert.equal(find('input[name=scale]')[0].value, '2:1');
    assert.equal(find('input[name=color]')[0].value, '#D8D8D8');
    assert.equal(find('input[name=surface]')[0].value, 'on');

    // populate new data and save!
    find('input[name=fontFamily]')[0].value = 'American Typewriter';
    find('input[name=scale]')[0].value = '4:3';
    find('input[name=color]')[0].value = '#112233';
    find('input[name=surface]')[0].value = 'off';
    // these new values aren't changing the component's properties by the time this click happens
    find('button.btn')[0].click();
  });

  andThen(() => {
    let request = fakehr.match('POST', 'http://localhost:4200/theme');
  });
});

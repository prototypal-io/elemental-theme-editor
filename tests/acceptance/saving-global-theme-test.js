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

    // set new global settings and save!
    fillIn('input[name=fontFamily]', 'American Typewriter');
    fillIn('input[name=scale]', '4:3');
    fillIn('input[name=color]', '#112233');
    click('input[name=surface]').then(() => {
      click('button.btn')[0];
    });
  });

  andThen(() => {
    // the form is correctly filled in, and after save is clicked and
    // there is a post request with the correct body
    let request = fakehr.match('POST', 'http://localhost:4200/theme');
    let themeGlobals = JSON.parse(request.requestBody).globals;
    assert.equal(find('input[name=fontFamily]')[0].value, 'American Typewriter');
    assert.equal(find('input[name=scale]')[0].value, '4:3');
    assert.equal(find('input[name=color]')[0].value, '#112233');
    assert.equal(find('input[name=surface]')[0].checked, false);
    assert.equal(themeGlobals.fontFamily, 'American Typewriter');
    assert.equal(themeGlobals.scale, '4:3');
    assert.equal(themeGlobals.color, '#112233');
    assert.equal(themeGlobals.surface, false);
  });
});

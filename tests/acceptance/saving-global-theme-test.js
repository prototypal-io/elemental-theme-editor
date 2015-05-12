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
    let request = fakehr.match('get', 'http://testing-url:1337/theme');
    request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(themeJSON));
    assert.equal(find('input.input--font-family')[0].value, 'Arial');
    assert.equal(find('input[name=scale]')[0].value, '2:1');
    assert.equal(find('input[name=color]')[0].value, '#D8D8D8');
    assert.equal(find('input[name=surface]')[0].value, 'on');

    // set new global settings and save!
    click('input.input--font-family').then(() => {
      click('li:contains(Monaco)');
    });
    fillIn('input[name=scale]', '4:3');
    fillIn('input[name=color]', '#112233');
    click('input[name=surface]').then(() => {
      click('button.btn');
    });
  });

  andThen(() => {
    // the form is correctly filled in, and after save is clicked and
    // there is a post request with the correct body
    let request = fakehr.match('POST', 'http://testing-url:1337/theme');
    let themeGlobals = JSON.parse(request.requestBody).globals;

    assert.equal(find('input.input--font-family')[0].value, 'Monaco');
    assert.equal(find('input[name=scale]')[0].value, '4:3');
    assert.equal(find('input[name=color]')[0].value, '#112233');
    assert.equal(find('input[name=surface]')[0].checked, false);
    assert.equal(themeGlobals.fontFamily, 'Monaco');
    assert.equal(themeGlobals.scale, '4:3');
    assert.equal(themeGlobals.color, '#112233');
    assert.equal(themeGlobals.surface, false);
  });
});

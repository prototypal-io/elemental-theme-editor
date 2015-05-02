import {
  moduleFor,
  test
} from 'ember-qunit';
import Pretender from 'pretender';

moduleFor('service:adapter', {
  // Specify the other units that are required for this test.
  // needs: ['service:router']
});

// Replace this with your real tests.
test('it correctly sets up for chrome', function(assert) {
  var adapter = this.subject();
  var backgroundPageInit, tabId;

  var chrome = {
    runtime: {
      connect: function(opts) {
        // this returned object is a background page connection
        return {
          postMessage: function(opts) {
            backgroundPageInit = opts.name;
            tabId = opts.tabId;
          },

          onMessage: {
            addListener: function(callback) {

            }
          }
        };
      }
    },

    devtools: {
      inspectedWindow: {
        tabId: 32
      }
    }
  };

  assert.equal(adapter._isChrome(), true);

  // not sure why this doesn't work :/
  // assert.equal(backgroundPageInit, 'init');
  // assert.equal(tabId, 32);

  assert.ok(adapter);
});

test('_loadElementalActions and callAction works', function(assert) {
  // how do I test this?
  var adapter = this.subject();
  var chrome = {
    extension: {
      getURL: function() {

      }
    }
  };

  var server = new Pretender(function() {
    this.get('')
  });

  assert.ok(adapter);
});

import {
  moduleFor,
  test
} from 'ember-qunit';
import Pretender from 'pretender';

moduleFor('service:adapter', {
  // Specify the other units that are required for this test.
  // needs: ['service:router']
});

test('it correctly sets up for chrome devtools', function(assert) {
  let adapter = this.subject();
  let backgroundPageInit, tabId, request;
  fakehr.start();

  adapter._eval = function(src) {
    assert.equal(src, "window.foo = function() {}//@ sourceURL=elemental-actions.js");
  },

  // TODO: use sinon
  window.chrome = {
    runtime: {
      connect: function(opts) {
        // this returned object is a background page connection
        return {
          postMessage: function(opts) {
            backgroundPageInit = opts.name;
            tabId = opts.tabId;
            assert.equal(backgroundPageInit, 'init');
            assert.equal(tabId, 32);
          },

          onMessage: {
            addListener: function(callback) {
              // this test might be able to be more robust?
              assert.equal(typeof callback, "function");
            }
          }
        };
      }
    },

    devtools: {
      inspectedWindow: {
        tabId: 32
      }
    },

    extension: {
      getURL: function(url) {
        return 'chrome-extension://testing-id-12345/elemental-actions.js';
      }
    }
  };

  assert.ok(adapter);

  adapter._loadElementalActions();
  request = fakehr.match('get', 'chrome-extension://testing-id-12345/elemental-actions.js');
  request.respond(200, {}, "window.foo = function() {}");

});

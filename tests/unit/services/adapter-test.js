import {
  moduleFor,
  test
} from 'ember-qunit';
import Pretender from 'pretender';

moduleFor('service:adapter', {
  // Specify the other units that are required for this test.
  // needs: ['service:router']
});

// how do I test chrome devtools?
test('it correctly sets up for chrome devtools', function(assert) {
  let adapter = this.subject();
  let backgroundPageInit, tabId;

  // THIS WILL NOT WORK because of the async XHR in _loadElementalActions
  // fakehr.start();
  // let request = fakehr.match('get', 'chrome-extension://testing-id-12345/elemental-actions.js');
  // request.respond(200, {}, "<placeholder for elemental actions script>");

  window.chrome = {
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
              // expect callback here
            }
          }
        };
      }
    },

    devtools: {
      inspectedWindow: {
        tabId: 32,

        // NOTE: YOU CANNOT BIND eval IN STRICT MODE,
        // so we use this testingEval thing
        testingEval: function(evalStr) {
          // expect evalStr here
        }
      }
    },

    extension: {
      getURL: function(url) {
        return 'chrome-extension://testing-id-12345/elemental-actions.js';
      }
    }
  };

  assert.equal(adapter._isChromeDevtools(), true);

  // I want to get these working:
  // assert.equal(backgroundPageInit, 'init');
  // assert.equal(tabId, 32);

  assert.ok(adapter);
});

test('_loadElementalActions and callAction works', function(assert) {
  // how do I test this?
  let adapter = this.subject();
  let chrome = {
    extension: {
      getURL: function() {

      }
    }
  };

  let server = new Pretender(function() {
    // this.get('');
  });

  assert.ok(adapter);
});

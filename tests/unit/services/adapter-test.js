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
  window.chrome = {
    runtime: {
      connect: function() {
        // this func's returned object is a background page connection
      }
    },

    devtools: {
      inspectedWindow: {
        tabId: 32,
        _eval: function(str) {
        }
      }
    },

    extension: {
      getURL: function(url) {
        return 'chrome-extension://testing-id-12345/elemental-actions.js';
      }
    }
  };

  let backgroundPageConnection = {
    postMessage: function(opts) {
    },
    onMessage: {
      addListener: function(callback) {
      }
    }
  };

  // Set up stubs and spies!

  // adapter._setupChromeBackgroundPage Stubs
  let runtimeConnectStub = sinon.stub(window.chrome.runtime, 'connect');
  runtimeConnectStub.returns(backgroundPageConnection);
  let BPCPostMessageSpy = sinon.spy(backgroundPageConnection, 'postMessage');
  let BPCAddListenerStub = sinon.stub(backgroundPageConnection.onMessage, 'addListener');

  // adapter._loadElementalActions Stubs
  let loadElementalActionsDone = assert.async();
  let devtoolsEvalStub = sinon.stub(window.chrome.devtools.inspectedWindow, '_eval');

  // adapter._loadInspectedWindowUrl Stubs
  let loadInspectedWindowUrlDone = assert.async();
  devtoolsEvalStub.withArgs('window.location.origin').callsArgWith(1, 'http://adapter-test:4444');

  fakehr.start();
  let adapter = this.subject();

  adapter._handleIncomingMessage({action: 'el-cs-init-complete'});
  // Once adapter has loaded, start asserting!

  // adapter._setupChromeBackgroundPage Assertions
  assert.equal(runtimeConnectStub.calledOnce, true);
  assert.equal(runtimeConnectStub.calledWith({name: 'elemental-pane'}), true);

  assert.equal(BPCPostMessageSpy.calledWith({ name: 'el-bs-init', tabId: 32 }), true);
  assert.equal(BPCAddListenerStub.calledOnce, true);

  // adapter._loadElementalActions Assertions
  adapter._setupContentScriptDeferred.promise.then(() => {
    let elementalActionsRequest = fakehr.match('get', 'chrome-extension://testing-id-12345/elemental-actions.js');
    elementalActionsRequest.respond(200, {}, 'window.foo = function() {}');
    assert.equal(devtoolsEvalStub.calledWith('window.foo = function() {}//@ sourceURL=elemental-actions.js'), true);
    loadElementalActionsDone();
  });

  // adapter._loadInspectedWindowUrl Assertions
  adapter._loadInspectedWindowUrl().then(url => {
    assert.equal(url, 'http://adapter-test:4444');
    loadInspectedWindowUrlDone();
  });
});

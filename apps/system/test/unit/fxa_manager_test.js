'use strict';

requireApp('system/shared/test/unit/mocks/mock_navigator_moz_set_message_handler.js');
requireApp('system/js/fxa_manager.js');

suite('system/FxAccountManager >', function() {

  var realSetMessageHandler;

  suiteSetup(function() {
    realSetMessageHandler = navigator.mozSetMessageHandler;
    navigator.mozSetMessageHandler = MockNavigatormozSetMessageHandler;
  });

  suiteTeardown(function() {
    navigator.mozSetMessageHandler = realSetMessageHandler;
  });

  setup(function() {
    MockNavigatormozSetMessageHandler.mSetup();
    FxAccountsManager.init();
  });

  teardown(function() {
    MockNavigatormozSetMessageHandler.mTeardown();
  });

  suite('Init', function() {
    test('IAC onmessage handler is bound', function() {
      assert.ok(MockNavigatormozSetMessageHandler.mMessageHandlers[
        'connection'
      ]);
    });
  });
});

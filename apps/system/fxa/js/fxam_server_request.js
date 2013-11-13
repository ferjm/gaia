'use strict';

(function(exports) {

  // We are going to use the following interface
  // https://github.com/mozilla/picl-idp/blob/master/docs/api.md
  // Wrapped by fxa_client.js
  function _mockBehaviour(onsuccess, onerror) {
    setTimeout(function() {
      if ((Math.floor(Math.random() * 2) + 1) % 2) {
        // TODO Add an interface for letting know the module
        // the flow to follow
        var params = {
          registered: true
        };
        onsuccess && onsuccess(params);
      } else {
        onerror && onerror();
      }

    }, 1000);
  }

  var FxModuleServerRequest = {
    checkEmail: function(email, onsuccess, onerror) {
      // TODO:
      // FxAccountsClient.queryAccount(email, onsuccess, onerror);
      // is the method we need. However, we need to figure out if
      // error was due to wrong email, or network connection
      _mockBehaviour(onsuccess, onerror);
    },
    checkPassword: function(email, password, onsuccess, onerror) {
      _mockBehaviour(onsuccess, onerror);
    }
  };
  exports.FxModuleServerRequest = FxModuleServerRequest;
}(this));

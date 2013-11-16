'use strict';

(function(exports) {

  // We are going to use the following interface
  // https://github.com/mozilla/picl-idp/blob/master/docs/api.md
  // Wrapped by fxa_client.js
  function _mockBehaviour(onsuccess, onerror, params) {
    setTimeout(function() {
      if ((Math.floor(Math.random() * 2) + 1) % 2) {
        // TODO Add an interface for letting know the module
        // the flow to follow

        onsuccess && onsuccess(params);
      } else {
        onerror && onerror();
      }

    }, 1000);
  }

  var FxModuleServerRequest = {
    checkEmail: function(email, onsuccess, onerror) {
      window.parent.LazyLoader.load('../js/fxa_client.js', function() {
        window.parent.FxAccountsClient.queryAccount(email, onsuccess, onerror);
      });
    },
    checkPassword: function(email, password, onsuccess, onerror) {
      var params = {
        authenticated: true
      };
      _mockBehaviour(onsuccess, onerror, params);
    },
    createAccount: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signUp(email, password,
                                            onsuccess, onerror);
    },
    requestPasswordReset: function(email, onsuccess, onerror) {
      var params = {
        success: true
      };
      _mockBehaviour(onsuccess, onerror, params);
    }
  };
  exports.FxModuleServerRequest = FxModuleServerRequest;
}(this));

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
        onerror && onerror({
          error: 'SERVER_ERROR'
        });
      }

    }, 1000);
  }

  function _setAccountDetails(response) {
    if (response && response.user.accountId) {
      FxaModuleManager.setParam('email', response.user.accountId);
      FxaModuleManager.setParam('verified', response.user.verified);
    }
  }

  var FxModuleServerRequest = {
    checkEmail: function(email, onsuccess, onerror) {
      window.parent.LazyLoader.load('../js/fxa_client.js', function() {
        window.parent.FxAccountsClient.queryAccount(
                email, onsuccess, onerror);
      });
    },
    signIn: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signIn(
                email, password, successHandler, errorHandler);

      function successHandler(response) {
        _setAccountDetails(response);
        var authenticated =
          (response && response.user && response.user.verified) || false;
        onsuccess({
          // use the response code as specified in
          // https://id.etherpad.mozilla.org/fxa-on-fxos-architecture
          authenticated: authenticated
        });
      }

      function errorHandler(response) {
        // TODO Check error codes
        onerror && onerror(response);
      }
    },
    signUp: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signUp(
                email, password, function(response) {
        _setAccountDetails(response);
        onsuccess(response);
      }, onerror);
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

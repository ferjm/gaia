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
        window.parent.FxAccountsClient.queryAccount(
                email, onsuccess, onerror);
      });
    },
    signIn: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signIn(
                email, password, successHandler, errorHandler);

      function successHandler(response) {
        onsuccess({
          // use the response code as specified in
          // https://id.etherpad.mozilla.org/fxa-on-fxos-architecture
          authenticated: !!response.user
        });
      }

      function errorHandler(response) {
        // TODO - this is only temporary until the IAC client returns the
        // correct error code. See https://pastebin.mozilla.org/3646856
        // expected error codes are in
        // https://id.etherpad.mozilla.org/fxa-on-fxos-architecture
        if (response.message === 'Incorrect password') {
          onsuccess({
            authenticated: false
          });
        } else {
          onerror(response);
        }
      }
    },
    signUp: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signUp(
                email, password, onsuccess, onerror);
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

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
      // TODO:
      // FxAccountsClient.queryAccount(email, onsuccess, onerror);
      // is the method we need. However, we need to figure out if
      // error was due to wrong email, or network connection
      var params = {
        registered: email !== 'newuser@newuser.com'
      };
      _mockBehaviour(onsuccess, onerror, params);
    },
    checkPassword: function(email, password, onsuccess, onerror) {
      var params = {
        authenticated: true
      };
      _mockBehaviour(onsuccess, onerror, params);
    }
  };
  exports.FxModuleServerRequest = FxModuleServerRequest;
}(this));

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

  function logSuccess(callback) {
    return function(response) {
      console.log('**** success: ' + JSON.stringify(response, null, 2));
      callback(response);
    };
  }

  function logError(callback) {
    return function(response) {
      console.error('**** error: ' + JSON.stringify(response, null, 2));
      callback(response);
    };
  }

  var FxModuleServerRequest = {
    checkEmail: function(email, onsuccess, onerror) {
      window.parent.LazyLoader.load('../js/fxa_client.js', function() {
        window.parent.FxAccountsClient.queryAccount(
                email, logSuccess(onsuccess), logError(onerror));
      });
    },
    signIn: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signIn(
                email, password, logSuccess(onsuccess), logError(onerror));
    },
    signUp: function(email, password, onsuccess, onerror) {
      window.parent.FxAccountsClient.signUp(
                email, password, logSuccess(onsuccess), logError(onerror));
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

/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function(exports) {
  var AccountManager = {
    get account() {
      return localStorage['msisdn'] || null;
    },

    signIn: function signIn(phoneNumber, callback) {
      localStorage['msisdn'] = phoneNumber;
      if (callback && typeof callback === 'function') {
        callback();
      }
    },

    signUp: function signUp(phoneNumber, callback) {
      var self = this;
      function _createAccount(endPoint) {
        TokFoxClient.createAccount(
          'msisdn',
          phoneNumber,
          endPoint,
          function(ca_error, ca_result) {

            if (!ca_error) {
              self.signIn(phoneNumber, callback);
              return;
            }
            // TODO: Handle error if any.
            alert('Unable to register the user.');
            window.close();
          }
        );
      }

      if (!Notifications.endPoint) {
        Notifications.init(
        function onMessage(invitationID) {
          CallHandler.onCall(invitationID);
        },
        function onRegistered(error, endPoint) {
          _createAccount(endPoint);
        }
      );
      } else {
        _createAccount(Notifications.endPoint);
      }
    },

    login: function(callback) {
      var self = this;
      UIManager.register(function(phoneNumber) {
        TokFoxClient.accountExist({
          type: 'msisdn',
          value: phoneNumber
        }, function(error, result) {
          // Even if we can't get if the account exists or not, we try to
          // register it.
          if (error || !result.accountExists) {
            self.signUp(phoneNumber, callback);
            return;
          }
          self.signIn(phoneNumber, callback);
        });
      });
    },
  };

  exports.AccountManager = AccountManager;
})(this);

'use strict';

// TODO Review this structure and update the rest of views

var View = {
  0: {
    id: 'fxa-intro',
    handler: {
      ready: false,
      init: function() {

      },
      reset: function() {

      },
      done: function() {

      }
    }
  },
  1: {
    id: 'fxa-email',
    handler: {
      ready: false,
      init: function() {

      },
      reset: function() {

      },
      done: function() {

      },
      onNext: function(callback) {
        FxaModuleOverlay.show('Dummy Signing');
        setTimeout(function() {
          // console.log(document.getElementById('fxa-email-input'));
          // console.log(document.getElementById('fxa-email-input').value);
          var email = document.getElementById('fxa-email-input').value;
          console.log('-----------------------');
          console.log(email);
          console.log('-----------------------');

          FxaModuleManager.setParam('email', email);
          callback && callback();
          FxaModuleOverlay.hide();
        }, 2000);

      },
      onBack: function() {

      }
    }
  },
  2: {
    id: 'fxa-password',
    handler: {
      ready: false,
      init: function(params) {
        document.getElementById('fxa-user-email').innerHTML = params.email;
      },
      reset: function() {

      },
      done: function() {

      },
      onNext: function(callback) {
        FxaModuleOverlay.show('Dummy check of password');
        setTimeout(function() {
          callback && callback();
          FxaModuleOverlay.hide();
        }, 2000);
      }
    }
  },
  3: {
    id: 'fxa-final-summary',
    handler: {
      ready: false,
      init: function(params) {
        document.getElementById('fxa-summary-email').innerHTML = params.email;
      },
      reset: function() {

      },
      done: function() {

      }
    }
  }
};

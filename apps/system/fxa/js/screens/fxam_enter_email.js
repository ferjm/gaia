/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */

FxaModuleEnterEmail = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  function _isEmailValid(emailEl) {
    return emailEl && emailEl.value && emailEl.validity.valid;
  }

  function _loadSignIn(done) {
    done(FxaModuleStates.ENTER_PASSWORD);
  }

  function _loadSignUp(done) {
    done(FxaModuleStates.SET_PASSWORD);
  }

  function _enableNext(emailEl) {
    if (_isEmailValid(emailEl)) {
      FxaModuleUI.enableNextButton();
    } else {
      FxaModuleUI.disableNextButton();
    }
  }

  var Module = Object.create(FxaModule);
  Module.init = function() {
    // Blocks the navigation until check the condition
    _enableNext(this.fxaEmailInput);

    if (this.initialized) {
      return;
    }

    // Cache HTML elements
    this.importElements('fxa-email-input');
    // Add listeners
    this.fxaEmailInput.addEventListener(
      'input',
      function onInput(event) {
        _enableNext(event.target);
      }
    );

    // Avoid to add listener twice
    this.initialized = true;
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleOverlay.show(_('checkingEmail'));

    var email = this.fxaEmailInput.value;

    FxModuleServerRequest.checkEmail(
      email,
      function onServerResponse(response) {
        FxaModuleOverlay.hide();
        FxaModuleManager.setParam('email', email);
        if (response.registered) {
          _loadSignIn(gotoNextStepCallback);
        } else {
          _loadSignUp(gotoNextStepCallback);
        }
      },
      function onNetworkError() {
        FxaModuleOverlay.hide();
        // TODO Add right l10n
        FxaModuleErrorOverlay.show('NETWORK', 'La conexión...');
      }
    );
  };

  Module.onBack = function onBack() {
    FxaModuleUI.enableNextButton();
  };

  return Module;

}());


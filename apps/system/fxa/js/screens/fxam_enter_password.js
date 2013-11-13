/**
 * Module checks the validity of password given email address, and if valid,
 * determine which screen to go to next.
 */

FxaModuleEnterPassword = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  // only checks whether the password passes input validation
  function _isPasswordValid(passwordEl) {
    var passwordValue = passwordEl.value;
    return passwordValue && passwordEl.validity.valid;
  }

  function _enableNext(passwordEl) {
    if (_isPasswordValid(passwordEl)) {
      FxaModuleUI.enableNextButton();
    } else {
      FxaModuleUI.disableNextButton();
    }
  }

  function _showAuthenticationError() {
    FxaModuleErrorOverlay.show(
      _('fxa-authenticating-error-title'),
      _('fxa-authenticating-error-message')
    );
  }

  function _showPasswordMismatch() {
    FxaModuleErrorOverlay.show(
      _('fxa-invalid-password'),
      _('fxa-cannot-authenticate')
    );
  }

  function _loadSigninSuccess(done) {
    done(FxaModuleStates.SIGNIN_SUCCESS);
  }

  function _togglePasswordVisibility() {
    var passwordFieldType = !!this.fxaShowPw.checked ? 'text' : 'password';
    this.fxaPwInput.setAttribute('type', passwordFieldType);
  }

  function _requestPasswordReset(email, done) {
    FxModuleServerRequest.requestPasswordReset(email,
      function(response) {
        done(response.success);
      },
      done.bind(null, false));
  }

  function _showCouldNotResetPassword() {
    FxaModuleErrorOverlay.show(_('fxa-cannot-reset-password'));
  }

  function _forgotPassword() {
    FxaModuleOverlay.show(_('fxa-requesting-password-reset'));
    _requestPasswordReset(this.email, function(isRequestHandled) {
      FxaModuleOverlay.hide();
      if (!isRequestHandled) {
        _showCouldNotResetPassword();
        return;
      }

      FxaModuleStates.setState(FxaModuleStates.PASSWORD_RESET_SUCCESS);
    });
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {

    if (!this.fxaUserEmail) {
      this.importElements(
        'fxa-user-email',
        'fxa-pw-input',
        'fxa-show-pw',
        'fxa-forgot-password'
      );
    }

    if (!options || !options.email) {
      console.error('Options are not sent properly. Email not available');
      return;
    }

    this.fxaPwInput.value = '';
    this.fxaUserEmail.textContent = options.email;
    this.email = options.email;

    _enableNext(this.fxaPwInput);

    if (this.initialized) {
      return;
    }

    // Add listeners
    this.fxaPwInput.addEventListener(
      'input',
      function onInput(event) {
        _enableNext(event.target);
      }
    );

    this.fxaShowPw.addEventListener(
      'change',
      _togglePasswordVisibility.bind(this),
      false
    );

    this.fxaForgotPassword.addEventListener(
      'click',
      _forgotPassword.bind(this),
      false
    );

    this.initialized = true;
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleOverlay.show(_('fxa-authenticating'));

    FxModuleServerRequest.checkPassword(
      this.email,
      this.fxaPwInput.value,
      function onServerResponse(response) {
        FxaModuleOverlay.hide();
        if (response.authenticated) {
          _loadSigninSuccess(gotoNextStepCallback);
        } else {
          _showPasswordMismatch();
        }
      },
      function onNetworkError() {
        FxaModuleOverlay.hide();
        _showAuthenticationError();
      }
    );
  };

  return Module;

}());


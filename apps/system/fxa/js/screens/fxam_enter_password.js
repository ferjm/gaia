/**
 * Module checks the validity of password given email address, and if valid,
 * determine which screen to go to next.
 */

FxaModuleEnterPassword = (function() {
  'use strict';

  var _;

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

  function _cleanForm(passwordEl, passwordCheck) {
    passwordEl.value = '';
    passwordCheck.checked = false;
    passwordEl.setAttribute('type', 'password');
  }

  function _loadSigninSuccess(done) {
    done(FxaModuleStates.SIGNIN_SUCCESS);
  }

  function _notVerifiedUser(done) {
    done(FxaModuleStates.SIGNUP_SUCCESS);
  }

  function _togglePasswordVisibility() {
    var passwordFieldType = !!this.fxaShowPw.checked ? 'text' : 'password';
    this.fxaPwInput.setAttribute('type', passwordFieldType);
  }

  function _requestPasswordReset(email, done) {
    FxModuleServerRequest.requestPasswordReset(
      email,
      function onSuccess(response) {
        done(response.success);
      },
      this.showErrorResponse
    );
  }

  function _showCouldNotResetPassword() {
    this.showErrorResponse({
      error: 'RESET_PASSWORD_ERROR'
    });
  }

  function _forgotPassword() {
    FxaModuleOverlay.show(_('fxa-requesting-password-reset'));
    _requestPasswordReset.call(
      this,
      this.email,
      function(isRequestHandled) {
        FxaModuleOverlay.hide();
        if (!isRequestHandled) {
          _showCouldNotResetPassword.call(this);
          return;
        }

        FxaModuleStates.setState(FxaModuleStates.PASSWORD_RESET_SUCCESS);
      }
    );
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {

    if (!this.initialized) {
      console.log('Se ha inicializado ENTER password');
      // l10n handling
      _ = navigator.mozL10n.get;
      // Cache DOM elements
      this.importElements(
        'fxa-user-email',
        'fxa-pw-input',
        'fxa-show-pw',
        'fxa-forgot-password'
      );
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
      // Avoid repeated initialization
      this.initialized = true;
    }

    if (!options || !options.email) {
      console.error('Options are not sent properly. Email not available');
      return;
    }

    this.fxaUserEmail.textContent = options.email;
    this.email = options.email;

    _cleanForm(
      this.fxaPwInput,
      this.fxaShowPw
    );

    _enableNext(this.fxaPwInput);

  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleOverlay.show(_('fxa-authenticating'));

    FxModuleServerRequest.signIn(
      this.email,
      this.fxaPwInput.value,
      function onServerResponse(response) {
        FxaModuleOverlay.hide();
        if (!response.authenticated) {
          _notVerifiedUser(gotoNextStepCallback);
          return;
        }

        _loadSigninSuccess(gotoNextStepCallback);
      }.bind(this),
      function onError(response) {
        _cleanForm(
          this.fxaPwInput,
          this.fxaShowPw
        );
        this.showErrorResponse(response);
      }.bind(this)
    );
  };

  return Module;

}());


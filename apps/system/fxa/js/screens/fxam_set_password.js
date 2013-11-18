/**
 * Takes care of a new user's set password screen. If password is valid,
 * attempt to stage the user.
 */
FxaModuleSetPassword = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  function isPasswordValid(passwordEl) {
    var passwordValue = passwordEl.value;
    return passwordValue && passwordEl.validity.valid;
  }

  function _requestCreateAccount(email, password, done) {
    FxModuleServerRequest.signUp(email, password,
      function onSuccess(response) {
        done(response.accountCreated);
      }, this.showErrorResponse);
  }

  function _showRegistering() {
    FxaModuleOverlay.show(_('fxa-registering'));
  }

  function _hideRegistering() {
    FxaModuleOverlay.hide();
  }

  function _showUserNotCreated() {
    this.showErrorResponse({
      error: 'CANNOT_CREATE_ACCOUNT'
    });
  }

  function togglePasswordVisibility() {
    var showPassword = !!this.fxaShowPw.checked;
    var passwordFieldType = showPassword ? 'text' : 'password';

    this.fxaPwInput.setAttribute('type', passwordFieldType);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};

    this.importElements(
      'fxa-user-email',
      'fxa-pw-input',
      'fxa-show-pw'
    );

    this.email = options.email;

    this.fxaUserEmail.innerHTML = options.email;

    this.fxaShowPw.addEventListener(
        'change', togglePasswordVisibility.bind(this), false);
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    var password = this.fxaPwInput.value;
    _showRegistering();
    _requestCreateAccount.call(
      this,
      this.email,
      password,
      function(isAccountCreated) {
        _hideRegistering();

        if (! isAccountCreated) {
          _showUserNotCreated.call(this);
          return;
        }

        gotoNextStepCallback(FxaModuleStates.SIGNUP_SUCCESS);
      }
    );
  };

  return Module;

}());


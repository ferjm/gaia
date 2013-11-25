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

  function _showInvalidPassword() {
    FxaModuleErrorOverlay.show(_('fxa-invalid-password'));
  }

  function _requestCreateAccount(email, password, done) {
    FxModuleServerRequest.signUp(email, password,
      function onSuccess(response) {
        done(response.accountCreated);
      },
      done.bind(null, false));
  }

  function _showRegistering() {
    FxaModuleOverlay.show(_('fxa-registering'));
  }

  function _hideRegistering() {
    FxaModuleOverlay.hide();
  }

  function _showUserNotCreated() {
    FxaModuleErrorOverlay.show(_('fxa-cannot-create-account'));
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
    var passwordEl = this.fxaPwInput;

    if (! isPasswordValid(passwordEl)) {
      _showInvalidPassword();
      return;
    }

    var password = passwordEl.value;
    _showRegistering();
    _requestCreateAccount(this.email, password, function(isAccountCreated) {
      _hideRegistering();
      if (! isAccountCreated) {
        _showUserNotCreated();
        return;
      }

      gotoNextStepCallback(FxaModuleStates.SIGNUP_SUCCESS);
    });
  };

  return Module;

}());


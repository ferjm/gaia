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

  function showInvalidPassword() {
    FxaModuleErrorOverlay.show(_('invalidPassword'));
  }

  function setPassword(email, password, done) {
    // TODO - hook up to client lib to stage a user.
    if (password === 'password') return done(true);
    done(false);
  }

  function showRegistering() {
    FxaModuleOverlay.show(_('registering'));
  }

  function hideRegistering() {
    FxaModuleOverlay.hide();
  }

  function showPasswordNotSet() {
    FxaModuleErrorOverlay.show(_('cannotCreateAccount'));
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

    if ( ! isPasswordValid(passwordEl)) {
      return showInvalidPassword();
    }

    var passwordValue = passwordEl.value;
    showRegistering();
    setPassword(this.email, passwordValue, function(isPasswordSet) {
      hideRegistering();
      if ( ! isPasswordSet) {
        return showPasswordNotSet();
      }

      this.passwordValue = passwordValue;
      gotoNextStepCallback(FxaModuleStates.SIGNUP_SUCCESS);
    }.bind(this));
  };

  return Module;

}());


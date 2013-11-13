/**
 */
FxaModuleEnterPassword = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  // only checks whether the password passes input validation
  function isPasswordValid(passwordEl) {
    var passwordValue = passwordEl.value;
    return passwordValue && passwordEl.validity.valid;
  }

  function showPasswordInvalid() {
    FxaModuleErrorOverlay.show(_('invalidPassword'));
  }

  function checkPasswordCorrect(email, password, done) {
    // TODO - hook up to client lib to authenticate a user.
    if (password === 'password') return done(true);
    done(false);
  }

  function showCheckingPassword() {
    FxaModuleOverlay.show(_('authenticating'));
  }

  function hideCheckingPassword() {
    FxaModuleOverlay.hide();
  }

  function showPasswordMismatch() {
    FxaModuleErrorOverlay.show(_('cannotAuthenticate'));
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
      return showPasswordInvalid();
    }

    var passwordValue = passwordEl.value;
    showCheckingPassword();
    checkPasswordCorrect(this.email, passwordValue,
          function(isPasswordCorrect) {
      hideCheckingPassword();
      if (! isPasswordCorrect) {
        return showPasswordMismatch();
      }

      this.passwordValue = passwordValue;
      gotoNextStepCallback(FxaModuleStates.SIGNIN_SUCCESS);
    }.bind(this));
  };

  return Module;

}());


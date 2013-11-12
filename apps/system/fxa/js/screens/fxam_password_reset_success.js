/**
 * Display the password reset success message to the user.
 */
FxaModulePasswordResetSuccess = (function() {
  'use strict';

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};
    this.importElements(
      'fxa-summary-email'
    );
    this.fxaSummaryEmail.innerHTML = options.email;
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    getNextState(gotoNextStepCallback);
  };

  return Module;

}());


/**
 * Display the signup success message to the user.
 */
FxaModuleSigninSuccess = (function() {
  'use strict';

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};
    this.importElements('fxa-summary-email');
    this.fxaSummaryEmail.innerHTML = options.email;
  };

  Module.onNext = function(gotoNextStepCallback) {
    getNextState(gotoNextStepCallback);
  };

  return Module;

}());


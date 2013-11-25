/**
 * Display the signup success message to the user.
 */
FxaModuleSigninSuccess = (function() {
  'use strict';

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};
    this.importElements('fxa-summary-email');
    this.fxaSummaryEmail.textContent = options.email;
  };

  Module.onNext = function(done) {
    done(FxaModuleStates.DONE);
  };

  return Module;

}());


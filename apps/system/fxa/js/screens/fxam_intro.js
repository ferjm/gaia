/**
 * Intro module. Nothing too exciting.
 */
FxaModuleIntro = (function() {
  'use strict';
  var Module = Object.create(FxaModule);
  Module.onNext = function onNext(gotoNextStepCallback) {
    gotoNextStepCallback(FxaModuleStates.ENTER_EMAIL);
  };

  return Module;

}());


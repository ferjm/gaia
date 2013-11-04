'use strict';

var FxaModuleNavigation = {
  view: null,
  stepCount: 0,
  currentStep: null,
  maxSteps: null,
  init: function(flow) {
    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = Object.keys(View).length;
      this.currentStep = this.view[0];

      FxaModuleUI.setMaxSteps(Object.keys(View).length);
      FxaModuleUI.loadStep(this.currentStep.id, 0);
    }.bind(this));
  },
  back: function() {
    this.currentStep = this.view[--this.stepCount];
    FxaModuleUI.loadStep(this.currentStep.id, this.stepCount);
  },
  next: function() {
    var futureIndex = this.stepCount + 1;
    var futureStep = this.view[futureIndex];
    // this.currentStep = this.view[++this.stepCount];
    function loadNextStep() {
      FxaModuleNavigation.currentStep = futureStep;
      FxaModuleNavigation.stepCount++;
      function callback() {
        FxaModuleNavigation.currentStep.handler.init &&
        FxaModuleNavigation.currentStep.handler.init(
          FxaModuleManager.paramsRetrieved
        );
      };

      FxaModuleUI.loadStep(FxaModuleNavigation.currentStep.id,
        FxaModuleNavigation.stepCount,
        callback);
    };


    if (!this.currentStep.handler.onNext) {
      loadNextStep();
    } else {
      this.currentStep.handler.onNext(loadNextStep);
    }
  },
  done: function() {
    FxaModuleManager.done();
  }
};



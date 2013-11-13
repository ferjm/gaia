'use strict';

var FxaModuleNavigation = {
  view: null,
  stepsRun: [],
  stepCount: 0,
  currentStep: null,
  maxSteps: null,
  init: function(flow) {
    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = View.length;

      FxaModuleUI.setMaxSteps(View.length);
      this.loadStep(View.start);
    }.bind(this));
    window.addEventListener('hashchange', this.onHashChange.bind(this), false);
  },
  onHashChange: function(event) {
    var hash = document.location.hash.replace(/^#/, '');

    var step = getStep(hash);
    if (step) {
      FxaModuleUI.loadStep(step, this.stepCount, function(module) {
        this.currentModule = module;
        this.currentStep = step;
      }.bind(this));
    }
  },
  back: function() {
    this.stepCount--;
    var lastStep = this.stepsRun.pop();
    this.loadStep(lastStep);
  },
  loadStep: function(step) {
    document.location.hash = step.id;
  },
  next: function() {
    var loadNextStep = function loadNextStep(nextStep) {
      this.stepCount++;
      this.stepsRun.push(this.currentStep);
      this.loadStep(nextStep);
    };


    this.currentModule.onNext(loadNextStep.bind(this));
  },
  done: function() {
    FxaModuleManager.done();
  }
};

function getStep(hash) {
  for (var stateName in FxaModuleStates) {
    var state = FxaModuleStates[stateName];
    if (typeof state === 'function') continue;

    if (state.id === hash) return state;
  }
}


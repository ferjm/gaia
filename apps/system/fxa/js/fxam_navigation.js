'use strict';

var FxaModuleNavigation = {
  view: null,
  stepCount: 0,
  maxSteps: null,
  init: function(flow) {
    // Listen on hash changes for panel changes
    var self = this;
    window.addEventListener('hashchange', function() {
      if (!location.hash)
        return;

      var panel = document.querySelector(location.hash);
      if (!panel || !panel.classList.contains('screen'))
        return;

      if (self.backAnim) {
        self.backAnim = false;
        self.stepCount--;
        self.loadStep(panel, true);
      } else {
        self.stepCount++;
        self.loadStep(panel);
      }
    }, false);

    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = View.length;

      FxaModuleUI.setMaxSteps(View.length);
      location.hash = View.start.id;
    }.bind(this));
  },
  loadStep: function(panel, back) {
    if (!panel)
      return;

    FxaModuleUI.loadStep({
      step: panel,
      count: this.stepCount,
      back: back,
      callback: function() {
        // not dependent on the callback anymore
      }.bind(this)
    });
  },
  back: function() {
    this.backAnim = true;
    window.history.back();
  },
  next: function() {
    // get a reference to the module responsible for the next button ..
    // TODO(Olav): Let modules live on an object other than window?
    var currentModuleId = location.hash.substr(1);
    this.currentModule = window[this.moduleById(currentModuleId)];
    var loadNextStep = function loadNextStep(nextStep) {
      //TODO(Olav): DONE state is null ..
      if (!nextStep)
        return;
      location.hash = nextStep.id;
    };

    this.currentModule.onNext(loadNextStep.bind(this));
  },
  moduleById: function(id) {
    // TODO (Olav): Make states easier to look up :)
    var moduleKey = Object.keys(FxaModuleStates).filter(function(module) {
      return FxaModuleStates[module] &&
        FxaModuleStates[module].id &&
        FxaModuleStates[module].id === id;
    }).pop();
    if (moduleKey)
      return FxaModuleStates[moduleKey].module;
  },
  done: function() {
    FxaModuleManager.done();
  }
};

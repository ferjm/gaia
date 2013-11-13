

FxaModule = (function() {
  'use strict';

  var Module = {
    initialized: false,
    init: function() {
      // override this to do initialization
    },

    onNext: function(gotoNextStepCallback) {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, call gotoNextStepCallback with the next state from
      // fxam_states.js
    },

    onBack: function() {
      // handle "back" button presses.
    },

    importElements: function() {
      var ids = [].slice.call(arguments, 0);
      ids.forEach(function(id) {
        this[Utils.camelCase(id)] = document.getElementById(id);
      }, this);
    }
  };

  return Module;

}());


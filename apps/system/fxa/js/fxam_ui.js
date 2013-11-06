/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleUI = {
  maxSteps: null,
  init: function(flow) {
    // Add listeners to the main elements
    [
      'close', 'back', 'next', 'navigation', 'done'
    ].forEach(function(id) {
      this[Utils.camelCase(id)] = document.getElementById('fxa-module-' + id);
    }, this);

    this.close.addEventListener('click', function() {
      FxaModuleManager.close();
    });

    this.back.addEventListener('click', function() {
      FxaModuleNavigation.back();
    });

    this.next.addEventListener('click', function() {
      FxaModuleNavigation.next();
    });

    this.done.addEventListener('click', function() {
      FxaModuleManager.done();
    });

    FxaModuleNavigation.init(flow);
  },
  setMaxSteps: function(num) {
    this.maxSteps = num;
  },
  loadStep: function(step, index, callback) {
    var id = step.id;
    var previousStep = document.getElementsByClassName('current')[0];
    var currentStep = document.getElementById(id);

    // Lazy load current panel's HTML
    LazyLoader.load(currentStep, function() {
      // If the panel contains any new script elements,
      // lazy load those as well.
      var scripts = [].slice.call(currentStep.querySelectorAll('script'))
        .map(function(script) { return script.getAttribute('src'); });

      // Once all scripts are loaded, load the modules/UI
      LazyLoader.load(scripts, function() {
        currentStep.classList.add('current');
        if (previousStep) {
          previousStep.classList.remove('current');
        }

        if (index > 0 && index < FxaModuleUI.maxSteps - 1) {
          FxaModuleUI.navigation.classList.remove('navigation-single-button');
          FxaModuleUI.navigation.classList.remove('navigation-back-only');

          if (currentStep.getAttribute('data-navigation') === 'back') {
            FxaModuleUI.navigation.classList.add('navigation-back-only');
          }
        } else {
          FxaModuleUI.navigation.classList.add('navigation-single-button');
          if (index === FxaModuleUI.maxSteps - 1) {
            FxaModuleUI.navigation.classList.add('navigation-done');

          }
        }
        this.progress(100 * (index + 1) / this.maxSteps);

        // the module was just lazy loaded. We can now get a reference to it.
        if (step.module) {
          var module = window[step.module];
          if (module.init) {
            module.init(FxaModuleManager.paramsRetrieved);
          }
        }
        callback && callback(module);
      }.bind(this));
    }.bind(this));
  },
  progress: function(value) {
    document.querySelector('#fxa-progress').value = value;
  },
  setNextText: function(l10n) {
    this.next.textContent = l10n;
  }

  // TODO: Review and add the animation to the panels!

  // animate: function() {
  //   var self = this;

  //   function animTransition() {
  //     var current = document.querySelector('.current');
  //     var next = location.hash ?
  // document.querySelector(location.hash) : null;
  //     var back = current.classList.contains('back');

  //     if (!current || !next)
  //       return;

  //     if (!next.classList.contains('loaded')) {
  //         LazyLoader.load(next, function loaded() {
  //           self._initScreen(next);
  //         });
  //     }

  //     function inTransition(elem) {
  //       if (current.classList.contains('currentToRight'))
  //         return true;
  //       if (current.classList.contains('currentToLeft'))
  //         return true;
  //       if (current.classList.contains('rightToCurrent'))
  //         return true;
  //       if (current.classList.contains('leftToCurrent'))
  //         return true;
  //       return false;
  //     }

  //     if (inTransition(current) || inTransition(next))
  //       return;

  //     current.addEventListener('animationend', function fromAnimEnd() {
  //       current.removeEventListener('animationend', fromAnimEnd, false);
  //       current.classList.remove(back ? 'currentToRight' : 'currentToLeft');
  //       current.classList.remove('current');
  //       current.classList.remove('back');
  //     }, false);
  //     next.addEventListener('animationend', function toAnimEnd() {
  //       next.removeEventListener('animationend', toAnimEnd, false);
  //       next.classList.remove(back ? 'leftToCurrent' : 'rightToCurrent');
  //       next.classList.add('current');
  //     }, false);

  //     current.classList.add(back ? 'currentToRight' : 'currentToLeft');
  //     next.classList.add(back ? 'leftToCurrent' : 'rightToCurrent');
  //   }

  //   window.addEventListener('hashchange', animTransition, false);
  //   First page load
  //   window.addEventListener('load', function() {
  //     var elem = document.querySelector('#fxa-intro');
  //     LazyLoader.load(elem, function() {
  //       Navigation._initScreen(elem);
  //       elem.classList.add('current');
  //     });
  //   }, false);
  // },
};



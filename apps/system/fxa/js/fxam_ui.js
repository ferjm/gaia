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

    this.back.addEventListener('mousedown', function() {
      FxaModuleNavigation.back();
    });

    this.next.addEventListener('mousedown', function() {
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
  loadScreen: function(params) {
    var currentScreen = document.getElementsByClassName('current')[0];
    var nextScreen = params.panel;
    // Lazy load current panel
    LazyLoader.load(nextScreen, function() {
      this._loadScripts(nextScreen, function scriptsLoaded() {
        this._doUiTransition(params, currentScreen, nextScreen);
        params.onload && params.onload();
      }.bind(this));
    }.bind(this));
  },

  _getScripts: function(screen) {
    return [].slice.call(screen.querySelectorAll('script'))
      .map(function(script) { return script.getAttribute('src'); });
  },

  _loadScripts: function(screen, done) {
    var scripts = this._getScripts(screen);

    // LazyLoader only calls the callback if there are scripts to load. If
    // there are not scripts to load, avoid the lazy loader.
    if (! scripts.length) {
      return done();
    }

    LazyLoader.load(scripts, done);
  },

  _doUiTransition: function(params, currentScreen, nextScreen) {
    this._updateNavigation(params, nextScreen);

    this.progress(100 * params.count / this.maxSteps);

    if (nextScreen) {
      this._animate(currentScreen,
                    nextScreen,
                    params.back,
                    params.onanimate);
    }
  },

  _updateNavigation: function(params, nextScreen) {
    if (params.count > 1 && params.count < FxaModuleUI.maxSteps) {
      FxaModuleUI.navigation.classList.remove('navigation-single-button');
      FxaModuleUI.navigation.classList.remove('navigation-back-only');

      if (nextScreen.getAttribute('data-navigation') === 'back') {
        FxaModuleUI.navigation.classList.add('navigation-back-only');
      }
    } else {
      FxaModuleUI.navigation.classList.add('navigation-single-button');
      if (params.count === FxaModuleUI.maxSteps) {
        FxaModuleUI.navigation.classList.add('navigation-done');
      }
    }
  },

  _animate: function(from, to, back, callback) {
    if (!to)
      return;

    if (!from) {
      to.classList.add('current');
      return;
    }

    if (this._inTransition(from) || this._inTransition(to))
      return;

    from.addEventListener('animationend', function fromAnimEnd() {
      from.removeEventListener('animationend', fromAnimEnd, false);
      from.classList.remove(back ? 'currentToRight' : 'currentToLeft');
      from.classList.remove('current');
      from.classList.remove('back');
    }, false);

    to.addEventListener('animationend', function toAnimEnd() {
      to.removeEventListener('animationend', toAnimEnd, false);
      to.classList.remove(back ? 'leftToCurrent' : 'rightToCurrent');
      to.classList.add('current');
      callback && callback();
    }, false);

    from.classList.add(back ? 'currentToRight' : 'currentToLeft');
    to.classList.add(back ? 'leftToCurrent' : 'rightToCurrent');
  },
  _inTransition: function(elem) {
    return elem.classList.contains('currentToRight') ||
    elem.classList.contains('currentToLeft') ||
    elem.classList.contains('rightToCurrent') ||
    elem.classList.contains('leftToCurrent') || false;
  },
  progress: function(value) {
    document.querySelector('#fxa-progress').value = value;
  },
  setNextText: function(l10n) {
    this.next.textContent = l10n;
  },
  disableNextButton: function() {
    this.next.setAttribute('disabled', 'disabled');
  },
  enableNextButton: function() {
    this.next.removeAttribute('disabled');
  }
};

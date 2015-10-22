/* global KeyNavigationAdapter */
/* global SpatialNavigator */
/* exported FxaModuleKeyNavigation */

'use strict';

(function (exports) {

  function getElements(elementNames) {
    var elements = [];

    elementNames.forEach(selector => {
      var element = document.querySelector(selector);
      if (element) {
        elements.push(element);
      }
    });

    return elements;
  }

  var FxaModuleKeyNavigation = {

    enabled: false,

    spatialNavigator: null,

    keyNavigationAdapter: null,

    init(elementNames) {
      var elements = elementNames ? getElements(elementNames) : null;

      this.spatialNavigator = new SpatialNavigator(elements, {
        navigableFilter: elem => {
          if ((elem.offsetWidth <= 0 && elem.offsetHeight <= 0) ||
              elem.disabled) {
            return false;
          }

          return true;
        }
      });

      this.spatialNavigator.on('focus', elem => {
        document.activeElement.blur();
        elem.focus();
      });

      this.keyNavigationAdapter = new KeyNavigationAdapter();

      this.keyNavigationAdapter.init();

      this.keyNavigationAdapter.on('move', key => {
        console.log(key);
        var element = this.spatialNavigator.getFocusedElement();
        if ( element.tagName === 'INPUT' &&
            (element.type === 'email' || element.type === 'password') &&
             element.value.length > 0) {
          if (element.selectionStart === element.selectionEnd &&
              (key === 'left' && element.selectionStart > 0) ||
              (key === 'right' &&
               element.selectionStart < element.value.length)) {
            return;
          }
        }

        if (this.enabled) {
          this.spatialNavigator.move(key);
        }
      });
    },

    add(param) {
      if (Array.isArray(param)) {
        var elements = getElements(param);
        this.spatialNavigator.multiAdd(elements);
        this.spatialNavigator.focus(elements[0]);
      } else {
        var element = document.querySelector(param);
        this.spatialNavigator.add(element);
        this.spatialNavigator.focus(element);
      }

      this.enabled = true;
    },

    remove(param) {
      if (Array.isArray(param)) {
        var elements = getElements(param);
        this.spatialNavigator.multiRemove(elements);
      } else {
        var element = document.querySelector(param);
        this.spatialNavigator.remove(element);
      }
    },

    enable() {
      this.enabled = true;
      this.spatialNavigator.focus();
    },

    disable() {
      this.enabled = false;
    }
  };

  exports.FxaModuleKeyNavigation = FxaModuleKeyNavigation;

})(window);

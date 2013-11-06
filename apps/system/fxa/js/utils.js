/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(exports) {
  'use strict';
  var rdashes = /-(.)/g;
  var Utils = {
    camelCase: function ut_camelCase(str) {
      return str.replace(rdashes, function replacer(str, p1) {
        return p1.toUpperCase();
      });
    },

    once: function(element, eventName, handler) {
      if (typeof element === "string")
        element = document.querySelector(element);

      element.addEventListener(eventName, function handlerDecorator(event) {
        element.removeEventListener(eventName, handlerDecorator, false);
        handler.call(this, event);
      }, false);
    }
  };

  exports.Utils = Utils;

}(this));

/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* global PushHelper */

/* exported Notifications */

var Notifications = (function() {

  var pushHelper, endPoint;
  var isRegistered = false;

  function n_init(onMessage, onRegister) {
    pushHelper = window.PushHelper;
    pushHelper.listen('tokfox', function(version, endPoint, callback) {
      // Send version to the callback
      callback(version);
    }, onMessage);

    endPoint = localStorage['endPoint'];
    
    if (endPoint) {
      onRegister(null, endPoint);
      pushHelper.register();
    } else {
      pushHelper.register(function(channels) {
        n_registerNotifications(channels, onRegister, onMessage);
      });
    }
    pushHelper.init();
  }

  /**
   * Helper function.
   */
  function n_registerNotifications(channels, onRegister, onMessage) {
    if (!channels || channels.length !== 1) {
      window.addEventListener('online', function () {
        if (isRegistered) {
          return;
        }
        pushHelper.reset();
        n_init(onMessage, onRegister);
      }, false);
      return;
    }

    try {
      endPoint = JSON.parse(localStorage['tokfox']).endPoint;
      localStorage['endPoint'] = endPoint;
      
      if (typeof onRegister === 'function') {
        onRegister(null, endPoint);
      }
    } catch (e) {
      if (typeof onRegister === 'function') {
        onRegister({});
      }
    }
  }

  return {
    init: n_init,
    get endPoint() {
      return endPoint || null;
    }
  };
})();

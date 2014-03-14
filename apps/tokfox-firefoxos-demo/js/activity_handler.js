/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* global UIManager, CallHandler, Notifications */

/* exported ActivityHandler */

(function(exports) {
  function _handle(activity) {
    if (activity.source.name != 'dial') {
      return;
    }

    var number = activity.source.data.number;
    if (!number) {
      return;
    }

    if (!AccountManager.account) {
      AccountManager.login(function() {
        LoadingOverlay.hide();
        _makeCall(number);
      });
    } else {
      _makeCall(number);
    }
  }

  function _makeCall(number) {
    UIManager.call(null, number, function() {
      window.close();
    });

    CallHandler.dial({
       type: 'msisdn',
       value: number
    }, function(error, result) {
      if (error) {
        window.close();
      }
    });
  }

  var ActivityHandler = {
    init: function ah_init() {
      window.navigator.mozSetMessageHandler('activity', _handle);
    }
  };
  exports.ActivityHandler = ActivityHandler;
})(this);

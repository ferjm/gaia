/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* global Notifications, TokFoxClient */

window.addEventListener('load', function callSetup(evt) {
  window.removeEventListener('load', callSetup);
  if (!window.navigator.mozSetMessageHandler) {
    UIManager.outgoing(function(number, callback) {
      CallHandler.dial({
         type: 'msisdn',
         value: number
      }, callback);
    });
    return;
  }


  Notifications.init(
    function onMessage(invitationID) {
      CallHandler.onCall(invitationID);
    },
    function onRegistered(error, endPoint) {
      // TODO
    }
  );

  UIManager.init();
  ActivityHandler.init();
});

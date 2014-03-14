/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var TokFoxFxOSDemo = {
  apiKey: '44675192',
  // TODO hardcoded for now.
  sessionId: '2_MX40NDY3NTE5Mn5-V2VkIE1hciAxMiAwNDo0NTo1OSBQRFQgMjAxNH4wLjkyMjMyNjI3fg',
  token: 'T1==cGFydG5lcl9pZD00NDY3NTE5MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz1jYTE4OTg3ZTEzNjQ0ZjZjZDZkMDU0OGZkNDUwMWY1Y2FlYzUwZmZhOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9Ml9NWDQwTkRZM05URTVNbjUtVjJWa0lFMWhjaUF4TWlBd05EbzBOVG8xT1NCUVJGUWdNakF4Tkg0d0xqa3lNak15TmpJM2ZnJmNyZWF0ZV90aW1lPTEzOTQ2MjQ3Njcmbm9uY2U9MC43ODU2ODgwNTk5MzcwNjk5JmV4cGlyZV90aW1lPTEzOTcyMTY3NTUmY29ubmVjdGlvbl9kYXRhPQ==',

  init: function tfd_init() {
    document.getElementById('buttons_container').addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') {
        return;
      }
      switch(e.target.dataset.action) {
        case 'join-session':
          console.log('ACCION DE JOIN');
          CallHandler.join(
            this.apiKey,
            this.sessionId,
            this.token,
            null,
            function() {
              alert('CONECTADO A LA SESSION');
            },
            function() {
              alert('NUEVO STREAM');
            }
          );
          break;
        case 'dial':
          // TODO Add this functionality
          CallHandler.join(
            {
              type: 'msisdn',
              value: '+34612123123'
            },
            function() {
              alert('Invitation SENT')
            }
          );
          break;
        case 'call-test':
          CallHandler.join(
            this.apiKey,
            this.sessionId,
            this.token,
            'emitter-video',
            function() {
              // alert('CONECTADO A LA SESSION');
            },
            function() {
              // alert('NUEVO STREAM');
            }
          );
          break;
        case 'register':
          Notifications.listen(function onNotification() {
          });
          Notifications.register(function onRegister(error, result) {
            alert(JSON.stringify(result));
          });
          break;
        case 'call-log-test':
          CallLog.add('incoming', 'connected', '1234');
          break;
        default:
          console.warn('Action not defined');
        }
    }.bind(this));
  }
};

window.addEventListener('load', function callSetup(evt) {
  window.removeEventListener('load', callSetup);

  TokFoxFxOSDemo.init();
});

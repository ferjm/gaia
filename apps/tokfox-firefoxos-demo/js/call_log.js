'use strict';

(function(exports) {

  var callLogPort = null;

  var request = navigator.mozApps.getSelf();
  request.onsuccess = function onSuccess(evt) {
    var app = evt.target.result;
    if (!app) {
      console.error('Could not connect with call log');
      return;
    }

    app.connect('call-log-add').then(function(ports) {
      if (!ports || ports.length !== 1) {
        return;
      }
      callLogPort = ports[0];
    });
  };

  request.onerror = function onError() {
    console.error('Could not connect with call log');
  };

  var CallLog = {
    add: function add(type, status, number) {
      if (!callLogPort) {
        return;
      }
      callLogPort.postMessage({
        recent: {
          type: type,
          status: status,
          number: number,
          date: Date.now()
        }
      });
    }
  };

  exports.CallLog = CallLog;
})(this);

/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* exported TokFoxClient */

var TokFoxClient = (function TokFoxClient() {
  /**
   * Default root URL for TokFox API.
   */
  var DEFAULT_ROOT_URL = 'http://tokfox.herokuapp.com';

  /** Debug flag. */
  var debug = false;

  /** URL for TokFox API. */
  var rootUrl = DEFAULT_ROOT_URL;

  /**
   *
   */
  function createAccount(aliasType, aliasValue, pushEndpoint, callback) {
    var options = {};

    options.uri = rootUrl + '/account/';
    options.method = 'POST';
    options.body = {};
    options.body.alias = {};
    options.body.alias.type = aliasType;
    options.body.alias.value = aliasValue;
    options.body.pushEndpoint = pushEndpoint;

    request(options, function onRequestPerformed(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  /**
   *
   */
  function getAccounts(callback) {
    var options = {};

    options.uri = rootUrl + '/account/';
    options.method = 'GET';
    options.body = {};

    request(options, function onRequestPerformed(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  function accountExist(alias, callback) {
    var options = {};

    options.uri = rootUrl + '/account/' + alias.type + '/' + alias.value;
    options.method = 'GET';

    request(options, function onDone(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  /**
   *
   */
  function createSession(role, sesssioId, callback) {
    var options = {};

    options.uri = rootUrl + '/session/';
    options.method = 'POST';
    options.body = {};
    if (role) {
      options.body.role = role;
    }
    if (sesssioId) {
      options.body.sesssioId = sesssioId;
    }

    request(options, function onRequestPerformed(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  /**
   *
   */
  function invite(aliasType, aliasValue, sessionId, callback) {
    var options = {};

    options.uri = rootUrl + '/session/invitation/';
    options.method = 'POST';
    options.body = {};
    options.body.alias = {};
    options.body.alias.type = aliasType;
    options.body.alias.value = aliasValue;
    options.body.sessionId = sessionId;

    request(options, function onRequestPerformed(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  /**
   *
   */
  function acceptInvitation(invitationId, callback) {
    var options = {};

    options.uri = rootUrl + '/session/invitation/' + invitationId;
    options.method = 'GET';
    options.body = {};

    request(options, function onRequestPerformed(error, result) {
      if (callback && (typeof callback === 'function')) {
        callback(error, result);
      }
    });
  }

  var _timeoutError = {
    "code": 600,
    "error": "Timeout error", // string description of the error type
    "message": "Request exceed the timeout",
    "info": "https://docs.endpoint/errors/1234" // link to more info on the error
  };

  /**
   *
   */
  function request(options, callback) {
    if (debug) {
      dump('options is ' + JSON.stringify(options));
    }

    var req = new XMLHttpRequest({mozSystem: true});
    req.open(options.method, options.uri, true);
    req.responseType = 'json';
    req.timeout = 15000;

    req.onload = function () {
      if (req.status !== 200) {
        // Response in error case. The error object is defined
        // in the API.
        callback(req.response);
        return;
      }
      // If the code is 200, we need to retrieve the response
      if (typeof callback === 'function') {
        var result = !req.response ? 'OK' : req.response;
        callback(null, result);
      }
    };

    req.onerror = function (event) {
      console.log('ERROR ' + event.target.status);
      callback(event.target.status, null);
    };

    req.ontimeout = function () {
      callback(_timeoutError);
    };

    // Send the request
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(options.body));
  }

  /**
   *
   */
  function dump(msg) {
    if (debug) {
      console.log(msg);
    }
  }

  // Pulic API
  return {
   'debug': debug,
   'rootUrl': rootUrl,
   'createSession': createSession,
   'invite': invite,
   'acceptInvitation': acceptInvitation,
   'createAccount': createAccount,
   'getAccounts': getAccounts,
   'accountExist': accountExist
  };
})();

if ((typeof module === 'undefined') && window) {
  window.TokFoxClient = TokFoxClient;
} else {
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  module.exports = TokFoxClient;
}

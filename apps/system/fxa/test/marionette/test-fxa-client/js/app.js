'use strict';
/* global FxAccountsIACHelper */

var hideTimer;
var Overlay = {
    show: function fxam_overlay_show() {
      if (hideTimer) {
        return;
      }
      var overlay = document.querySelector('#overlay');
      overlay.classList.add('show');
      hideTimer = setTimeout(Overlay.hide, 2000);
    },
    hide: function fxam_overlay_hide() {
      hideTimer = clearTimeout(hideTimer);
      var overlay = document.querySelector('#overlay');
      if (!overlay) {
        return;
      }
      overlay.classList.remove('show');
    }
};

var TestFxAClient = function TestFxAClient() {

  var getFxAccountsButton, getKeysButton, launchFxAFlowButton,
      logoutButton, refreshAuthButton, resultTextEl, resultEl,
      timer, eventsEl, eventsTextEl, eventsTimer, accountIdInput;

  var init = function init() {
    resultEl = document.getElementById('result');
    resultTextEl = document.getElementById('result-text');
    getFxAccountsButton = document.getElementById('getAccount');
    getKeysButton = document.getElementById('getKeys');
    launchFxAFlowButton = document.getElementById('openFlow');
    logoutButton = document.getElementById('logout');
    refreshAuthButton = document.getElementById('refreshAuthentication');
    eventsEl = document.getElementById('events');
    eventsTextEl = document.getElementById('events-text');
    accountIdInput = document.getElementById('accountId');

    [getFxAccountsButton, getKeysButton, launchFxAFlowButton,
     logoutButton, refreshAuthButton].forEach((button) => {
      button.addEventListener('click', handler);
    });

    FxAccountsIACHelper.addEventListener('onlogin', function() {
      showEvent('onlogin');
    });

    FxAccountsIACHelper.addEventListener('onlogout', function() {
      showEvent('onlogout');
    });

    FxAccountsIACHelper.addEventListener('onverifiedlogin', function() {
      showEvent('onverifiedlogin');
    });
  };

  function _setResponse(response, errorDebug) {
    resultTextEl.innerHTML = '';

    var text = document.createTextNode((errorDebug)? 'Error ' : 'Success :');
    resultTextEl.appendChild(text);
    var responseBeautyfied =
      document.createTextNode(JSON.stringify(response || 'No params', null, 4));
    resultTextEl.appendChild(responseBeautyfied);

    clearTimeout(timer);
    resultEl.classList.add('show');
    timer = setTimeout(function() {
      resultEl.classList.remove('show');
    }, 3000);
  }

  function showEvent(eventName) {
    eventsTextEl.innerHTML = '';

    var text = document.createTextNode('Event received: ' + eventName);
    eventsTextEl.appendChild(text);

    clearTimeout(timer);
    eventsEl.classList.add('show');
    eventsTimer = setTimeout(function() {
      eventsEl.classList.remove('show');
    }, 5000);
  }

  var showResponse = function showResponse(response) {
    Overlay.hide();
    _setResponse(response);
  };

  var showError = function showResponse(response) {
    Overlay.hide();
    _setResponse(response, true);
  };

  var handler = function handler(evt) {
    var method = evt.target.id;
    switch (method) {
      case 'openFlow':
        FxAccountsIACHelper[method](showResponse, showError);
        break;
      case 'getAccount':
      case 'getKeys':
      case 'logout':
        Overlay.show();
        FxAccountsIACHelper[method](showResponse, showError);
        break;
      case 'refreshAuthentication':
        FxAccountsIACHelper[method](accountIdInput.value,
                                    showResponse, showError);
        break;
    }


  };

  return {
    'init': init
  };

}();

TestFxAClient.init();

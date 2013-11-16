'use strict';

var TestFxAClient = function TestFxAClient() {

  var getFxAccountsButton, launchFxAFlowButton, logoutButton,
      changePasswordButton;

  var init = function init() {
    getFxAccountsButton = document.getElementById('getAccounts');
    launchFxAFlowButton = document.getElementById('openFlow');
    logoutButton = document.getElementById('logout');
    changePasswordButton = document.getElementById('changePassword');

    getFxAccountsButton.addEventListener('click', handler);
    launchFxAFlowButton.addEventListener('click', handler);
    logoutButton.addEventListener('click', handler);
    changePasswordButton.addEventListener('click', handler);
  };

  var showResponse = function showResponse(response) {
    alert('Success: ' + JSON.stringify(response));
  };
  var showError = function showResponse(response) {
    alert('Error: ' + JSON.stringify(response));
  };

  var handler = function handler(evt) {
    var method = evt.target.id;
    switch (method) {
      case 'getAccounts':
      case 'openFlow':
      case 'logout':
        FxAccountsIACHelper[method](showResponse, showError);
        break;
      case 'changePassword':
        FxAccountsIACHelper[method]('dummy@domain.org', showResponse,
                                    showError);
        break;
    }

    if (FxAccountsIACHelper[method]) {
    }
  };

  return {
    'init': init
  };

}();

TestFxAClient.init();

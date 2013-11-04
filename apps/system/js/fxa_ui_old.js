/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/**
 * Check fxa_manager.js for a further explanation about Firefox Accounts and
 * its architecture in Firefox OS.
 */

'use strict';

//**** DUMMY TEST *****

var FxAccountsUI = {

  _successCb: null,
  _errorCb: null,
  _dialog: document.getElementById('fxa-dialog'),
  _screen: document.getElementById('screen'),
  _closeButton: document.getElementById('fxa-close-dialog'),
  _deleteAccountButton: document.getElementById('fxa-delete-account'),
  _getAccountsButton: document.getElementById('fxa-get-accounts'),
  _logoutButton: document.getElementById('fxa-logout'),
  _queryAccountButton: document.getElementById('fxa-query-account'),
  _signInButton: document.getElementById('fxa-sign-in'),
  _signUpButton: document.getElementById('fxa-sign-up'),
  _result: document.getElementById('fxa-result'),

  init: function init() {
    this._closeButton.addEventListener('click', this.closeFlow.bind(this));
    this._deleteAccountButton.addEventListener('click', this.deleteAccount);
    this._getAccountsButton.addEventListener('click', this.getAccounts);
    this._logoutButton.addEventListener('click', this.logout);
    this._queryAccountButton.addEventListener('click', this.queryAccount);
    this._signInButton.addEventListener('click', this.signIn);
    this._signUpButton.addEventListener('click', this.signUp);
  },

  openFlow: function openFlow(entryPoint, accountId, successCb, errorCb) {
    // Temporary stuff.
    if (successCb && successCb instanceof Function) {
      this._successCb = successCb;
    }
    if (errorCb && errorCb instanceof Function) {
      this._errorCb = errorCb;
    }

    this._screen.classList.add('fxa-dialog');
  },

  closeFlow: function closeFlow(error, result) {
    this._screen.classList.remove('fxa-dialog');

    if (result && this._successCb) {
      this._successCb(result);
    } else if (error && this._errorCb) {
      this._errorCb(error);
    }
  },

  showResult: function showResult(result) {
    FxAccountsUI._result.innerHTML = result;
  },

  deleteAccount: function deleteAccount() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.deleteAccount('dummy@domain.org', 'pass',
                                     FxAccountsUI.showResult,
                                     FxAccountsUI.showResult);
    });
  },

  getAccounts: function getAccounts() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.getAccounts(FxAccountsUI.showResult,
                                   FxAccountsUI.showResult);
    });
  },

  logout: function logout() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.logout('dummy@domain.org', 'pass',
                              FxAccountsUI.showResult,
                              FxAccountsUI.showResult);
    });
  },

  queryAccount: function queryAccount() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.queryAccount(FxAccountsUI.showResult,
                                    FxAccountsUI.showResult);
    });
  },

  signIn: function signIn() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.signIn('dummy@domain.org', 'pass',
                              FxAccountsUI.showResult,
                              FxAccountsUI.showResult);
    });
  },

  signUp: function signUp() {
    LazyLoader.load('js/fxa_client.js', function() {
      FxAccountsClient.signUp('dummy@domain.org', 'pass',
                              FxAccountsUI.showResult,
                              FxAccountsUI.showResult);
    });
  }
};

FxAccountsUI.init();

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(exports) {
  'use strict';
  var Errors = {
    CANNOT_CREATE_ACCOUNT: {
      title: 'fxa-cannot-create-title',
      message: 'fxa-cannot-create-message'
    },
    RESET_PASSWORD_ERROR: {
      title: 'fxa-reset-password-error-title',
      message: 'fxa-reset-password-error-message'
    },
    INVALID_ACCOUNTID: {
      title: 'fxa-invalid-email-title',
      message: 'fxa-invalid-email-message'
    },
    INVALID_PASSWORD: {
      title: 'fxa-invalid-password-title',
      message: 'fxa-invalid-password-message'
    },
    INTERNAL_ERROR_NO_CLIENT: {
      title: 'fxa-generic-error-title',
      message: 'fxa-generic-error-message'
    },
    ALREADY_SIGNED_IN_USER: {
      title: 'fxa-already-signed-in-title',
      message: 'fxa-already-signed-in-message'
    },
    INTERNAL_ERROR_INVALID_USER: {
      title: 'fxa-generic-error-title',
      message: 'fxa-generic-error-message'
    },
    SERVER_ERROR: {
      title: 'fxa-generic-error-title',
      message: 'fxa-generic-error-message'
    },
    NO_TOKEN_SESSION: {
      title: 'fxa-generic-error-title',
      message: 'fxa-generic-error-message'
    },
    GENERIC_ERROR: {
      title: 'fxa-generic-error-title',
      message: 'fxa-generic-error-message'
    }
  };

  function _getError(error) {
    var _ = navigator.mozL10n.get;
    var l10nKeys = Errors[error];
    return {
      title: _(l10nKeys.title),
      message: _(l10nKeys.message)
    };
  }



  var FxaModuleErrors = {
    responseToParams: function(response) {
      var config;
      // TODO Check from server all error messages
      if (response && response.error && !response.info) {
        console.warn('Error is ' + response.error);
        config = _getError(response.error);
      }

      if (!config) {
        console.warn('Invalid response sent to responseToParams');
        // If there is no config, just display the response to the user
        config = _getError('GENERIC_ERROR');
      }

      return config;
    }
  };

  exports.FxaModuleErrors = FxaModuleErrors;
}(this));

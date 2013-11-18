
FxaModuleErrors = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  var Errors = {
    CANNOT_CREATE_ACCOUNT: {
      title: _('fxa-cannot-create-title'),
      message: _('fxa-cannot-create-message')
    },
    RESET_PASSWORD_ERROR: {
      title: _('fxa-reset-password-error-title'),
      message: _('fxa-reset-password-error-message')
    },
    INVALID_ACCOUNTID: {
      title: _('fxa-invalid-email-title'),
      message: _('fxa-invalid-email-message')
    },
    INVALID_PASSWORD: {
      title: _('fxa-invalid-password-title'),
      message: _('fxa-invalid-password-message')
    },
    INTERNAL_ERROR_NO_CLIENT: {
      title: _('fxa-generic-error-title'),
      message: _('fxa-generic-error-message')
    },
    ALREADY_SIGNED_IN_USER: {
      title: _('fxa-already-signed-in-title'),
      message: _('fxa-already-signed-in-message')
    },
    INTERNAL_ERROR_INVALID_USER: {
      title: _('fxa-generic-error-title'),
      message: _('fxa-generic-error-message')
    },
    SERVER_ERROR: {
      title: _('fxa-generic-error-title'),
      message: _('fxa-generic-error-message')
    },
    NO_TOKEN_SESSION: {
      title: _('fxa-generic-error-title'),
      message: _('fxa-generic-error-message')
    }
  };

  return {
    responseToParams: function(response) {
      var config;

      if (response && response.error) {
        console.warn('Error is ' + response.error);
        config = Errors[response.error];
      }

      if (!config) {
        console.warn('Invalid response sent to responseToParams');
        // If there is no config, just display the response to the user
        config = {
          title: _('fxa-generic-error-title'),
          message: _('fxa-generic-error-message')
        };
      }

      return config;
    }
  };
}());


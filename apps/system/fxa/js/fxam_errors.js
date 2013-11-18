
FxaModuleErrors = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  var Errors = {
    INVALID_ACCOUNTID: {
      title: _('fxa-invalid-email-address')
    },
    INVALID_PASSWORD: {
      title: _('fxa-invalid-password')
    },
    INTERNAL_ERROR_NO_CLIENT: {
      title: _('fxa-no-client')
    },
    ALREADY_SIGNED_IN_USER: {
      title: _('fxa-already-signed-in')
    },
    INTERNAL_ERROR_INVALID_USER: {
      title: _('fxa-invalid-user')
    },
    SERVER_ERROR: {
      title: _('fxa-server-error')
    },
    NO_TOKEN_SESSION: {
      title: _('fxa-no-token')
    }
  };

  return {
    responseToConfig: function(response) {
      if (!response.error) return;
      return Errors[response.error];
    }
  };
}());


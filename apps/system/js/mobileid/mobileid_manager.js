/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* global MobileIdDialog */

// Event names.
const CONTENT_EVENT = 'mozMobileIdContentEvent';
const UNSOLICITED_EVENT = 'mozMobileIdUnsolContentEvent';

// States.
const INITIAL_STATE = 0;

var MobileIdManager = {

  init: function mobileid_init() {
    window.addEventListener('mozMobileIdChromeEvent',
                            this.onChromeEvent.bind(this));
  },

  cleanup: function mobileid_cleanup() {
    this.state = null;
    this.ui = null;
  },

  onUIHide: function mobileid_onUIHide() {
    if (!this.result) {
      this.cancel();
    }
  },

  onUIAction: function mobileid_onUIAction(dialogResult) {
    switch (this.state) {
      case INITIAL_STATE:
        //TODO process result. For now just return the external number.
        this.sendContentEvent(CONTENT_EVENT, {
          id: this.chromeEventId,
          result: {
            msisdn: dialogResult.externalPhone,
            serviceId: dialogResult.serviceId
          }
        });
        break;
    }
  },

  sendContentEvent: function mobileid_sendContentEvent(eventName, msg) {
    var event = new CustomEvent(eventName, {
      detail: msg
    });
    window.dispatchEvent(event);
  },

  cancel: function mobileid_cancel() {
    this.sendContentEvent(UNSOLICITED_EVENT, {
      eventName: 'cancel'
    });
    this.cleanup();
  },

  parsePhoneInfo: function mobileid_parsePhoneInfo(phoneInfo) {
    var primaryPhone;
    var phones;
    if (phoneInfo) {
      for (var i = 0; i < phoneInfo.length; i++) {
        var phone = phoneInfo[i];
        if (phone.primary) {
          primaryPhone = phone.msisdn;
          continue;
        }
        if (phone.msisdn ||
            (phone.canDoSilentVerification && phone.operator)) {
          if (!phones) {
            phones = [];
          }
          var phoneValue = phone.msisdn || phone.operator;
          phones.push({
            value: phoneValue,
            operator: (phoneValue == phone.operator)
          });
        }
      }
    }

    return {
      primaryPhone: primaryPhone,
      phones: phones
    };
  },

  onPermissionPromptRequest:
    function mobileid_onPermissionPromptRequest(phoneNumberInfo) {
    var phoneInfo = this.parsePhoneInfo(phoneNumberInfo);
    this.state = INITIAL_STATE;
    this.ui = new MobileIdDialog({
      onHide: this.onUIHide.bind(this),
      onAction: this.onUIAction.bind(this),
      type: 'permission',
      action: 'allow',
      primaryPhone: phoneInfo.primaryPhone,
      phones: phoneInfo.phones
    });
    this.ui.show();
  },

  onChromeEvent: function mobileid_onChromeEvent(event) {
    if (!event || !event.detail) {
      console.error('Wrong event');
      return;
    }

    var message = event.detail;

    console.log('Message ' + JSON.stringify(message));

    if (message.id) {
      this.chromeEventId = message.id;
    }

    switch (message.eventName) {
      case 'permissionPrompt':
        this.onPermissionPromptRequest(message.data.phoneNumberInfo);
        break;
      case 'onverifying':
        if (!this.ui) {
          return;
        }
        this.ui.changeAction('Verifying');
        break;
      case 'onverified':
      case 'onerror':
        break;
      default:
        console.error('Wrong eventName ' + message.eventName);
    }
  }
};

MobileIdManager.init();

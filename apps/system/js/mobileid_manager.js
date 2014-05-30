/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

/* global MobileIdDialog */

// Event names.
const CONTENT_EVENT = 'mozMobileIdContentEvent';
const UNSOLICITED_EVENT = 'mozMobileIdUnsolContentEvent';

var MobileIdManager = {
  dialog: null,
  iframe: null,
  init: function mobileid_init() {
    // Add listener to the events from Gecko related with the
    // Mobile ID
    window.addEventListener(
      'mozMobileIdChromeEvent',
      this.onChromeEvent.bind(this)
    );
  },

  onChromeEvent: function mobileid_onChromeEvent(event) {
    if (!event || !event.detail) {
      console.error('Wrong event');
      return;
    }

    var message = event.detail;
    var params = message.data;

    if (message.id) {
      this.chromeEventId = message.id;
    }

    switch (message.eventName) {
      case 'onpermissionrequest':
        // If the user introduced a wrong phone number we will be receiving
        // an "onerror" notifying about the incorrect input followed by a new
        // "onpermissionrequest" restarting the mobileid flow. If that's the
        // case as we would already have an opened dialog, we just bail out
        // discarding the event.
        if (this.dialog) {
          return;
        }
        this.openDialog(params);
        break;
      default:
        this.sendEventToDialog(message.eventName, params);
    }
  },

  cleanup: function mobileid_cleanup() {
    this.iframe = null;
    this.dialog = null;
  },

  cancel: function mobileid_cancel(isVerificationDone) {
    // Once the UI is closed we clean the vars
    this.cleanup();

    // Let the backend close this as an error
    if (!isVerificationDone) {
      this.sendContentEvent(UNSOLICITED_EVENT, {
        eventName: 'cancel'
      });
    }
  },

  close: function mobileid_close(isVerificationDone) {
    if (!this.dialog) {
      return;
    }
    // Close with transition
    this.dialog.close(this.cancel.bind(this, isVerificationDone));
  },

  sendMsisdn: function mobileid_close(msisdnSelected) {
    // Send info retrieved from UI to API
    this.sendContentEvent(CONTENT_EVENT, {
      id: this.chromeEventId || null,
      result: msisdnSelected
    });
  },

  sendVerificationCode: function mobileid_sendVerificationCode(code) {
    console.log('Our verification code is ' + code);
    this.sendContentEvent(CONTENT_EVENT, {
      id: this.chromeEventId || null,
      result: {
        verificationCode: code || ''
      }
    });
  },

  requestNewCode: function mobileid_askForNewCode() {
    this.sendContentEvent(
      UNSOLICITED_EVENT,
      {
        eventName: 'resendcode'
      }
    );
  },

  sendContentEvent: function mobileid_sendContentEvent(eventName, msg) {
    var event = new CustomEvent(eventName, {
      detail: msg
    });
    window.dispatchEvent(event);
  },

  sendEventToDialog: function mobileid_sendContentEvent(eventName, params) {
    if (!this.iframe) {
      return;
    }

    var event = new CustomEvent(
      eventName,
      {
        detail: params
      }
    );
    this.iframe.contentWindow.dispatchEvent(event);
  },

  openDialog: function mobileid_openDialog(params) {
    // Create Dialog
    this.dialog = new MobileIdDialog();
    // Create & Append the iframe
    this.panel = this.dialog.getView();
    this.iframe = this.dialog.createIframe(function onLoaded() {
      // Once the iframe is loaded, we send the params to render
      MobileIdManager.sendEventToDialog('init', params);
      // We open with a transition
      this.dialog.open(function onOpened() {
        // Once the iframe is loaded, we send the params to render
        MobileIdManager.sendEventToDialog('shown');
      });
    }.bind(this));
  }
};

MobileIdManager.init();

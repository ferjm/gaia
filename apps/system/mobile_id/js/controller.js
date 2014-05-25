
/* exports Controller */
/* global UI */

(function(exports) {
  'use strict';
  var Controller = {
    init: function c_init() {
      window.addEventListener(
        'init',
        this
      );
      window.addEventListener(
        'shown',
        this
      );
      window.addEventListener(
        'onverifying',
        this
      );
      window.addEventListener(
        'onverified',
        this
      );
      window.addEventListener(
        'onerror',
        this
      );
      window.addEventListener(
        'onverificationcode',
        this
      );
    },
    handleEvent: function c_handleEvent(e) {
      switch(e.type) {
        case 'init':
          UI.render(e.detail);
          break;
        case 'shown':
          UI.setScroll(e.detail);
          break;
        case 'onverifying':
          UI.onVerifying();
          break;
        case 'onverified':
          UI.onVerified();
          break;
        case 'onerror':
          UI.onerror(e.detail.error);
          break;
        case 'onverificationcode':
          UI.onVerificationCode(e.detail);
          break;
      }
    },
    postIdentity: function c_postIdentity(params) {
      window.parent.MobileIdManager.sendMsisdn(params);
    },
    postVerificationCode: function c_postIdentity(params) {
      window.parent.MobileIdManager.sendVerificationCode(params);
    },
    postCloseAction: function c_postCloseAction(isVerified) {
      window.parent.MobileIdManager.close(isVerified);
    }
  };

  exports.Controller = Controller;

}(this));

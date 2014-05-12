/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* global HtmlHelper */

'use strict';

(function(exports) {

  /**
   * @class MobileIdDialog
   * @param {options} object for attributes `onShow`, `onHide`,
                      `onAction` callbacks and details about the dialog
                      such as dialog `type`, `primaryPhone` and `phones`.
   * extends SystemDialog
   */
  var MobileIdDialog = function MobileIdDialog(options) {
    if (options) {
      this.options = options;
    }
    this.render();
    this.publish('created');
  };

  MobileIdDialog.prototype = {
    
    __proto__: window.SystemDialog.prototype,

    customID: 'mobileid-dialog',

    DEBUG: false,

    permissionSection: function mobileid_permissionSection() {
      if (this.options.type != 'permission') {
        return '';
      }

      return '<section id="mobileid-permission">' +
             '  <span class="message">' +
             '    App wants to know your phone number. ' +
                  this.options.primaryPhone +
             '  </span>' +
             '</section>';
    },

    phoneOptionsSection: function mobileid_phoneOptionsSection() {
      if (this.options.type != 'permission') {
        return '';
      }
      
      var section = '<section id="mobileid-phone-options">';
      
      if (this.options.phones && this.options.phones.length) {
        section += '  <ul>';
        for (var i = 0; i < this.options.phones.length; i++) {
          section += '<li>' +
                     '  <input type="radio" id="mobileid-phone-option" ' +
                     '         value="' + i + '"' +
                     '         name="mobileid-phone-option"/>';
                     '  <span>' +
                     this.options.phones[i].value +
                     '  </span>' +
                     '</li>';
        }
        section += '</ul>';
      }

      section += '  <input type="tel" id="mobileid-external-phone" ' +
                 '         placeholder="External phone number"/>' +
                 '</section>';

      return section;
    },

    mainView: function mobileid_phoneOptionsSection() {
      var view;
      switch (this.options.type) {
        case 'permission':
          view = '<article class="vertical">' +
                   this.permissionSection() +
                   this.phoneOptionsSection() +
                 '</article>';
          break;
      }
      return view;
    },

    view: function mobileid_view() {
      return '<div id="' + this.instanceID + '" role="dialog" ' +
                  'class="mobileid-dialog" hidden>' +
             '<section role="region" class="skin-organic">' +
               '<header>' +
                 '<button id="mobileid-close-button">' +
                   '<span class="icon icon-close">close</span>' +
                 '</button>' +
                 '<h1>Mobile Identity</h1>' +
               '</header>' +
                this.mainView() +
              '<nav role="navigation" class="navigation">' +
                 '<button id="mobileid-action-button">' +
                   this.options.action +
                 '</button>' +
               '</nav>' +
             '</section>' +
             '</div>';
    },

    _fetchElements: function mobileid_fetchElements() {
      HtmlHelper.importElements(this,
        'mobileid-close-button',
        'mobileid-phone-options',
        'mobileid-external-phone',
        'mobileid-action-button'
      );
      this.clear();
    },

    _registerEvents: function mobileid_registerEvents() {
      this.mobileidCloseButton.onclick = this.hide.bind(this);
      this.mobileidActionButton.onclick = this.onaction.bind(this);
    },

    clear: function mobileid_clear() {
      this.mobileidExternalPhone.value = '';
    },

    changeAction: function mobileid_changeAction(action) {
      this.action = action;
      this.mobileidActionButton.value = action;
    },

    onaction: function mobileid_onaction() {
      this.options.onAction({
        msisdn: this.mobileidExternalPhone.value,
        serviceId: null, //TODO
        verificationCode: null //TODO
      });
    },
  };
  
  exports.MobileIdDialog = MobileIdDialog;

}(window));

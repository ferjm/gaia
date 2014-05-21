/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



'use strict';

(function(exports) {

  /**
   * @class MobileIdDialog
   * @param {options} object for attributes `onShow`, `onHide`,
                      `onAction` callbacks and details about the dialog
                      such as dialog `type`, `primaryPhone` and `phones`.
   * extends SystemDialog
   */
  var MobileIdDialog = function MobileIdDialog() {
    this.options = {};
    this.render();
    this.publish('created');
  };

  MobileIdDialog.prototype = {
    
    __proto__: window.SystemDialog.prototype,

    customID: 'mobileid-dialog',

    DEBUG: false,
    panel: null,

    view: function mobileid_view() {
      return '<div id="' + this.instanceID + '" role="dialog" hidden></div>';
    },

    getIFrame: function mobileid_getIFrame() {
      return document.getElementById('mobile-id-iframe');
    },

    createIframe: function mobileid_getIFrame(onLoaded) {
      var iframe = document.createElement('iframe');
      iframe.id = 'mobile-id-iframe';
      iframe.src = '/mobile_id/index.html';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      this.getView().appendChild(iframe);
      if (typeof onLoaded === 'function') {
        iframe.onload = onLoaded;
      }
      
      return iframe;
    },

    getView: function mobileid_getIFrame() {
      return document.getElementById(this.instanceID);
    },

    open: function mobileid_open(onOpened) {
      // Cache the main panel
      this.panel = this.getView();
      // Show it
      this.show();
      // If something should happen after the transition
      // we add a listener
      
        var onTransitionEnd = function onOpenedAnimation() {
          this.panel.classList.remove('opening');
          this.panel.removeEventListener('animationend', onTransitionEnd);
          
          if (typeof onOpened === 'function') {
            onOpened();
          }
        }.bind(this);

        this.panel.addEventListener(
          'animationend',
          onTransitionEnd
        );
      
      // Add a transtion to show it properly
      this.panel.classList.add('opening');
    },

    close: function mobileid_close(onClosed) {
      var onTransitionEnd = function onClosedAnimation() {
        this.panel.removeEventListener('animationend', onTransitionEnd);
        this.panel.innerHTML = '';
        
        this.panel.classList.remove('closing');
        this.panel.classList.remove('opening');
        this.panel = null;
        
        if (typeof onClosed === 'function') {
          onClosed();
        }

        this.hide();
      }.bind(this);

      this.panel.addEventListener(
        'animationend',
        onTransitionEnd
      );




      this.panel.classList.add('closing');
    }
  };
  
  exports.MobileIdDialog = MobileIdDialog;

}(window));

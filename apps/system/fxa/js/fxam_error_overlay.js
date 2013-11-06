'use strict';

var FxaModuleErrorOverlay = {
  show: function fxam_error_overlay_show(title, message) {
    var overlayEl = document.querySelector('#fxa-error-overlay');
    var titleEl = document.querySelector('#fxa-error-title');
    var messageEl = document.querySelector('#fxa-error-msg');

    if ( ! (overlayEl && titleEl && messageEl))
      return;

    titleEl.textContent = title;
    messageEl.textContent = message;

    overlayEl.classList.add('show');

    Utils.once(document.querySelector('#fxa-error-ok'), 'click', this.hide);
  },

  hide: function fxam_overlay_hide() {
    var overlayEl = document.querySelector('#fxa-error-overlay');
    if ( ! overlayEl)
      return;

    overlayEl.classList.remove('show');
  }
};



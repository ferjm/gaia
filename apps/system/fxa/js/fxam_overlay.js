'use strict';

var FxaModuleOverlay = {

    show: function fxam_overlay_show(string) {
      var overlay = document.querySelector('#fxa-overlay');
      var message = document.querySelector('#fxa-overlay-msg');
      if (!overlay || !message)
        return;

      message.textContent = string;
      overlay.classList.add('show');
    },
    hide: function fxam_overlay_hide() {
      var overlay = document.querySelector('#fxa-overlay');
      if (!overlay)
        return;

      overlay.classList.remove('show');
    }

};



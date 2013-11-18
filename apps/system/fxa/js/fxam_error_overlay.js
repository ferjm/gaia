'use strict';

var _ = navigator.mozL10n.get;

var FxaModuleErrorOverlay = {
  show: function fxam_error_overlay_show(title, message) {
    var overlayEl = document.querySelector('#fxa-error-overlay');
    var titleEl = document.querySelector('#fxa-error-title');
    var messageEl = document.querySelector('#fxa-error-msg');

    if (! (overlayEl && titleEl && messageEl))
      return;

    titleEl.textContent = title || '';
    messageEl.textContent = message || '';

    overlayEl.classList.add('show');

    Utils.once(document.querySelector('#fxa-error-ok'), 'click', this.hide);
    Utils.once(
      document.querySelector('#fxa-error-overlay'),
      'submit',
      this.prevent
    );
  },

  showResponse: function fxam_show_for_response(response) {
    LazyLoader.load('js/fxam_errors.js', function() {
      var config = FxaModuleErrors.responseToConfig(response);

      if (!config) {
        config = {
          title: _('fxa-unknown-error'),
          message: JSON.stringify(response, null, 2)
        };
      }

      this.show(config.title, config.message);
    }.bind(this));
  },

  hide: function fxam_overlay_hide() {
    var overlayEl = document.querySelector('#fxa-error-overlay');
    if (! overlayEl)
      return;

    overlayEl.classList.remove('show');
  },

  prevent: function(event) {
    event.preventDefault();
    event.stopPropagation();
  }
};



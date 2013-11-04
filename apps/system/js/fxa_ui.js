'use strict';

var FxUI = {
  dialog: null,
  panel: null,
  onerrorCB: null,
  onsuccessCB: null,
  init: function fxa_ui_init() {
    var dialogOptions = {
      onHide: this.reset.bind(this)
    };
    this.dialog = SystemDialog('fxa-dialog', dialogOptions);
    this.panel = document.getElementById('fxa-dialog');
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'fxa-iframe';
  },
  // Sign in/up flow
  login: function fxa_ui_login(onsuccess, onerror) {
    this.onsuccessCB = onsuccess;
    this.onerrorCB = onerror;
    this.loadFlow('login');
  },
  // Logout flow
  logout: function fxa_ui_login(onsuccess, onerror) {
    this.onsuccessCB = onsuccess;
    this.onerrorCB = onerror;
    this.loadFlow('logout');
  },
  // Delete flow
  delete: function fxa_ui_delete(onsuccess, onerror) {
    this.onsuccessCB = onsuccess;
    this.onerrorCB = onerror;
    this.loadFlow('delete');
  },
  // Method which close the Dialog
  close: function fxa_ui_end() {
    this.dialog.hide();
  },
  // Method for reseting the panel
  reset: function fxa_ui_reset() {
    this.panel.innerHTML = '';
    this.onerrorCB = null;
    this.onsuccessCB = null;
  },
  // Method for loading the iframe with the flow required
  loadFlow: function fxa_ui_loadFlow(flow) {
    this.iframe.setAttribute('src', '../fxa/fxa_module.html#' + flow);
    this.panel.appendChild(this.iframe);
    this.dialog.show();
  },
  // Method for sending the email to the App
  // which request FxAccounts
  done: function(data) {
    // Proccess data retrieved
    this.onsuccessCB && this.onsuccessCB(data);
    this.close();
  },
  error: function() {
    this.onerrorCB && this.onerrorCB();
    this.close();
  }
};

FxUI.init();


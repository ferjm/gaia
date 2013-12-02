/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleManager = {
  paramsRetrieved: {},
  init: function() {
    var flow = window.location.hash.replace('#', '');
    FxaModuleUI.init(flow);
  },
  setParam: function(key, value) {
    this.paramsRetrieved[key] = value;
  },
  done: function() {
   // Send params to the System
   window.parent.FxAccountsUI.done(this.paramsRetrieved);
  },
  close: function(error) {
    window.parent.FxAccountsUI.error(error);
  }
};

Utils.once(window, 'load', FxaModuleManager.init.bind(FxaModuleManager));

'use strict';



// Helper for loading the elements
requireApp('/system/test/unit/fxa_test/load_element_helper.js');
// Real code
requireApp('system/fxa/js/utils.js');
requireApp('system/fxa/js/fxam_module.js');
// Mockuped code
requireApp('/system/test/unit/mock_l10n.js');

requireApp('system/fxa/js/fxam_ui.js');
requireApp('/system/test/unit/fxa_test/mock_fxam_ui.js');

require('/shared/js/lazy_loader.js');
require('/shared/test/unit/mocks/mock_lazy_loader.js');

require('/shared/test/unit/mocks/mocks_helper.js');
require('/shared/test/unit/load_body_html_helper.js');
// Code to test
requireApp('system/fxa/js/screens/fxam_enter_email.js');

var mocksHelperForEmailModule = new MocksHelper([
  'LazyLoader',
  'FxaModuleUI'
]);

suite('Screen: Enter email', function() {
  var realL10n;
  suiteSetup(function(done) {
    realL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;

    mocksHelperForEmailModule.suiteSetup();
    // Load real HTML
    loadBodyHTML('/fxa/fxa_module.html');
    // Load element to test
    LoadElementHelper.load('fxa-email.html');
    // Import the element and execute the right init
    HtmlImports.populate(function() {
      FxaModuleEnterEmail.init();
      done();
    });
  });

  suiteTeardown(function() {
    navigator.mozL10n = realL10n;
    document.body.innerHTML = '';
    mocksHelperForEmailModule.suiteTeardown();
  });

  var emailInput;
  var fxamUIDisableSpy, fxamUIEnableSpy;
  var inputEvent;
  setup(function() {
    emailInput = document.getElementById('fxa-email-input');
    fxamUIDisableSpy = this.sinon.spy(FxaModuleUI, 'disableNextButton');
    fxamUIEnableSpy = this.sinon.spy(FxaModuleUI, 'enableNextButton');
    inputEvent = new CustomEvent(
      'input',
      {
        bubbles: true
      }
    );
    mocksHelperForEmailModule.setup();
  });

  teardown(function() {
    emailInput = null;
    fxamUIDisableSpy = null;
    fxamUIEnableSpy = null;
    mocksHelperForEmailModule.teardown();
  });

  test(' > Disabled button at the beginning', function() {
    emailInput.dispatchEvent(inputEvent);

    assert.ok(fxamUIDisableSpy.calledOnce);
    assert.isFalse(fxamUIEnableSpy.calledOnce);
  });

  test(' > Enable when ready', function() {
    emailInput.value = 'validemail@mozilla.es';
    emailInput.dispatchEvent(inputEvent);

    assert.ok(fxamUIEnableSpy.calledOnce);
    assert.isFalse(fxamUIDisableSpy.calledOnce);
  });

  test(' > Changes in the email input is tracked properly', function() {
    emailInput.value = 'validemail@mozilla.es';
    emailInput.dispatchEvent(inputEvent);

    assert.ok(fxamUIEnableSpy.called);
    assert.isFalse(fxamUIDisableSpy.calledOnce);

    // Change the value on the fly
    emailInput.value = 'validemailmozilla.es';
    emailInput.dispatchEvent(inputEvent);

    assert.ok(fxamUIEnableSpy.calledOnce);
    assert.ok(fxamUIDisableSpy.called);
  });
});

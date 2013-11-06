/* globals loadBodyHTML, Observable, MockL10n, MockFxAccountsIACHelper,
  HtmlImports, FxaModel, FxaPanel, FxaMenu */

'use strict';

mocha.globals([
  'loadBodyHTML',
  'Observable',
  'MockL10n',
  'MockFxAccountsIACHelper',
  'HtmlImports',
  'FxaModel',
  'FxaPanel',
  'FxaMenu'
]);
require('/shared/js/text_normalizer.js');
require('/shared/test/unit/load_body_html_helper.js');
require('/shared/js/html_imports.js');

require('mock_fx_accounts_iac_helper.js');
requireApp('settings/test/unit/mock_l10n.js');
requireApp('settings/js/mvvm/models.js');
requireApp('settings/js/firefox_accounts.js');

suite('firefox accounts >', function() {
  var suiteSandbox = sinon.sandbox.create(),
    hackedGlobals = {},
    mockFxaModel;

  suiteSetup(function() {
    // Note: we don't actually want l10n to fire, because the l10n onready
    // stanza is where we wire up the object graph. Don't fire l10n ready,
    // instead inject test dependencies manually.
    hackedGlobals.mozL10n = navigator.mozL10n;
    window.navigator.mozL10n = MockL10n;

    // init mock FxaModel (just an Observable we control)
    // this is used for the FxaPanel and FxaMenu tests
    mockFxaModel = Observable({
      fxAccountState: {
        state: 'loggedout',
        email: 'asdf@jkl.com'
      }
    });
    mockFxaModel.onLoginClick = function onLoginClick() {};
    mockFxaModel.onLogoutClick = function onLogoutClick() {};
  });

  suiteTeardown(function() {
    window.navigator.mozL10n = hackedGlobals.mozL10n;
    suiteSandbox.restore();
  });

  suite('FxaModel', function() {
    suiteSetup(function() {
      // init the model
      FxaModel.init(MockFxAccountsIACHelper);
      // watch the model's Observable outputs for signals
    });
    suiteTeardown(function() {
      // TODO should we teardown / recreate the model across tests?
    });
    test('on verifiedlogin, should publish verified state', function(done) {
      function modelStateTestCallback(newVal, oldVal) {
        assert.equal('verified', newVal.state);
        assert.equal('foo@bar.com', newVal.email);
        FxaModel.unobserve('fxAccountState',
          modelStateTestCallback);
        done();
      }
      FxaModel.observe('fxAccountState', modelStateTestCallback);

      MockFxAccountsIACHelper.setCurrentState({
        accountId: 'foo@bar.com',
        verified: true
      });
      MockFxAccountsIACHelper.fireEvent('onverifiedlogin');
    });
    test('on login event, should publish Observable unverified login state',
      function(done) {
      function unverifiedCallback(newVal, oldVal) {
        assert.equal('unverified', newVal.state);
        assert.equal('baz@quux.com', newVal.email);
        FxaModel.unobserve('fxAccountState',
          unverifiedCallback);
        done();
      }
      FxaModel.observe('fxAccountState', unverifiedCallback);

      MockFxAccountsIACHelper.setCurrentState({
        accountId: 'baz@quux.com',
        verified: false
      });
      MockFxAccountsIACHelper.fireEvent('onlogin');
    });
    test('on logout event, should publish Observable logged-out state',
      function(done) {
      function loggedoutCallback(newVal, oldVal) {
        assert.equal('loggedout', newVal.state);
        assert.equal(null, newVal.email);
        FxaModel.unobserve('fxAccountState',
          loggedoutCallback);
        done();
      }
      FxaModel.observe('fxAccountState', loggedoutCallback);

      MockFxAccountsIACHelper.setCurrentState(null);
      MockFxAccountsIACHelper.fireEvent('onlogout');
    });
  });

  suite('FxaPanel', function() {
    var loggedOutScreen,
      unverifiedScreen,
      loggedInScreen;

    suiteSetup(function(done) {
      // attach mock html to page, for verifying state change:
      // first, load settings app
      loadBodyHTML('/index.html');
      // next, insert fxa panel into page
      var importHook = document.createElement('link');
      importHook.setAttribute('rel', 'import');
      importHook.setAttribute('href', '/elements/firefox_accounts.html');
      document.head.appendChild(importHook);
      HtmlImports.populate(function onDOMReady() {
        // double-check panel is ready
        if (null == document.getElementById('fxa-logged-out')) {
          throw new Error('failed to load fxa panel into page');
        }
        // init FxaPanel
        FxaPanel.init(mockFxaModel);
        // grab pointers to useful elements
        loggedOutScreen = document.getElementById('fxa-logged-out');
        unverifiedScreen = document.getElementById('fxa-unverified');
        loggedInScreen = document.getElementById('fxa-logged-in');
        done();
      });
    });
    suiteTeardown(function() {
      // TODO: should we try to destroy FxaPanel? remove mock html from page?
    });
    test('when loggedout state is Observed, show the right html', function() {
        // updating the Observable should auto-update the Panel
        mockFxaModel.fxAccountState = {
          state: 'loggedout',
          email: null
        };
        // check that logged-out state is shown
        assert.isFalse(loggedOutScreen.hidden);
        assert.isTrue(unverifiedScreen.hidden);
        assert.isTrue(loggedInScreen.hidden);
    });
    test('when verified login state is Observed, show the right html',
      function() {
        var localizeSpy = sinon.spy(navigator.mozL10n, 'localize');
        mockFxaModel.fxAccountState = {
          state: 'verified',
          email: 'ver@ified.com'
        };
        assert.isTrue(loggedOutScreen.hidden);
        assert.isTrue(unverifiedScreen.hidden);
        assert.isFalse(loggedInScreen.hidden);
        // test localize was called with correct args
        assert.deepEqual(localizeSpy.args[0], [
          document.getElementById('fxa-logged-in'),
          'fxa-logged-in-text',
          { email: '<em>ver@ified.com</em>' }
        ]);
        navigator.mozL10n.localize.restore();
    });
    test('when unverified login state is Observed, show the right html',
      function() {
        var localizeSpy = sinon.spy(navigator.mozL10n, 'localize');
        mockFxaModel.fxAccountState = {
          state: 'unverified',
          email: 'un@verified.com'
        };
        assert.isTrue(loggedOutScreen.hidden);
        assert.isFalse(unverifiedScreen.hidden);
        assert.isTrue(loggedInScreen.hidden);
        assert.deepEqual(localizeSpy.args[0], [
          document.getElementById('fxa-unverified-text'),
          'fxa-verification-email-sent',
          { email: '<em>un@verified.com</em>' }
        ]);
        navigator.mozL10n.localize.restore();
    });
    test('when transition overlay is shown, ensure it hides itself',
      function() {
        var clock = sinon.useFakeTimers();
        var spinnerEl = document.getElementById('fxa-overlay');

        // start by ensuring the overlay is hidden as a precondition.
        // this can fail. not sure why, but we do a lot of state toggling
        // without waiting for the animation to finish (in previous tests).
        // TODO find a better way to reset state between tests
        spinnerEl.classList.remove('show');

        assert.isFalse(spinnerEl.classList.contains('show'));
        FxaPanel.showSpinner();
        clock.tick(10);
        assert.isTrue(spinnerEl.classList.contains('show'));
        // total delay is 200. advance clock so the el should be re-hidden
        clock.tick(200);
        assert.isFalse(spinnerEl.classList.contains('show'));
        clock.restore();
    });
  });

  suite('FxaMenu', function() {
    var fxaDescEl;

    suiteSetup(function() {
      // attach mock html to page, for verifying state change:
      // for the menu item, we only need the settings app
      loadBodyHTML('/index.html');

      // double-check the html is ready
      fxaDescEl = document.getElementById('fxa-desc');
      if (!fxaDescEl) {
        throw new Error('failed to load settings page html');
      }

      // init FxaMenu
      FxaMenu.init(mockFxaModel);
    });
    suiteTeardown(function() {
      // TODO destroy FxaMenu? remove mock html from page?
    });
    test('when loggedout state is Observed, show the right html',
      function() {
      // updating the Observable should auto-update the Menu
      mockFxaModel.fxAccountState = {
        state: 'loggedout',
        email: null
      };
      assert.equal(fxaDescEl.textContent, '');
    });
    test('when verified login state is Observed, show the right html',
      function() {
      var localizeSpy = sinon.spy(navigator.mozL10n, 'localize');
      mockFxaModel.fxAccountState = {
        state: 'verified',
        email: 'ver@ified.com'
      };
      assert.deepEqual(localizeSpy.args[1], [
        fxaDescEl,
        'fxa-logged-in-text',
        { email: 'ver@ified.com' }
      ]);
      navigator.mozL10n.localize.restore();
    });
    test('when unverified login state is Observed, show the right html',
      function() {
      var localizeSpy = sinon.spy(navigator.mozL10n, 'localize');
      mockFxaModel.fxAccountState = {
        state: 'unverified',
        email: 'un@verified.com'
      };
      assert.deepEqual(localizeSpy.args[1], [
        fxaDescEl,
        'fxa-check-email'
      ]);
      navigator.mozL10n.localize.restore();
    });
  });

});

'use strict';
var assert = require('assert');

var Home2 = require('./lib/home2');
var Actions = require('marionette-client').Actions;

marionette('Vertical - Localization', function() {

  var client = marionette.client(Home2.clientOptions);
  var actions, home, system;

  setup(function() {
    actions = new Actions(client);
    home = new Home2(client);
    system = client.loader.getAppClass('system');
    system.waitForStartup();
    home.waitForLaunch();
  });

  test('Localization updates icon names', function() {
    var settingsManifestUrl = 'app://settings.gaiamobile.org/manifest.webapp';
    var settingsIcon = home.getIcon(settingsManifestUrl);
    assert.equal(
      settingsIcon.text(),
      home.localizedAppName('settings', 'en-US'));

    client.executeScript(function() {
      navigator.mozSettings.createLock().set({
        'language.current': 'qps-ploc'
      });
    });

    // Localization can be async, wait for the content to update
    client.waitFor(function() {
      settingsIcon = home.getIcon(settingsManifestUrl);
      return settingsIcon.text() ===
        home.localizedAppName('settings', 'qps-ploc');
    });
  });

  test('Menu option localization', function() {
    var selectors = Home2.Selectors;

    // Change the language to french
    client.executeScript(function() {
      navigator.mozSettings.createLock().set({
        'language.current': 'qps-ploc'
      });
    });

    home.openContextMenu();

    // Element.text() does not return the content of the shadow dom,
    // so enter the shadow dom manually for now to get the text.
    var expected = home.l10n('cancel');
    client.waitFor(function(){
      var menu = client.helper.waitForElement(selectors.contextmenu);
      var content = menu.scriptWith(function(menu) {
        return menu.shadowRoot.querySelector('button').innerHTML;
      });
      return content === expected;
    });
  });
});

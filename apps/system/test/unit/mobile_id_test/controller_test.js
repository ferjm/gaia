
/* global Controller, UI, MocksHelper, MockL10n*/

'use strict';

requireApp('system/mobile_id/js/controller.js');
// requireApp('system/mobile_id/js/ui.js');
requireApp('system/js/mobileid_manager.js');
requireApp('system/test/unit/mobile_id_test/mock_ui.js');
requireApp('system/test/unit/mock_l10n.js');

require('/shared/test/unit/load_body_html_helper.js');

suite('MobileID Controller', function() {
  var realL10n;

  var mocksHelper = new MocksHelper([
    'UI'
  ]).init();

  var mockDetails = [
    {
      primary: true,
      msisdn: '+34232342342',
      operator: 'Movistar'
    },
    {
      primary: false,
      operator: 'Movistar',
      serviceId: '0'
    }
  ];

  suiteSetup(function() {
    mocksHelper.suiteSetup();

    realL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;

    loadBodyHTML('/mobile_id/index.html');
    Controller.init();
    UI.init();
  });

  suiteTeardown(function() {
    mocksHelper.suiteTeardown();

    navigator.mozL10n = realL10n;
    realL10n = null;

    document.body.innerHTML = '';
  });

  test(' all events are listened', function() {
    this.sinon.spy(Controller, 'handleEvent');
    var events =
      ['init', 'shown', 'onverifying',
      'onverified', 'onerror', 'onverificationcode'];
    // Track number of events
    var i = 0;
    // Are we handling all the events?
    function _launchEvent(cb) {
      var eventName = events[i];
      var eventToLaunch = new CustomEvent(
        eventName,
        {
          detail: {
            candidates: mockDetails
          }
        }
      );
      window.addEventListener(eventName, function onEvent() {
        window.removeEventListener(eventName, onEvent);
        // Check if the number of listeners is the same with the number
        // of times that we are handling the event
        assert.equal(Controller.handleEvent.callCount, i + 1);
        i++;
        if (i === events.length) {
          return;
        } else {
          _launchEvent();
        }
      });

      window.dispatchEvent(eventToLaunch);
    }

    _launchEvent();
  });
});

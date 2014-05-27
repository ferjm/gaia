'use strict';

/* global Controller, UI*/

requireApp('system/mobile_id/js/controller.js');
requireApp('system/mobile_id/js/ui.js');
requireApp('system/mobile_id/js/mobile_id.js');
require('/shared/test/unit/load_body_html_helper.js');

suite('MobileID UI ', function() {
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
    loadBodyHTML('/mobile_id/index.html');
    // Dispatch event "onload"
    var eventToLaunch = new CustomEvent(
      'load',
      {}
    );
    window.dispatchEvent(eventToLaunch);
  });

  suiteTeardown(function() {
    document.body.innerHTML = '';
  });

  suite(' render', function() {
    test('> is launched after "init" event', function() {
      var eventToLaunch = new CustomEvent(
        'init',
        {
          detail: mockDetails
        }
      );
      this.sinon.spy(UI, 'render');
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.render.calledOnce);
    });

    test('> is rendered properly', function() {
      // Render with the mock params
      UI.render(mockDetails);
      // List of the possible options
      var phoneOptionsList = document.querySelector('.phone-options-list');
      // Number of options should be 2
      assert.equal(phoneOptionsList.children.length, mockDetails.length);
      // The first one (which is the primary) should be selected by default
      assert.equal(
        document.querySelector('input:checked').value,
        mockDetails[0].msisdn
      );
      // Second one is a SIM without MSISDN
      assert.equal(
        phoneOptionsList.children[1].value,
        mockDetails[1].serviceId
      );
    });
  });

  suite(' we are bubbling all events to the Controller', function() {
    suiteSetup(function() {
      UI.render(mockDetails);
    });


    test('> close button action',function() {
      this.sinon.stub(Controller, 'postCloseAction');
      document.getElementById('close-button').click();
      assert.ok(Controller.postCloseAction.calledOnce);
      sinon.assert.calledWith(Controller.postCloseAction, false);
    });

    test('> allow button action',function() {
      this.sinon.stub(Controller, 'postIdentity');
      document.getElementById('allow-button').click();
      assert.ok(Controller.postIdentity.calledOnce);
      sinon.assert.calledWith(
        Controller.postIdentity,
        // As we are in the automatic phone number retrieval, we
        // are using the default one
        { cc: null, phonenumber: mockDetails[0].msisdn }
      );
    });

    test('> verification button action',function() {
      var verificationCodeMock = '1234';
      document.getElementById('verification-code').value = verificationCodeMock;
      this.sinon.stub(Controller, 'postVerificationCode');
      document.getElementById('verify-button').click();
      assert.ok(Controller.postVerificationCode.calledOnce);
      sinon.assert.calledWith(
        Controller.postVerificationCode,
        verificationCodeMock
      );
    });
  });

  suite(' every event is calling the right UI function', function() {
    test('> "shown" event', function() {
      this.sinon.spy(UI, 'setScroll');
      var eventToLaunch = new CustomEvent(
        'shown',
        {
          detail: mockDetails
        }
      );
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.setScroll.calledOnce);
    });
    test('> "onverifying" event', function() {
      this.sinon.spy(UI, 'onVerifying');
      var eventToLaunch = new CustomEvent(
        'onverifying',
        {
          detail: mockDetails
        }
      );
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.onVerifying.calledOnce);
    });
    test('> "onverified" event', function() {
      this.sinon.spy(UI, 'onVerified');
      var eventToLaunch = new CustomEvent(
        'onverified',
        {
          detail: mockDetails
        }
      );
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.onVerified.calledOnce);
    });
    test('> "onerror" event', function() {
      this.sinon.spy(UI, 'onerror');
      var eventToLaunch = new CustomEvent(
        'onerror',
        {
          detail: mockDetails
        }
      );
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.onerror.calledOnce);
    });
    test('> "onVerificationCode" event', function() {
      this.sinon.spy(UI, 'onVerificationCode');
      var eventToLaunch = new CustomEvent(
        'onVerificationCode',
        {
          detail: mockDetails
        }
      );
      window.dispatchEvent(eventToLaunch);
      assert.ok(UI.onVerificationCode.calledOnce);
    });
  });
});

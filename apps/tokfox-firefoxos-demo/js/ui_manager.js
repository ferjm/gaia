'use strict';

(function(exports) {
  var _initialized = false;
  var hangupButton, countryCodeSelect, phoneNumberInput, sendMSISDN, answerButton;
  var contactNameDOM, contactPhoneNumberDOM, outgoingInput;
  var UIManager = {
    init: function() {
      if (_initialized) {
        return;
      }
      hangupButton = document.getElementById('call-hangup');
      answerButton = document.getElementById('call-answer');
      countryCodeSelect = document.getElementById('country-code');
      phoneNumberInput = document.getElementById('telephone');
      sendMSISDN = document.getElementById('send-msisdn-button');
      contactNameDOM = document.getElementById('call-contact-name');
      contactPhoneNumberDOM = document.getElementById('call-contact-phone');
      outgoingInput = document.getElementById('outgoing-phone-number');
      
      phoneNumberInput.addEventListener('input', function() {
        if (phoneNumberInput.value.length > 0) {
          sendMSISDN.classList.remove('disabled');
        } else {
          sendMSISDN.classList.add('disabled');
        }
      });

      outgoingInput.addEventListener('input', function() {
        if (outgoingInput.value.length > 0) {
          answerButton.classList.remove('disabled');
        } else {
          answerButton.classList.add('disabled');
        }
      });

      phoneNumberInput.addEventListener('focus', function() {
        document.querySelector('[data-layout="register"]').classList.add('keyboard');
      });

      phoneNumberInput.addEventListener('blur', function() {
        document.querySelector('[data-layout="register"]').classList.remove('keyboard');
      });
      
      _initialized = true;
    },

    outgoing: function(onCallAction) {
      answerButton.classList.add('disabled');
      document.body.dataset.layout = 'outgoing';
      
      answerButton.addEventListener('click', function hang() {
        answerButton.removeEventListener('click', hang);
        contactNameDOM.textContent = outgoingInput.value;
        onCallAction(outgoingInput.value, function() {

        });
        UIManager.call(null, outgoingInput.value, function() {
          outgoingInput.value  = '';
          contactNameDOM.textContent = '';
          UIManager.outgoing(onCallAction);
        });

      });

    },

    incoming: function(name, phoneNumber, onAnswer, onHangup) {
      answerButton.classList.remove('disabled');
      document.body.dataset.layout = 'incoming';
      if (!name) {
        contactNameDOM.textContent = phoneNumber;
        contactPhoneNumberDOM.textContent = 'Tokfox user';
      } else {
        contactNameDOM.textContent = name;
        contactPhoneNumberDOM.textContent = phoneNumber;
      }

      hangupButton.addEventListener('click', function hang() {
        hangupButton.removeEventListener('click', hang);
        if (typeof onHangup === 'function') {
          onHangup();
        }
      });
      answerButton.addEventListener('click', function hang() {
        answerButton.removeEventListener('click', hang);
        if (typeof onAnswer === 'function') {
          onAnswer();
        }
        UIManager.call(name, phoneNumber, onHangup);
      });
    },

    call: function(name, phoneNumber, onHangup) {
      document.body.dataset.layout = 'call';

      if (!name) {
        contactNameDOM.textContent = phoneNumber;
        contactPhoneNumberDOM.textContent = 'Tokfox user';
      } else {
        contactNameDOM.textContent = name;
        contactPhoneNumberDOM.textContent = phoneNumber;
      }

      hangupButton.addEventListener('click', function hang() {
        hangupButton.removeEventListener('click', hang);
        if (typeof onHangup === 'function') {
          onHangup();
        }
      });
    },
    register: function(onRegistered) {
      document.body.dataset.layout = 'register';
      sendMSISDN.addEventListener('click', function send() {
        LoadingOverlay.show('Signing up...');
        if (typeof onRegistered === 'function') {
          var phone =
            countryCodeSelect.options[countryCodeSelect.selectedIndex].value +
            phoneNumberInput.value;
          onRegistered(phone);
        }
      });
    }
  };

  exports.UIManager = UIManager;
}(this));

UIManager.init();
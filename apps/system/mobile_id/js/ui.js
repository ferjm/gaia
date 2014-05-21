
/* exports UI */
/* global Controller */

(function(exports) {
  'use strict';
  var allowButton, closeButton, verificationCodeButton,
      multistateButton, panelsContainer,
      verificationCodeInput, msisdnInput,
      msisdnAutomaticOptions, typeMSISDNButton,
      selectAutomaticOptionsButton, msisdnContainer,
      countryCodesSelect, verificationPanel,
      msisdnSelectionPanel;

  // var isVerificationCode = false;
  var isVerified = false;
  var isManualMSISDN = false;
  var buttonCurrentStatus;

  function _setMultibuttonStep(stepName) {
    buttonCurrentStatus = stepName;
    var shift = 0;
    switch(stepName) {
      case 'allow':
        shift = 0;
        allowButton.className = 'msb-button-step state-allow';
        allowButton.disabled = false;
        break;
      case 'sending':
        shift = 0;
        allowButton.className = 'msb-button-step state-sending';
        allowButton.disabled = true;
        break;
      case 'verify':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verify';
        verificationCodeButton.disabled = false;
        break;
      case 'verifying':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verifying';
        verificationCodeButton.disabled = true;
        break;
      case 'verified':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verified';
        verificationCodeButton.disabled = false;
        break;
      case 'resend':
        shift = 0;
        verificationCodeButton.className = 'msb-button-step state-resend';
        verificationCodeButton.disabled = false;
        break;
    }

    multistateButton.style.transform = 'translateX(' + shift + '%)';
  }

  function _setPanelsStep(stepName) {
    var shift = 0;
    switch(stepName) {
      case 'msisdn':
        shift = 0;
        break;
      case 'verification':
        shift = -25;
        break;
      case 'done':
        shift = -50;
        break;
    }

    panelsContainer.style.transform = 'translateX(' + shift + '%)';
  }

  function _disablePanel(stepName) {
    switch(stepName) {
      case 'msisdn':
        msisdnAutomaticOptions.classList.add('disabled');
        typeMSISDNButton.classList.add('disabled');
        selectAutomaticOptionsButton.classList.add('disabled');
        countryCodesSelect.classList.add('disabled');
        msisdnInput.disabled = true;
        break;
      case 'verification':
        verificationCodeInput.disabled = true;
        break;
    }
  }

  function _enablePanel(stepName) {
    switch(stepName) {
      case 'msisdn':
        msisdnAutomaticOptions.classList.remove('disabled');
        typeMSISDNButton.classList.remove('disabled');
        selectAutomaticOptionsButton.classList.remove('disabled');
        countryCodesSelect.classList.remove('disabled');
        msisdnInput.disabled = false;
        break;
      case 'verification':
        verificationCodeInput.disabled = false;
        break;
    }
  }

  function _msisdnContainerTranslate(step) {
    isManualMSISDN = step === 0 ? false:true;
    msisdnContainer.style.transform = 'translateX(' + -1 * 50 * step + '%)';
  }

  function _fieldErrorDance(element) {
    element.addEventListener('animationend',function danceOver() {
      verificationCodeInput.removeEventListener('animationend', danceOver);
      verificationCodeInput.classList.remove('error');
    });
    element.classList.add('error');
  }

  function _fillCountryCodesList() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function fileLoaded() {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          // Cache the CC
          var countryCodes = xhr.response;
          // Clean the <select> element
          countryCodesSelect.innerHTML = '';
          // Per country, we show it CC
          var ccFragment = document.createDocumentFragment();
          Object.keys(countryCodes).forEach(function(country) {
            var option = document.createElement('option');
            option.textContent = countryCodes[country].prefix;
            ccFragment.appendChild(option);
          });

          countryCodesSelect.appendChild(ccFragment);
        } else {
          console.error('Failed to fetch file: ', xhr.statusText);
        }
      }
    };
    xhr.open('GET', ' resources/cc.json', true);
    xhr.responseType = 'json';
    xhr.send();
  }

  function _getIdentitySelected() {
    var identity;
    // Lo recupero
    if (isManualMSISDN) {
      identity =  {
        cc: countryCodesSelect.value,
        phonenumber: msisdnInput.value
      };
    } else {
      var query = 'input[name="msisdn-option"]:checked';
      var optionChecked = document.querySelector(query);
      if (optionChecked.dataset.identificationType === 'msisdn') {
        identity =  {
          cc: null,
          phonenumber: optionChecked.value
        };
      } else {
        identity = {
          serviceId: optionChecked.value
        };
      }
    }
    return identity;
  }

  function _getCode() {
    return verificationCodeInput.value;
  }

  var UI = {
    init: function ui_init(params) {
      allowButton = document.getElementById('allow-button');
      closeButton = document.getElementById('close-button');
      verificationCodeButton = document.getElementById('verify-button');
      multistateButton = document.getElementById('msb');
      panelsContainer = document.getElementById('panels-container');
      verificationCodeInput = document.getElementById('verification-code');
      msisdnInput = document.getElementById('msisdn-input');
      msisdnAutomaticOptions = document.querySelector('.phone-options-list');
      typeMSISDNButton = document.getElementById('add-msisdn');
      selectAutomaticOptionsButton =
        document.getElementById('do-automatic-msisdn');
      msisdnContainer = document.querySelector('.msisdn-selection-wrapper');
      countryCodesSelect = document.getElementById('country-codes-select');
      verificationPanel = document.querySelector('.verification-panel');
      msisdnSelectionPanel = document.querySelector('.msisdn-selection-panel');

      // Fill the country code list
      _fillCountryCodesList();

      closeButton.addEventListener(
        'click',
        function onClose() {
          Controller.postCloseAction(isVerified);
        }
      );

      typeMSISDNButton.addEventListener(
        'click',
        function onManualMSISDN(e) {
          _msisdnContainerTranslate(1);
        }
      );

      selectAutomaticOptionsButton.addEventListener(
        'click',
        function onAutomaticMSISDN(e) {
          _msisdnContainerTranslate(0);
        }
      );


      allowButton.addEventListener(
        'click',
        function onAllow(e) {
          // Disable to avoid any action while requesting the server
          _disablePanel('msisdn');
          // Update the status of the button
          _setMultibuttonStep('sending');
          // Send to controller the identity selected
          Controller.postIdentity(_getIdentitySelected());
        }
      );

      verificationCodeButton.addEventListener(
        'click',
        function onVerify(e) {
          if (!isVerified) {
            // If we are in the proccess of verifying, we need
            // first to send the code to the server
            Controller.postVerificationCode(_getCode());
            // Disable the panel
            _disablePanel('verification');
            // We udpate the button
            _setMultibuttonStep('verifying');
            return;
          }
          // If the identity posted to the server and/or the verification
          // code is accepted, we are ready to close the flow.
          Controller.postCloseAction(isVerified);
        }.bind(this)
      );
    },
    render: function ui_render(identifications) {
      console.log('Render with ' + JSON.stringify(identifications));
      


      var optionsFragment = document.createDocumentFragment();

      for (var i = 0, l = identifications.length; i < l; i++) {
        // identifications[i]
        var li = document.createElement('li');

        var label = document.createElement('label');

        var typeIcon = document.createElement('span');
        var radio = document.createElement('input');
        var radioMask = document.createElement('span');
        var name = document.createElement('p');


        var iconClasses = 'icon icon-simcardlock';
        if (identifications[i].primary) {
          radio.checked = 'checked';
          iconClasses+=' primary';
        } else {
          // TODO Double check para el service ID
          iconClasses+=' sim' + (+identifications[i].serviceId + 1);
        }
        typeIcon.className = iconClasses;

        name.textContent =
          identifications[i].msisdn || identifications[i].operator;
        radio.name = 'msisdn-option';
        radio.type = 'radio';
        radio.dataset.identificationType =
          identifications[i].msisdn ? 'msisdn':'serviceid';
        radio.value =
          identifications[i].msisdn || identifications[i].serviceId;
        radioMask.className = 'radio-mask';

        label.appendChild(typeIcon);
        label.appendChild(radio);
        label.appendChild(radioMask);
        label.appendChild(name);

        li.appendChild(label);

        optionsFragment.appendChild(li);
       
      }
      var phoneOptionsList = document.querySelector('.phone-options-list');
      phoneOptionsList.innerHTML = '';
      phoneOptionsList.appendChild(optionsFragment);
    },
    onVerifying: function ui_onverifiying() {
      // Update the button. There is no panel change
      _setMultibuttonStep('verifying');
    },
    onVerified: function ui_onverified() {
      // If our identity is registered properly, we are
      // ready to go!
      isVerified = true;
      // Update the status of the button showing the 'success'
      _setMultibuttonStep('verified');
      // Show the panel with some feedback to the user
      _setPanelsStep('done');
    },
    onVerificationCode: function ui_onVerificationCode() {
      // Update the status of the button
      _setMultibuttonStep('verify');
      // Show the right panel
      _setPanelsStep('verification');
    },
    onerror: function ui_onError() {
      // Enable all the fields
      _enablePanel('msisdn');
      _enablePanel('verification');
      // Enable the right button
      if (buttonCurrentStatus === 'sending') {
        _setMultibuttonStep('allow');
      } else {
        _setMultibuttonStep('verify');
        // Show animation to the field which is wrong
        _fieldErrorDance(verificationCodeInput);
      }
    },
    setScroll: function ui_setScroll() {
      // Add scroll management to show properly the input
      // when the keyboard is shown
      var bodyRect = document.body.getBoundingClientRect(),
          codeRect = verificationCodeInput.getBoundingClientRect(),
          msisdnInputRect = msisdnInput.getBoundingClientRect(),
          offsetCode   = codeRect.top - bodyRect.top,
          offsetMSISDN   = msisdnInputRect.top - bodyRect.top;

      window.addEventListener(
        'resize',
        function onResized() {
          verificationPanel.scrollTop = offsetCode;
          msisdnSelectionPanel.scrollTop = offsetMSISDN;
        }
      );
    }
  };

  exports.UI = UI;

}(this));

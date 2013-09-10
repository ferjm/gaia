'use strict';

var Persona = {

  onSignInClick: function onSignInClick() {
    navigator.mozId.watch({
      loggedInUser: null,
      onlogin: Persona.onLogin,
      onlogout: function() {}
    });

    navigator.mozId.request({});
  },

  onLogin: function onLogin() {
    UIManager.personaSignIn.textContent = 'Successfully logged \o/';
  }

};

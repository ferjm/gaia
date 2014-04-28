/* exported CommsProviderHelper */

(function(exports) {
  'use strict';

  var COMMS_PROVIDERS_DS_NAME = 'comms-provider';

  /**
   * We expect providers to have the following data:
   * {
   *    contacts: {
   *      name: <string>,
   *      activities: [{
   *        info: <string>,
   *        icon: <blob>,
   *        name: <string>,
   *        filters: [{
   *          required: <boolean>,
   *          type: <string> // WebContacts API fields i.e: tel, email, etc.
   *        }]
   *      }]
   *    },
   *    dialer: {
   *      // TBD
   *    },
   *    sms: {
   *      // TBD
   *    }
   * }
   */
  function isValidProvider(provider) {
    if (!provider) {
      return false;
    }

    // For now we only allow comm providers to be added to the Contacts app.
    var contacts = provider.contacts;
    console.log('contacts ' + JSON.stringify(contacts));
    if (!contacts ||
        !contacts.name ||
        !contacts.activities ||
        !Array.isArray(contacts.activities) ||
        !contacts.activities.length) {
      return false;
    }

    for (var i = 0; i < contacts.activities.length; i++) {
      var activity = contacts.activities[i];
      if (!activity.name) {
        return false;
      }
    }

    return true;
  }

  var CommsProviderHelper = {
    _providers: null,

    get providers() {
      return this._providers;
    },

    buildProviders: function buildProviders(callback = function() {}) {
      if (this._providers !== null) {
        callback(this._providers);
        return;
      }

      console.log('Building providers');
      var self = this;
      navigator.getDataStores(COMMS_PROVIDERS_DS_NAME)
      .then(function(stores) {
        if (!stores.length) {
          self._providers = [];
          callback(self._providers);
          return;
        }

        var count = 0;
        stores.forEach(function(store) {
          store.get(1).then(function(data) {
            if (self._providers === null) {
              self._providers = [];
            }
            if (isValidProvider(data)) {
              self._providers.push(data);
            }
            count++;
            if (count < stores.length) {
              return;
            }
            callback(self._providers);
          });
        });
      }, function(error) {
        console.error('Error ' + error.name);
        self._providers = null;
        callback(self._providers);
      });
    }
  };

  exports.CommsProviderHelper = CommsProviderHelper;
})(this);

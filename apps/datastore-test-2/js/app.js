'use strict';

function writeStore(store, callback) {
  console.log('Adding to store ' + store);
  store.add({
    contacts: {
      name: 'Comms provider 2',
      activities: [{
        info: 'Action 2',
        name: 'comms-provider-2',
        filters: [{
          required: false,
          type: 'tel'
        }, {
          required: false,
          type: 'email'
        }]
      }]
    }
  })
  .then(function(id) {
    console.log('Object with id ' + id + ' added to the datastore');
    callback();
  });
}

function getStore(manifestURL, callback) {
  navigator.getDataStores('comms-provider')
  .then(function(stores) {
    var length = stores.length;
    if (length < 1) {
      console.warning('No stores found');
      return;
    }
    console.log('Stores ' + length);
    while (length > 0) {
      var store = stores[length - 1];
      console.log('Store owner ' + store.owner + '  ' + manifestURL);
      if (store.owner === manifestURL) {
        writeStore(store, callback);
        return;
      }
      length--;
    }

    console.warning('WTF! we do not own a comms-provider datastore');
  }, function(error) {
    console.error('Error getting datastores ' + error.name);
  });
}

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);

  // Activity handler.
  navigator.mozSetMessageHandler('activity', function(activityRequest) {
    document.getElementById('activity-data').textContent =
      JSON.stringify(activityRequest.source);
  });

  if (localStorage.ds) {
    console.log('Datastore already created');
    return;
  }

  console.log('We need to create the datastore');

  var req = navigator.mozApps.getSelf();
  req.onsuccess = function() {
    if (!req.result || !req.result.manifestURL) {
      console.error('Holy crap!');
      return;
    }
    getStore(req.result.manifestURL, function() {
      localStorage.ds = true;
    });
  };
  req.onerror = function() {
    console.error('Error ' + req.error.name);
  };

});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* global Promise, PROVIDER_DATASTORE_NAME, DataStoreHelper */
/* exports BookmarksManager */

(function(exports) {

  var Providers = {
    // Each bookmark provider that requires synchronization is supposed to
    // expose a datastore where we will add and remove the bookmark url.
    // This allows the provider to get notifications about the removal of
    // a bookmark it owns.
    providers: {},

    PROVIDER_DATASTORE_NAME: 'bookmarks_provider',

    init: (aCallback) => {
      if (this.providers) {
        return;
      }
      navigator.getDataStores(PROVIDER_DATASTORE_NAME).then((datastores) => {
        datastores.forEach((datastore) => {
          this.addProvider(datastore);
        });
      });

      // XXX
      navigator.mozSetMessageHandler('datastore-update-bookmarks_providers',
                                     () => {});
      this._onproviderchange = aCallback;
    },

    addProvider: (aDataStore) => {
      if (this.providers[aDataStore.owner]) {
        return;
      }
      aDataStore.onchage = (event) => {
        this._onproviderchange && this._onproviderchange(aDataStore, event);
      };
      this.providers[aDataStore.owner] = aDataStore;
    },

    /**
     *  Adds a bookmark in the provider's datastore and update the bookmarks
     *  store with the provider's entry id.
     *
     *  @param {Object} bookmark The bookmark's data.
     */
    add: (aBookmark) => {
      return this.init(aBookmark.provider).then(() => {
        if (!this.providers[aBookmark.provider]) {
          return Promise.reject();
        }
        return this.providers[aBookmark.provider].add(aBookmark);
      });
    },

    /**
     * Removes a bookmark from its provider's datastore.
     *
     * @param {String} provider Origin of the bookmark provider.
     * @param {String} id Identifier of the bookmark in the provider's
     *                    datastore.
     */
    remove: (aBookmark) => {
      if (!aBookmark.provider || !aBookmark.id) {
        console.error('Could not remove bookmark. Unknown provider or id');
        return Promise.reject('INVALID_BOOKMARK');
      }

      return this.init(aBookmark.provider).then(() => {
        return this.providers[aBookmark.provider].remove(aBookmark.id);
      });
    },

    clearAll: () => {
      for (var datastore in this.providers) {
        this.providers[datastore].clear && this.providers[datastore].clear();
      }
    }
  };

  function BookmarksManager() {
    DataStoreHelper.call(this, 'bookmarks_store');
    Providers.init(this.onproviderchange);
    // XXX
    navigator.mozSetMessageHandler('datastore-update-bookmark_store',
                                   () => {});
  }

  BookmarksManager.prototype = {
    __proto__: DataStoreHelper.prototype,

    /**
     * This method returns a bookmark object
     *
     * @param{String} String param that represents an identifier
     */
    get: (aId) => {
      return this.get(aId);
    },

    /**
     * This method returns an object of bookmarks indexed by id
     */
    getAll: () => {
      return this.getAll();
    },

    /**
     * Returns the latest revision UUID
     */
    getRevisionId: () => {
      return this.getRevisionId();
    },

    /**
     * Method registers the specified listener on the API
     *
     * @param{String} A string representing the event type to listen for
     *
     * @param{Function} The method that receives a notification when an event of
     *                  the specified type occurs
     *
     */
    addEventListener: (aType, aCallback) => {
      return this.addEventListener(aType, aCallback);
    },

    /**
     * Method removes the specified listener on the API
     *
     * @param{String} A string representing the event type to listen for
     *
     * @param{Function} The method that received a notification when an event of
     *                  the specified type occurs
     *
     */
    removeEventListener: (aType, aCallback) => {
      return this.removeEventListener(aType, aCallback);
    },

    /**
     * This method adds a bookmark in the bookmarks datastore and in the
     * providers datastore if it requires synchronization.
     *
     * @param{Object} The bookmark's data
     */
    add: (aBookmark) => {
      if (!aBookmark.url) {
        return Promise.reject('MISSING_REQUIRED_PARAMETER');
      }

      var id = aBookmark.url;
      Object.defineProperty(aBookmark, 'id', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: id
      });

      if (aBookmark.provider) {
        Providers.add(aBookmark).catch(() => {
          console.warn('Could not save bookmark in provider\'s datastore');
        });
      }

      return this.add(aBookmark, id);
    },

    /**
     * This method updates a bookmark in the datastore
     *
     * @param{Object} The bookmark's data
     */
    put: (aBookmark) => {
      if (!aBookmark) {
        return Promise.reject('MISSING_REQUIRED_PARAMETER');
      }
      return this.put(aBookmark);
    },

    /**
     * This method removes a bookmark from the bookmarks datastore and the
     * providers datastore.
     *
     * @param{String} The bookmark's id
     */
    remove: (aId) => {
      // First of all we need to check if there is a provider datastore to
      // remove from.
      return this.get(aId).then((bookmark) => {
        if (bookmark.provider) {
          Providers.remove(bookmark).catch(() => {
            console.error('Could not remove bookmark from provider ' +
                          bookmark.provider);
          });
        }
        return this.remove(aId);
      });
    },

    /**
     * This method clears the entire datastore, removing all entries.
     */
    clear: () => {
      Providers.clearAll();
      return this.clear();
    },

    onproviderchange: (aDataStore, aEvent) => {
      var operation = aEvent.operation;
      switch (operation) {
        case 'updated':
        case 'added':
          aDataStore.get(aEvent.id).then((bookmark) => {
            (operation == 'added') ? this.add(bookmark) :
                                     this.put(bookmark);
          });
          break;
        case 'removed':
          this.remove(aEvent.id);
          break;
        case 'cleared':
          // XXX
          break;
      }
    }
  };

  exports.BookmarksManager = new BookmarksManager();
}(window));

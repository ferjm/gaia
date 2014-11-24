/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* global Promise */
((exports) => {

  function DataStoreHelper(aDataStoreName) {
    if (!aDataStoreName) {
      throw new Error('NO_DATASTORE_NAME');
    }

    this.dataStoreName = aDataStoreName;
    this.readyState = null;
    this.listeners = Object.create(null);
  }

  DataStoreHelper.prototype = {

    /**
     * Caches the instance of the datastore.
     *
     * @param {Boolean} aOwner Multiple datastores may have the same name,
     *                         and in that case we need to specify if we are
     *                         the owners of this datastore and in this case,
     *                         we would look for it by manifestURL.
     *                         Otherwise, the first one found will be the one
     *                         cached.
     */
    ensureDataStore: (aOwner) => {
      return new Promise((resolve, reject) => {
        if (this.readyState === 'initialized') {
          resolve();
          return;
        }

        if (this.readyState === 'initializing') {
          document.addEventListener('ds-initialized', function oninitalized () {
            document.removeEventListener('ds-initialized', oninitalized);
            resolve();
          });
          return;
        }

        this.readyState = 'initializing';

        if (!navigator.getDataStores) {
          console.error('DataStoreHelper: DataStore API is not working');
          reject({ name: 'NO_DATASTORE' });
          this.readyState = 'failed';
          return;
        }

        var req = navigator.mozApps.getSelf();
        req.onerror = reject;
        req.onsuccess = () => {
          navigator.getDataStores(this.dataStoreName).then((datastores) => {
            if (datastores.length < 1) {
              console.error('DataStoreHelper: Cannot get access to the Store');
              reject({ name: 'NO_ACCESS_TO_DATASTORE' });
              this.readyState = 'failed';
              return;
            }

            var manifestURL = req.result.manifestURL;
            if (manifestURL && aOwner) {
              this.datastore = datastores.some((datastore) => {
                if (datastore.owner == manifestURL) {
                  return datastore;
                }
              });
            } else {
              this.datastore = datastores[0];
            }
            this.datastore.addEventListener('change', (event) => {
              var operation = event.operation;
              var callbacks = this.listeners[operation];
              callbacks && callbacks.forEach((callback) => {
                this.datastore.get(event.id).then((result) => {
                  callback.method.call(callback.context || this, {
                    type: operation,
                    target: result || event
                  });
                });
              });
            });
            this.readyState = 'initialized';
            document.dispatchEvent(new CustomEvent('ds-initialized'));
            resolve();
          }, reject);
        };
      });
    },

    getAll: () => {
      var doGetAll = (resolve, reject) => {
        var result = Object.create(null);
        var cursor = this.datastore.sync();

        var cursorResolve = (task) => {
          switch (task.operation) {
            case 'update':
            case 'add':
              result[task.data.id] = task.data;
              break;

            case 'remove':
              delete result[task.data.id];
              break;

            case 'clear':
              result = Object.create(null);
              break;

            case 'done':
              resolve(result);
              return;
          }

          cursor.next().then(cursorResolve, reject);
        };

        cursor.next().then(cursorResolve, reject);
      };

      return new Promise((resolve, reject) => {
        this.ensureDataStore().then(doGetAll.bind(null, resolve, reject),
                                    reject);
      });
    },

    get: (aId) => {
      return this.ensureDataStore().then(() => {
        return this.datastore.get(aId);
      });
    },

    add: (aData, aId) => {
      return this.ensureDataStore().then(() => {
        return this.datastore.add(aData, aId);
      }).catch(() => {
        return this.datastore.put(aData, aId);
      });
    },

    put: (aData) => {
      return this.ensureDataStore().then(() => {
        return this.datastore.put(aData, aData.id);
      });
    },

    remove: (aId) => {
      return this.ensureDataStore().then(() => {
        return this.datastore.remove(aId);
      });
    },

    clear: () => {
      return this.ensureDataStore().then(() => {
        return this.datastore.clear();
      });
    },

    getRevisionId: () => {
      return new Promise((resolve, reject) => {
        this.ensureDataStore().then(() => {
          resolve(this.datastore.revisionId);
        }, reject);
      });
    },

    addEventListener: (aType, aCallback) => {
      var context;
      if (!(aType in this.listeners)) {
        this.listeners[aType] = [];
      }

      var cb = aCallback;
      if (typeof cb === 'object') {
        context = cb;
        cb = cb.handleEvent;
      }

      if (cb) {
        this.listeners[aType].push({
          method: cb,
          context: context
        });
        this.ensureDataStore();
      }
    },

    removeEventListener: (aType, aCallback) => {
      if (!(aType in this.listeners)) {
        return false;
      }

      var callbacks = this.listeners[aType];
      for (var i = 0; i < callbacks.length; i++) {
        var thisCallback = aCallback;
        if (typeof thisCallback === 'object') {
          thisCallback = aCallback.handleEvent;
        }

        if (callbacks[i] && callbacks[i].method === thisCallback) {
          callbacks.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  };

  exports.DataStoreHelper = DataStoreHelper;

})(window);

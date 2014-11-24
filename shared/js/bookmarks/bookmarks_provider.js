/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global MozActivity, DataStoreHelper */

/* exports BookmarksProvider */

'use strict';

((exports) => {

  function BookmarksProvider() {
    DataStoreHelper.call(this, 'bookmarks_provider');
  }

  BookmarksProvider.prototype = {
    __proto__: DataStoreHelper.prototype,

    set onbookmarkchange(aCallback) {
      this._onbookmarkchange = aCallback;
    },

    save: (aBookmark) => {
      if (!aBookmark || !aBookmark.url || !aBookmark.name ||
          !aBookmark.icon) {
        return Promise.reject('MISSING_REQUIRED_PARAMETER');
      }

      return new Promise((resolve, reject) => {
        // XXX This needs to be given by the plaform bugXXXXXX
        navigator.mozApps.getSelf().onsuccess = (event) => {
          var manifestURL = event.target.result.manifestURL;
          var activity = new MozActivity({
            name: 'save-bookmark',
            data: {
              type: 'url',
              url: aBookmark.url,
              name: aBookmark.name,
              icon: aBookmark.icon,
              iconable: aBookmark.iconable || false,
              useAsyncPanZoom: aBookmark.useAsyncPanZoom || false,
              // XXX This should be given by the platform
              provider: manifestURL
            }
          });
          activity.onsuccess = resolve;
          activity.onerror = reject;
        };
      });
    },

    remove: (aUrl) => {
      if (!aUrl) {
        return Promise.reject('MISSING_REQUIRED_PARAMETER');
      }

      return new Promise((resolve, reject) => {
        var activity = new MozActivity({
          name: 'remove-bookmark',
          data: {
          }
        });
        activity.onsucess = resolve;
        activity.onerror = reject;
      });
    },

    edit: (aBookmark) => {
      if (!aBookmark) {
        return Promise.reject('MISSING_REQUIRED_PARAMETER');
      }

      return this.put(aBookmark);
    },

    getAll: () => {
      return this.getAll();
    }
  };

  exports.BookmarksProvider = new BookmarksProvider();

})(window);

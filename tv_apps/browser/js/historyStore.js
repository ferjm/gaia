/* globals BrowserDB, SyncBrowserDB, SyncManagerBridge */
'use strict';

(function(exports){

  var HistoryStore = {
    isSynced: false,

    cache: [],

    currentFolder : null,

    reset: function(cb) {
      this.cache = [];
      this.currentFolder = null;
      SyncManagerBridge.getInfo().then(message => {
        this.isSynced = (message.state === 'enabled') ? true : false;
        cb();
      });
    },

    getByRange: function(start, num, folderId, cb) {
      var fn = function(){
        var i = start,
          length = (start + num) > this.cache.length ?
              (this.cache.length - start) : (start + num),
          result = [];
        for(; i < length; i++) {
          result.push(this.cache[i]);
        }
        cb(result);
      }.bind(this);

      if(folderId !== this.currentFolder) {
        this.currentFolder = folderId;
        this.updateCache(fn);
      } else {
        fn();
      }
    },

    getByIndex: function(index, folderId, cb) {
      var fn = function() {
        var result = null;
        if(index >= 0 && index < this.cache.length) {
          result = this.cache[index];
        }
        cb(result);
      }.bind(this);

      if(folderId !== this.currentFolder) {
        this.currentFolder = folderId;
        this.updateCache(fn);
      } else {
        fn();
      }
    },

    updateCache: function(cb){
      this.cache = [];

      if(this.isSynced) {
        if(!this.currentFolder) {
          SyncBrowserDB.getHistory(syncHistory => {
            // make sure if firefox synced data saved in indexdDB
            if(syncHistory) {
              this.cache.push({
                id: 'sync_history',
                title: 'Synced History',
                type: 'folder',
                readOnly: true
              });
            }

            // get history data from origin indexdDB
            BrowserDB.getHistory(localHistory => {
              this.cache = this.cache.concat(localHistory);
              cb();
            });
          });
        } else {
          SyncBrowserDB.getHistory(syncHistory => {
            syncHistory.forEach((h, i) => {
              // XXX: the data from firefox sync can't be modified.
              h.readOnly = true;
              this.cache.push(h);
            });
            cb();
          });
        }
      } else {
        // Get history data from origin indexdDB
        BrowserDB.getHistory(localHistory => {
          this.cache = localHistory;
          cb();
        });
      }
    }
  };

  exports.HistoryStore = HistoryStore;
})(window);

/* global LazyLoader */
/* global SyncManagerBridge */

'use strict';

function FirefoxSyncMenu() {
  LazyLoader.load('js/modules/sync_manager_bridge.js').then(() => {
    SyncManagerBridge.onsyncchange = this.onsyncchange.bind(this);
    this.refresh();
    document.addListener('visibilitychange', this.refresh.bind(this));
  });
}

FirefoxSyncMenu.prototype = {
  onsyncchange(message) {
    if (!message || !message.state) {
      throw new Error('Missing sync state');
    }
    switch (message.state) {
      case 'disabled':
        break;
      case 'enabled':
        break;
    }
  },

  refresh() {
    SyncManagerBridge.getInfo().then(this.onsyncchange.bind(this));
  }
};

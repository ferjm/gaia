'use strict';

var App = {
  urls: {
    "firefox": "",
    "chrome": "",
    "safari": "",
     "ie": ""
  },

  icons: {},

  init: () => {
    function toCamelCase(str) {
      return str.replace(/\-(.)/g, (str, p1) => {
        return p1.toUpperCase();
      });
    }

    ['firefox',
     'chrome',
     'safari',
     'ie'].forEach((id) => {
      var button = document.getElementById(id);
      this[toCamelCase(id)] = button;
      (() => {
        button.onclick = (event) => {
          App.onbuttonclick(event.target, id);
        };
      })(id);
    });
  },

  getBookmarksInfo: () => {
  },

  onbuttonclick: (aButton, aId) => {
    (aButton.dataset.type == 'unbookmark') ? App.addBookmark(aButton, aId) :
                                             App.removeBookmark(aButton, aId);
  },

  getIcon: (aId) => {
    if (App.icons[aId]) {
      return Promise.resolve(App.icons[aId]);
    }

    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      var file = 'images/' + aId + '.png';
      xhr.open('GET', file, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = (e) => {
        var arrayBufferView = new Uint8Array(xhr.response);
        var blob = new Blob([arrayBufferView], {type: 'image/jpeg'});
        App.icons[aId] = blob;
        resolve(blob);
      };
      xhr.send();
    });
  },

  addBookmark: (aButton, aId) => {
    App.getIcon(aId).then((icon) => {
      console.log(" icon ", icon);
      var input = document.getElementById('input-' + aId);
      var bookmark = {
        name: input.value,
        icon: icon,
        url: App.urls[aId]
      };
      BookmarksProvider.save(bookmark).then(() => {
        aButton.dataset.type = 'bookmark';
      }, () => {
        console.error('Could not add bookmark');
      });
    });
  },

  removeBookmark: (aButton, aId) => {
  }
};

window.addEventListener('DOMContentLoaded', function onload() {
  window.removeEventListener('DOMContentLoaded', onload);
  App.init();
});

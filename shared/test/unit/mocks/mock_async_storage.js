/*exported MockasyncStorage */

'use strict';

var MockasyncStorage = {
  _mRawContent: {},
  getItem: function(key, callback) {
    console.log('getting!');
    callback(this._mRawContent[key]);
  },
  setItem: function(key, value, callback) {
    console.log('setting!');
    this._mRawContent[key] = value;
    callback();
  },
  removeItem: function(key, callback) {
    delete this._mRawContent[key];
  },
  clear: function(callback) {
    console.log('clearing!');
    this._mRawContent = {};
    callback();
  }
};

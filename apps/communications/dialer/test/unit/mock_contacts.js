var MockContacts = {

  // We need to test calls without contact information
  // so we'll return that info depending on the
  // calling number
  // '111': No contacts
  // '222': More than 1 contact for that number
  // Any other: 1 contact
  findByNumber: function findByNumber(number, callback) {
    this.mCalledWith = number;
    this.mPhoto = 'test';
    this.mName = 'test name';
    var tel = {
      value: this.mCalledWith,
      carrier: this.mCarrier,
      type: this.mType
    };
    var contact = {
      name: [this.mName],
      tel: [tel],
      photo: [this.mPhoto]
    };
    var ids = [];
    switch (number) {
      case '111':
        this.mPhoto = null;
        this.mName = null;
        contact = null;
        tel = null;
        break;
      case '222':
        ids = ['id1', 'id2'];
        break;
      default:
    }

    callback(contact, tel, ids);
  },
  findListByNumber: function cm_getContactData(number, maxitems, callback) {
    callback(this.mResult);
  },
  mPhoto: null,
  mName: null,
  mCalledWith: null,
  mCarrier: 'carrier',
  mType: 'type',
  mResult: null,
  mTearDown: function tearDown() {
    this._calledWith = null;
    this.mCarrier = 'carrier';
    this.mType = 'type';
  }
};

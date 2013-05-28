requireApp('communications/dialer/js/call_log_db.js');
requireApp('communications/dialer/js/utils.js');
requireApp('communications/dialer/test/unit/mock_lazy_loader.js');
requireApp('communications/dialer/test/unit/mock_contacts.js');

if (!this.Contacts) {
  this.Contacts = null;
}

if (!this.LazyLoader) {
  this.LazyLoader = null;
}

suite('dialer/call_log_db', function() {
  var realLazyLoader;
  var realContacts;

  // According to mock_contacts.js, 123 will have an associated test contact
  // 111 will have no contact associated and 222 will have more than 1 contact
  // for that number.
  var numbers = ['123', '111', '222'];
  var now = Date.now();
  var days = [// Day 1
              now,
              now + 1,
              // Day 2
              now + 86400000,
              now + 86400000 + 1,
              // Day 3
              now + (2 * 86400000),
              now + (2 * 86400000) + 1];

  function checkGroup(group, call, lastEntryDate, retryCount, contact, result) {
    var id = Utils.getDayDate(call.date) + '-' + call.number + '-' + call.type;
    if (call.status) {
      id += '-' + call.status;
    }
    assert.equal(group.id, id);
    assert.equal(group.number, call.number);
    assert.equal(group.date, Utils.getDayDate(call.date));
    assert.equal(group.type, call.type);
    assert.equal(group.status, call.status);
    assert.equal(group.retryCount, retryCount);
    assert.equal(group.lastEntryDate, lastEntryDate);
    if (contact) {
      assert.equal(typeof group.contact, 'object');
      assert.equal(group.contact.id, MockContacts.mId);
      assert.equal(group.contact.primaryInfo, MockContacts.mName);
      assert.equal(group.contact.matchingTel.number, group.number);
      assert.equal(group.contact.matchingTel.carrier, MockContacts.mCarrier);
      assert.equal(group.contact.matchingTel.type, MockContacts.mType);
      assert.equal(group.contact.photo, MockContacts.mPhoto);
    }
    if (result) {
      assert.equal(group.number, result.number);
      assert.equal(group.date, result.date);
      assert.equal(group.type, result.type);
      assert.equal(group.status, result.status);
      assert.equal(group.retryCount, result.retryCount);
      assert.equal(group.lastEntryDate, result.lastEntryDate);
    }
  }

  function checkGroupId(groupId, expected) {
    assert.equal(groupId.length, expected.length);
    for (var i = 0, j = groupId.length; i < j; i++) {
      assert.equal(groupId[i], expected[i]);
    }
  }

  function checkCall(call, expected) {
    assert.equal(call.number, expected.number);
    assert.equal(call.type, expected.type);
    assert.equal(call.date, expected.date);
    assert.equal(call.status, expected.status);
    checkGroupId(call.groupId, CallLogDBManager._getGroupId(call));
  }

  setup(function() {
    realLazyLoader = window.LazyLoader;
    window.LazyLoader = MockLazyLoader;

    realContacts = window.Contacts;
    window.Contacts = MockContacts;
  });

  teardown(function() {
    window.LazyLoader = realLazyLoader;
    window.Contacts = realContacts;
  });

  suite('Clean up', function() {
    test('delete_db', function(done) {
      CallLogDBManager.deleteDb(function() {
        assert.ok(true, 'Recents DB deleted');
        done();
      });
    });
  });

  suite('Failed insert', function() {
    test('Fail adding a call', function(done) {
      CallLogDBManager.add('invalidcall', function(result) {
        assert.equal(result, 'INVALID_CALL');
        done();
      });
    });
  });

  suite('Single call', function() {
    test('Add a call', function(done) {
      var call = {
        number: numbers[0],
        type: 'incoming',
        date: days[0]
      };
      CallLogDBManager.add(call, function(result) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.equal(groups.length, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          });
        });
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Single call with status', function() {
    test('Add a call', function(done) {
      var call = {
        number: numbers[0],
        type: 'incoming',
        date: days[0],
        status: 'connected'
      };
      CallLogDBManager.add(call, function(result) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.equal(groups.length, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          });
        });
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Single call from hidden number', function() {
    test('Add a call', function(done) {
      var call = {
        number: '',
        type: 'incoming',
        date: days[0]
      };
      CallLogDBManager.add(call, function(result) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.equal(groups.length, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          });
        });
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Two calls, same group, different hour', function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[0]
    };

    var call2 = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[1]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(result) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          });
        });
      });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(result) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call2, call2.date, 2, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 2);
            checkCall(recents[0], call2);
            checkCall(recents[1], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Two calls, different group because of different number', function() {
    var result;
    var call = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[0]
    };

    var call2 = {
      number: numbers[1],
      type: 'incoming',
      status: 'connected',
      date: days[1]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(res) {
        result = res;
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(res) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 2);
          checkGroup(groups[0], call, call.date, 1, false, result);
          checkGroup(groups[1], call2, call2.date, 1, false, res);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 2);
            checkCall(recents[0], call2);
            checkCall(recents[1], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Two calls, different group because of different day', function() {
    var result;
    var call = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[0]
    };

    var call2 = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[2]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(res) {
        result = res;
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(res) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 2);
          checkGroup(groups[0], call2, call2.date, 1, true, res);
          checkGroup(groups[1], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 2);
            checkCall(recents[0], call2);
            checkCall(recents[1], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Two calls, different group because of different type', function() {
    var result;
    var call = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[0]
    };

    var call2 = {
      number: numbers[0],
      type: 'dialing',
      date: days[1]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(res) {
        result = res;
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(res) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 2);
          checkGroup(groups[0], call, call.date, 1, true, result);
          checkGroup(groups[1], call2, call2.date, 1, true, res);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 2);
            checkCall(recents[0], call2);
            checkCall(recents[1], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Two calls, different group because of different status', function() {
    var result;
    var call = {
      number: numbers[0],
      type: 'incoming',
      status: 'connected',
      date: days[0]
    };

    var call2 = {
      number: numbers[0],
      type: 'incoming',
      date: days[1]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(res) {
        result = res;
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 1);
          checkGroup(groups[0], call, call.date, 1, true, result);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 1);
            checkCall(recents[0], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(res) {
        CallLogDBManager.getGroupList(function(groups) {
          assert.length(groups, 2);
          checkGroup(groups[0], call, call.date, 1, true, result);
          checkGroup(groups[1], call2, call2.date, 1, true, res);
          CallLogDBManager.getRecentList(function(recents) {
            assert.length(recents, 2);
            checkCall(recents[0], call2);
            checkCall(recents[1], call);
            done();
          }, null, true);
        }, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Get last group', function() {
    var call = {
      number: numbers[1],
      type: 'incoming',
      date: days[0]
    };
    var call2 = {
      number: numbers[2],
      type: 'dialing',
      date: days[4]
    };
    var call3 = {
      number: numbers[0],
      type: 'incoming',
      date: days[2]
    };
    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add a call', function(done) {
      CallLogDBManager.add(call2, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call3, function() {
        CallLogDBManager.getLastGroup(function(group) {
          checkGroup(group, call2, call2.date, 1, true);
          done();
        });
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Get last group sorted by date', function() {
    var call = {
      number: numbers[1],
      type: 'incoming',
      date: days[0]
    };
    var call2 = {
      number: numbers[2],
      type: 'dialing',
      date: days[4]
    };
    var call3 = {
      number: numbers[0],
      type: 'incoming',
      date: days[2]
    };
    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add a call', function(done) {
      CallLogDBManager.add(call2, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call3, function() {
        CallLogDBManager.getGroupList(function(groups) {
          assert.equal(groups.length, 3);
          checkGroup(groups[2], call2, call2.date, 1, true);
          done();
        });
      });
    }, 'date');

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Get groups requesting a cursor', function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      date: days[0]
    };
    var call2 = {
      number: numbers[1],
      type: 'dialing',
      date: days[2]
    };
    var call3 = {
      number: numbers[0],
      type: 'incoming',
      date: days[4]
    };
    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add a call', function(done) {
      CallLogDBManager.add(call2, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call3, function() {
        CallLogDBManager.getGroupList(function(cursor) {
          checkGroup(cursor.value, call, call.date, 1, true);
          done();
        }, null, null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Get groups requesting a cursor sorted by date', function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      date: days[0]
    };
    var call2 = {
      number: numbers[1],
      type: 'dialing',
      date: days[2]
    };
    var call3 = {
      number: numbers[2],
      type: 'incoming',
      date: days[4]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add a call', function(done) {
      CallLogDBManager.add(call2, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call3, function() {
        CallLogDBManager.getGroupList(function(cursor) {
          checkGroup(cursor.value, call, call.date, 1, true);
          done();
        }, 'lastEntryDate', null, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Get groups requesting a cursor sorted by date in reverse order',
        function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      date: days[0]
    };
    var call2 = {
      number: numbers[1],
      type: 'dialing',
      date: days[2]
    };
    var call3 = {
      number: numbers[2],
      type: 'incoming',
      date: days[4]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add a call', function(done) {
      CallLogDBManager.add(call2, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call3, function() {
        CallLogDBManager.getGroupList(function(cursor) {
          checkGroup(cursor.value, call3, call3.date, 1, true);
          done();
        }, 'lastEntryDate', true, true);
      });
    });

    suiteTeardown(function(done) {
      CallLogDBManager.deleteAll(function() {
        done();
      });
    });
  });

  suite('Delete a group of calls', function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      date: days[0]
    };
    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(group) {
        checkGroup(group, call, call.date, 1, true);
        CallLogDBManager.deleteGroup(group, function(result) {
          assert.equal(result, 1);
          done();
        });
      });
    });
  });

  suite('Delete a group of calls with 2 calls', function() {
    var call = {
      number: numbers[0],
      type: 'incoming',
      date: days[0]
    };

    var call2 = {
      number: numbers[0],
      type: 'incoming',
      date: days[1]
    };

    test('Add a call', function(done) {
      CallLogDBManager.add(call, function() { done(); });
    });

    test('Add another call', function(done) {
      CallLogDBManager.add(call2, function(group) {
        CallLogDBManager.deleteGroup(group, function(result) {
          assert.equal(result, 2);
          done();
        });
      });
    });
  });

  suite('Delete a group of hidden calls', function() {
    var call = {
      number: '',
      type: 'incoming',
      date: days[0]
    };
    test('Add a call', function(done) {
      CallLogDBManager.add(call, function(group) {
        checkGroup(group, call, call.date, 1, false);
        CallLogDBManager.deleteGroup(group, function(result) {
          assert.equal(result, 1);
          done();
        });
      });
    });
  });

  suite('getGroupList with invalid sortedBy', function() {
    test('getGroupList should fail', function(done){
      CallLogDBManager.getGroupList(function(error) {
        assert.ok(error);
        assert.equal(typeof error, 'string');
        assert.equal(error, 'INVALID_SORTED_BY_KEY');
        done();
      }, 'notvalidindex');
    });
  });

  suite('getRecentList with invalid sortedBy', function() {
    test('getRecentList should fail', function(done){
      CallLogDBManager.getRecentList(function(error) {
        assert.ok(error);
        assert.equal(typeof error, 'string');
        assert.equal(error, 'INVALID_SORTED_BY_KEY');
        done();
      }, 'notvalidindex');
    });
  });

});

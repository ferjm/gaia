'use strict';

require('/shared/js/fxa_iac_client.js');
requireApp('system/test/unit/mock_apps_mgmt.js');
requireApp('system/test/unit/mock_app.js');

suite('FirefoxOS Accounts IAC Client Suite', function() {

  var realMozApps;

  var port = {
    'postMessage': function() {},
    set onmessage(cb) {cb({data: {data: {}}})}
  };
  var postMessageStub;

  suiteSetup(function() {
    realMozApps = navigator.mozApps;
    navigator.mozApps = MockAppsMgmt;
  });

  suiteTeardown(function() {
    navigator.mozApps = realMozApps;
  });

  setup(function() {
    // For each test, setup the 'self' app, able to
    // do IAC
    var app = new MockApp({
      'connect': function(keyword) {
        var future = {
          'then': function(cb) {}
        };
        var connectStub = sinon.stub(future, 'then', function(cb) {
          postMessageStub = sinon.stub(port, 'postMessage');
          cb([port]);
        });
        return future;
      }
    });
    navigator.mozApps.setSelf(app);
  });

  teardown(function() {
    if (postMessageStub && postMessageStub.restore) {
       postMessageStub.restore();
    }
  });

  test('Library integrity', function() {
    assert.isNotNull(FXA_IAC_Client);
    assert.equal(Object.keys(FXA_IAC_Client).length, 5);
  });

  test('Connect with default parameters', function(done) {
    // Create a specific moc for checking the connect parameters
    var app = new MockApp({
      'connect': function(keyword, options) {
        var future = {'then': function(cb) {}};

        assert.equal(keyword, 'fxa-mgmt');
        assert.deepEqual(options, {
          'manifestURLs':
            ['app://system.gaiamobile.org/manifest.webapp']
        });

        done();
        return future;
      }
    });
    navigator.mozApps.setSelf(app);

    //Invoque one of the methods
    // We don't care about callbacks, wont ever been invoqued since
    // the 'then' function doesnt call anything else
    FXA_IAC_Client.queryAccount('myemail@myserver.com', null, null);
  });

  test('Connect with custom parameters', function(done) {
    // Create a specific moc for checking the connect parameters
    var app = new MockApp({
      'connect': function(keyword, options) {
        var future = {'then': function(cb) {}};

        assert.equal(keyword, 'mykeyword');
        assert.deepEqual(options, {
          'manifestURLs':
            ['manifest.webapp']
        });

        // Reset to default values
        FXA_IAC_Client.reset();

        done();
        return future;
      }
    });
    navigator.mozApps.setSelf(app);

    FXA_IAC_Client.init({'keyword': 'mykeyword',
      'rules': {
        'manifestURLs':
            ['manifest.webapp']
      }
    });

    //Invoque one of the methods
    // We don't care about callbacks, wont ever been invoqued since
    // the 'then' function doesnt call anything else
    FXA_IAC_Client.queryAccount('myemail@myserver.com', null, null);

  });

  test('Something wrong happens with mozApps', function(done) {
    // Be sure that something is wrong with mozapps ;)
    navigator.mozApps.setSelf(null);
    FXA_IAC_Client.queryAccount('myemail@myserver.com',
    function() {
      // We should never get an success here
      assert.ok(false);
      done();
    },
    function() {
      // So far we need to get an error if
      // something is wrong
      assert.ok(true);
      done();
    });
  });

  suite('QueryAccount suite', function() {
    test('Check that we send the correct message', function(done) {
      var email = 'myemail@myserver.com';
      FXA_IAC_Client.queryAccount(email,
        function() {
          assert.ok(postMessageStub.called);
          var arg = postMessageStub.args[0][0];
          // We do have an id for this message
          assert.isNotNull(arg.id);
          assert.isNotNull(arg);
          // Remove the id, as it's automatically generated
          delete arg.id;

          assert.deepEqual(arg, {
            'name': 'queryAccount',
            'data': {
              'email': email
              }
          });
          done();
        },
        function() {
          assert.ok(false);
          done();
        }
      );
    });
  });

  suite('Sign* suite', function() {
    ['signUp', 'signIn'].forEach(function(method) {
      test('Check that we send the ' + method + ' message', function(done) {
        var email = 'second@myserver.com';
        var password = 'secret';
        FXA_IAC_Client[method](email, password,
          function() {
            assert.ok(postMessageStub.called);
            var arg = postMessageStub.args[0][0];
            // We do have an id for this message
            assert.isNotNull(arg.id);
            assert.isNotNull(arg);
            // Remove the id, as it's automatically generated
            delete arg.id;

            assert.deepEqual(arg, {
              'name': method,
              'data': {
                'email': email,
                'password': password
              }
            });
            done();
          },
          function() {
            // Break if we are called.
            assert.ok(false);
            done();
          }
        );
      });
    });
  });
});

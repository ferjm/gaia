'use strict';

(function(exports) {
  var debug = true;
  // TODO Check options for tuning the performance
  var publisherOptions = {
    publishAudio:true,
    publishVideo:false // Disabled by default
  };

  var publisher, session;

  function _sessionConnectedHandler (event, callback) {
    if (typeof callback !== 'function') {
      callback = function() {};
    }
    debug && console.log('DEBUG CallHandler: Session connected');
    debug && console.log('DEBUG CallHandler: Currently we have ' + event.streams);
    session.publish(publisher, null, function(error) {
      if (error) {
        debug && console.log('DEBUG CallHandler: Own stream NOT published');
        callback('Error while publishing');
      } else {
        debug && console.log('DEBUG CallHandler: Own stream published!!!');
        callback();
      }
    });
  };

  function _streamCreatedHandler(event, callback) {
    if (typeof callback !== 'function') {
      callback = function() {};
    }
    debug && console.log('DEBUG CallHandler: Stream created/connected ' + event.streams.length);
    _subscribeToStreams(event.streams);
    callback();
  }

  function _subscribeToStreams(streams) {
    for (var i = 0; i < streams.length; i++) {
      var stream = streams[i];
      if (stream.connection.connectionId
           != session.connection.connectionId) {
        session.subscribe(stream);
      }
    }
  }

  function _streamDestroyedHandler(event, callback) {
    if (typeof callback !== 'function') {
      callback = function() {};
    }
    debug && console.log('DEBUG CallHandler: Stream destroyed ' + event.streams.length);

    if (event.streams.length < 2) {
      if (!window.navigator.mozSetMessageHandler) {
        UIManager.outgoing(function(number, callback) {
          CallHandler.dial({
             type: 'msisdn',
             value: number
          }, callback);
        });
      } else {
        window.close();
      }
      
    }
    callback();
  }

  var CallHandler = {
    /**
     * Setup all the headers needed in the application for any request to the
     * server.
     * @param sessionID String Session ID which represent a 'room'
     * @param apiKey String TokBox Api Key
     * @param token String Provisional token for the session
     * @param target String DOM ID where the stream is going to be published
     * @param onConnected Function Connected to the session
     * @param onStream String New stream registered in the session
     */
    join: function ch_join(apiKey, sessionID, token, target, onConnected, onStream) {
      publisher = TB.initPublisher(apiKey, target, publisherOptions);
      session   = TB.initSession(sessionID);
      session.connect(apiKey, token);

      session.addEventListener(
        'sessionConnected',
        function onConnectedHandler(event) {
          _sessionConnectedHandler(event, onConnected);
        }
      );

      session.addEventListener(
        'streamCreated',
        function onStreamHandler(event) {
          _streamCreatedHandler(event, onStream);
        }
      );

      session.addEventListener(
        'streamDestroyed',
        function onStreamDestroyedHandler(event) {
          _streamDestroyedHandler(event, null);
        }
      );

      session.addEventListener(
        'connectionDestroyed',
        function onConnectionDestroyedHandler(event) {
          console.log('Connection destroyed');
        }
      );
    },
    /**
     * Setup all the headers needed in the application for any request to the
     * server.
     * @param alias Object Must contains 'type' (MSISDN, mail...) & value
     */
    dial: function ch_dial(alias, callback) {
      TokFoxClient.createSession(
        'publisher',
        null,
        function(cs_error, cs_result) {
          if (cs_error) {
            if (typeof callback === 'function') {
              callback(cs_error, cs_result);
            }
            return;
          }

      
        // Retrieve credentials to be used for inviting
        var apiKey = cs_result.apiKey;
        var sessionId = cs_result.sessionId;
        var token = cs_result.token;

        if (!token || !apiKey || !sessionId) {
                var error = {};
                error.msg = 'Result from /Session is not valid';
                if (typeof callback === 'function') {
            callback(error, null);
                }
          return;
        }

        TokFoxClient.invite(alias.type,
          alias.value,
          sessionId,
          function(i_error, i_result) {
            if (typeof callback === 'function') {
              if (!i_error && i_result) {
                CallHandler.join(apiKey, sessionId, token);
              }
              callback(i_error, i_result);
            }
          }
        );
      });
    },

    onCall: function ch_oncall(invitationID) {
      navigator.mozApps.getSelf().onsuccess = function (evt) {
        var app = evt.target.result;
        app.launch();
      };
      //
      UIManager.incoming(
        null,
        'Incoming call',
        function() {
          TokFoxClient.acceptInvitation(
            invitationID,
            function (error, result) {
              CallHandler.join(result.apiKey, result.sessionId, result.token);
            }
          );
        },
        function() {
          window.close();
        }
      );
      
    },

    disconnect: function ch_disconnect() {
      // TODO Add tokbox disconnect
      publisher = null;
      session.disconnect();
      session = null;
    }
  };

  exports.CallHandler = CallHandler;

}(this));

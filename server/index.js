/**
 * @fileoverview Server-side calibration component
 * @author Jean-Philippe.Lambert@ircam.fr
 */

'use strict';

var debug = require('debug')('soundworks:server:calibration');
var fs = require('fs');
var pjson = require('../package.json'); // version
var path = require('path');
var string = require('../common/string');

var CalibrationServer = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var proto$0={};
  /**
   * This is the constructor. See {@linkcode CalibrationServer~save}
   * and {@linkcode CalibrationServer~load}
   *
   * @constructs CalibrationServer
   * @param {Object} [persistent]
   * @param {String} [persistent.path='../../data']
   * @param {String} [persistent.file='calibration.json']
   * @param {String} [persistent.fileEncoding='utf8']
   */
  function CalibrationServer() {var params = arguments[0];if(params === void 0)params = { persistent: {} };
    this.persistent = {};
    if(typeof params.persistent === 'undefined') {
      params.persistent = {};
    }

    this.persistent.path = (typeof params.persistent.path !== 'undefined'
                            ? params.persistent.path
                            : path.join(__dirname, '../../data') );

    this.persistent.file
      = path.join(this.persistent.path,
                  (typeof params.persistent.file !== 'undefined'
                   ? params.persistent.file
                   : 'calibration.json') );

    this.persistent.fileEncoding
      = (typeof params.persistent.fileEncoding !== 'undefined'
         ? params.persistent.fileEncoding
         : 'utf8' );

    this.persistent.data = {};

    try {
      fs.mkdirSync(this.persistent.path);
      console.log('Creating data directory: ' + this.persistent.path);
    } catch (error) {
      if(error.code === 'EEXIST') {
        debug('Using existing data directory: ' + this.persistent.path);
      }
      else {
        console.log('Error creating data directory: ' + this.persistent.path);
      }
    }

    try {
      var data = fs.readFileSync(this.persistent.file,
                                   this.persistent.fileEncoding);
      this.persistent.data = JSON.parse(data);
    } catch (error) {
      if(error.code === 'ENOENT') {
        debug('Creating new persistent file: ' + this.persistent.file);
      } else {
        console.log('Error while reading persistent file: ' + error);
      }
    }
    this.persistent.data[pjson.name + '.version'] = pjson.version;

    this.levenshtein = new string.Levenshtein();
  }DP$0(CalibrationServer,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /**
   * Store the given calibration.
   *
   * @function CalibrationServer~save
   * @param {Object} params
   * @param {String} params.id key used to store and retrieve the
   * associated calibration. See {@linkcode CalibrationClient~getId}.
   * @param {calibration} params.calibration to store
   * @returns {Boolean} true if file is actually written. Please note
   * that the write operation is asynchronous.
   */
  proto$0.save = function(params) {
    var writeFile = false;
    if(typeof params !== 'undefined'
       && typeof params.id !== 'undefined'
       && typeof params.calibration !== 'undefined') {
      var date = new Date();

      if(typeof params.calibration.audio !== 'undefined')
      {
        writeFile = true;
        if(typeof this.persistent.data[params.id] === 'undefined') {
          this.persistent.data[params.id] = {};
        }

        if(typeof this.persistent.data[params.id].audio
           === 'undefined') {
          this.persistent.data[params.id].audio = {};
        }
        // outputs = ['internal', 'external']
        for(var output in params.calibration.audio) {
          if(params.calibration.audio.hasOwnProperty(output) ) {

            if(typeof this.persistent.data[params.id].audio[output]
               === 'undefined') {
              this.persistent.data[params.id].audio[output] = [];
            }

            this.persistent.data[params.id].audio[output]
              .push([date.toISOString(), params.calibration.audio[output] ] );

            debug('%s: %s -> %s', date.toISOString(), params.id,
                  params.calibration.audio[output]);
          }
        }
      }

      if(typeof params.calibration.network !== 'undefined')
      {
        writeFile = true;
        if(typeof this.persistent.data[params.id] === 'undefined') {
          this.persistent.data[params.id] = {};
        }

        if(typeof this.persistent.data[params.id].network === 'undefined') {
          this.persistent.data[params.id].network = [];
        }
        this.persistent.data[params.id].network
          .push([date.toISOString(), params.calibration.network]);

        debug('%s: %s -> %s', date.toISOString(), params.id,
              params.calibration.network);
      }

      if(writeFile) {
        fs.writeFile(this.persistent.file, JSON.stringify(this.persistent.data) );
      }
    }
    return writeFile;
  };

  /**
   * @typedef CalibrationServer~loadReturn
   * @type Object
   * @property {calibration} calibration or empty object {} if nothing
   * found.
   * @property {Number} distance, which is Infinity if nothing found.
   */

  /**
   * Return calibration, and distance, which is the closest to the
   * given key (see {@linkcode ClientCalibration~getId}).
   *
   * @function CalibrationServer~load
   * @param {Object} params
   * @param {String} params.id key used for look-up
   * @returns {CalibrationServer~loadReturn}
   */
  proto$0.load = function(params) {
    var ret = {
      calibration: {},
      distance: Infinity
    };

    if(typeof this.persistent.data !== 'undefined'
       && typeof params !== 'undefined'
       && typeof params.id !== 'undefined') {
      var closest = this.levenshtein.closestKey(this.persistent.data,
                                                  params.id);
      debug('%s -> %s (%s)', params.id, closest.key, closest.distance);

      var data = this.persistent.data[closest.key];
      if(typeof data !== 'undefined') {
        if(typeof data.audio !== 'undefined') {
          // outputs = ['internal', 'external']
          for(var output in data.audio) {
            if(data.audio.hasOwnProperty(output) ) {
              if(typeof ret.calibration.audio === 'undefined') {
                ret.calibration.audio = {};
              }
              // retrieve last value
              ret.calibration.audio[output] = data.audio[output].slice(-1)[0][1];
              // use the distance, as some audio calibration exists
              ret.distance = closest.distance;
            }
          }
        }

        if(typeof data.network !== 'undefined') {
          // retrieve last value
          ret.calibration.network = data.network.slice(-1)[0][1];
        }

      }
    }

    return ret;
  };

MIXIN$0(CalibrationServer.prototype,proto$0);proto$0=void 0;return CalibrationServer;})(); // class CalibrationServer

module.exports = exports = CalibrationServer;
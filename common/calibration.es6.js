/**
 * @fileOverview calibration object definition
 * @name calibration.es6.js
 * @author Jean-Philippe.Lambert@ircam.fr
 */

'use strict';

/**
 * This object may not define all properties, like external
 * audio.external, or network statistics. In particular, it could be
 * the empty object {} if no calibration is available.
 *
 * @typedef {Object} calibration
 * @property {Object} audio
 * @property {Object} audio.internal audio output
 * @property {Number} audio.internal.delay in seconds
 * @property {Number} audio.internal.gain in dB
 * @property {Object} audio.external external audio output
 * @property {Number} audio.external.delay in seconds
 * @property {Number} audio.external.gain in dB
 * @property {Object} network
 * @property {Number} network.delay in seconds
 * @property {Number} network.delayMax in seconds
 **/


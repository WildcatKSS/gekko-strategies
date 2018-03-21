/*

MIT License

Copyright (c) 2018 Spiros Koutsopodiotis spiros@primous.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*

RSI - MACD 21-03-2018

*/

// Helpers
var _ = require('lodash');
var log = require('../core/log.js');
var RSI = require('./indicators/RSI.js');
var DEMA = require('./indicators/MACD.js');

// Strategy
var method = {};

// Prepare everything the strategy needs
method.init = function () {
  this.name = 'RSI-MACD';

  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

    this.RSIhigh = this.settings.thresholds.RSIhigh;
    this.RSIlow = this.settings.thresholds.RSIlow;
    this.MACDhigh = this.settings.thresholds.MACDhigh;
    this.MACDlow = this.settings.thresholds.MACDlow;
    this.persistance = this.settings.thresholds.persistance;

    const MACDSettings = this.settings.MACD;
    const EMAshortSettings = this.settings.EMAshort;
    const EMAlongSettings = this.settings.EMAlong;
    const STOCHSettings = this.settings.STOCH;
    const RSISettings = this.settings.RSI;

    this.addTulipIndicator('MACD', 'macd', MACDSettings);
    this.addTulipIndicator('EMAshort', 'ema', EMAshortSettings);
    this.addTulipIndicator('EMAlong', 'ema', EMAlongSettings);
    this.addTulipIndicator('RSI', 'rsi', RSISettings);
    this.addTulipIndicator('STOCH', 'stoch', STOCHSettings);
}

method.update = function (candle) {
    this.macd = this.tulipIndicators.MACD.result.macd;
    this.rsi = this.tulipIndicators.RSI.result.result;
    this.emashort = this.tulipIndicators.EMAshort.result.result;
    this.emalong = this.tulipIndicators.EMAlong.result.result;
    this.stochK = this.tulipIndicators.STOCH.result.stochK;
    this.stochD = this.tulipIndicators.STOCH.result.stochD;
}

method.log = function () {
    log.info(`
<==============================>
MACD: ${this.macd}
RSI: ${this.rsi}
EMA Short: ${this.emashort}
EMA LSong: ${this.emalong}
STOCH K: ${this.stochK}
STOCH D: ${this.stochD}
<===============================>
`);
}

method.check = function (candle) {
    if (this.emashort > this.emalong && this.stochK > this.stochD && this.macd > this.MACDhigh && this.rsi > this.RSIhigh) {
        if (this.trend.direction !== 'up') {
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'up',
                adviced: false
            };
        }

        this.trend.duration++;

        log.info('In uptrend since', this.trend.duration, 'candle (s)');

        if (this.trend.duration >= this.persistance) {
            this.trend.persisted = true;
        }

        if (this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            this.advice('long');
        } else {
            this.advice();
        }
    } else if (this.emashort < this.emalong && this.stochK < this.stochD && this.macd < this.MACDlow && this.rsi < this.RSIlow) {
        if (this.trend.direction !== 'down') {
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'down',
                adviced: false
            };
        }

        this.trend.duration++;

        log.info('In downtrend since', this.trend.duration, 'candle (s)');

        if (this.trend.duration >= this.persistance) {
            this.trend.persisted = true;
        }

        if (this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            this.advice('short');
        } else {
            this.advice();
        }
    } else {
        log.info('In no trend');
        this.advice();
    }
}

module.exports = method;

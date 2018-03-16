#
# MIT License
#
# Copyright (c) 2018 WildcatKSS
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#
/*

        Private Strategy 21-01-2018

        Trailing stop - DEMA - RSI

*/

// helpers
var _ = require('lodash');
var log = require('../core/log.js');
var DEMA = require('./indicators/DEMA.js');
var RSI = require('./indicators/RSI.js');

// Let's create the strategy
var method = {};

// Prepare everything the strategy needs
method.init = function() {
        this.name = 'DEMA-RSI';
        this.requiredHistory = 21; // require 0 candles before giving advice
        this.trend = {
                duration: 0,
                persisted: false,
                direction: 'none',
                adviced: false
        };
        this.momentum = {
                duration: 0,
                persisted: false,
                direction: 'none',
                adviced: false
        };

        // define the indicators we need
        this.addIndicator('dema', 'DEMA', this.settings);
        this.addIndicator('rsi', 'RSI', this.settings);
}

// What happens on every new candle?
method.update = function(candle) {
        // nothing!
}

// For debugging purposes.
method.log = function(candle) {
        var digits = 8;
        var dema = this.indicators.dema;
        var rsi = this.indicators.rsi;

//      log.debug('');
//      log.debug('=============================================================');
//      log.debug('calculated DEMA properties for candle:');
//      log.debug('\t', 'long ema:', dema.long.result.toFixed(digits));
//      log.debug('\t', 'short ema:', dema.short.result.toFixed(digits));
//      log.debug('\t diff:', dema.result.toFixed(digits));
//      log.debug('\t DEMA age:', dema.short.age, 'candles');
//      log.debug('');
//      log.debug('calculated RSI properties for candle:');
//      log.debug('\t', 'rsi:', rsi.result.toFixed(digits));
//      log.debug('\t', 'price:', candle.close.toFixed(digits));
//      log.debug('=============================================================');
//      log.debug('');
}

// Based on the newly calculated information, check if we should update or not.
method.check = function(candle) {
        var digits = 8;

        // Variables for DEMA
        var dema = this.indicators.dema;
        var diff = dema.result;
        var price = candle.close;
        var messageTrend = '@ ' + price.toFixed(digits) + ' (' + diff.toFixed(digits) + ')';

        // Variables for RSI
        var rsi = this.indicators.rsi;
        var rsiVal = rsi.result;
        var messageMomentum = '@ ' + price.toFixed(digits) + ' (' + rsiVal.toFixed(digits) + ')';

        // DEMA - RSI
        if(diff > this.settings.thresholds.up) {
                // new trend detected
                if(this.trend.direction !== 'up')
                        this.trend = {
                        duration: 0,
                        persisted: false,
                        direction: 'up',
                        adviced: false
                };

                this.trend.duration++;

                log.debug('In uptrend since', this.trend.duration, 'Candle(s)', messageTrend);

                if(this.trend.duration >= this.settings.thresholds.DEMApersistence)
                        this.trend.persisted = true;

        } else if(diff < this.settings.thresholds.down) {
                // new trend detected
                if(this.trend.direction !== 'down')
                        this.trend = {
                        duration: 0,
                        persisted: false,
                        direction: 'down',
                        adviced: false
                };

                this.trend.duration++;

                log.debug('In downtrend since', this.trend.duration, 'Candle(s)', messageTrend);

                if(this.trend.duration >= this.settings.thresholds.DEMApersistence)
                        this.trend.persisted = true;

        } else {

                log.debug('No trend', messageTrend);
          
                this.advice();
        }

        if(rsiVal > this.settings.thresholds.high) {
                // new momentum detected
                if(this.momentum.direction !== 'high')
                        this.momentum = {
                        duration: 0,
                        persisted: false,
                        direction: 'high',
                        adviced: false
                };

                this.momentum.duration++;

                log.debug('In high momentum since', this.momentum.duration, 'candle(s)', messageMomentum);

                if(this.momentum.duration >= this.settings.thresholds.RSIpersistence)
                        this.momentum.persisted = true;


        } else if(rsiVal < this.settings.thresholds.low) {
                // new momentum detected
                if(this.momentum.direction !== 'low')
                        this.momentum = {
                        duration: 0,
                        persisted: false,
                        direction: 'low',
                        adviced: false
                };

                this.momentum.duration++;

                log.debug('In low momentum since', this.momentum.duration, 'candle(s)', messageMomentum);

                if(this.momentum.duration >= this.settings.thresholds.RSIpersistence)
                        this.momentum.persisted = true;

        } else {

                log.debug('No momentum', messageMomentum);

                this.advice();
        }

        if(this.trend.direction == 'up' && this.trend.persisted && !this.trend.adviced && this.momentum.direction == 'low' && this.momentum.persisted && !this.momentum.adviced) {
                this.trend.adviced = true;
                this.momentum.adviced = true;
                this.advice('long');

        } else if(this.trend.direction == 'down' && this.trend.persisted && !this.trend.adviced && this.momentum.direction == 'high' && this.momentum.persisted && !this.momentum.adviced) {
                this.trend.adviced = true;
                this.momentum.adviced = true;
                this.advice('short');

        } else



                this.advice();
}

// Optional for executing code after completion of a backtest. This block will not execute in live use as a live gekko is never ending.
method.end = function() {
        // nothing!
}

module.exports = method;

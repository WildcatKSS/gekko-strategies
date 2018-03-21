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

RSI - DEMA Strategy 21-03-2018

*/

// Helpers
var _ = require('lodash');
var log = require('../core/log.js');
var RSI = require('./indicators/RSI.js');
var DEMA = require('./indicators/DEMA.js');

// Strategy
var method = {};

// Prepare everything the strategy needs
method.init = function() {
        this.name = 'RSI-DEMA';
                
        this.trend = {
                duration: 0,
                persisted: false,
                direction: 'none',
                adviced: false
        };

        const RSIsettings = this.settings.RSI;
        const DEMAsettings = this.settings.DEMA;
        
        this.RSIlow = this.settings.thresholds.RSIlow;
        this.RSIhigh = this.settings.thresholds.RSIhigh;
        this.DEMAup = this.settings.thresholds.DEMAup;
        this.DEMAdown = this.settings.thresholds.DEMAdown;
        this.persistance = this.settings.thresholds.persistance;
        
        // Define the indicators we need
        this.addIndicator('rsi', 'RSI', RSIsettings);
        this.addIndicator('dema', 'DEMA', DEMAsettings);
}

// What happens on every new candle?
method.update = function(candle) {
        this.price = candle.close;
        this.rsi = this.indicators.rsi.result.result;
        this.dema = this.indicators.dema.result;
}

// For debugging purposes.
method.log = function(candle) {

        log.debug('
        =============================================================
        Price: ${this.price}
        RSI: ${this.rsi}
        DEMA: ${this.dema}
        =============================================================
        ');

}

// Based on the newly calculated information, check if we should but or sell.
method.check = function(candle) {
        if(this.rsi < this.RSIlow && this.dema > this.DEMAup) {
                // New trend detected
                if(this.trend.direction !== 'high')
                        this.trend = {
                        duration: 0,
                        persisted: false,
                        direction: 'high',
                        adviced: false
                };

                this.trend.duration++;

                log.debug('In uptrend since', this.trend.duration, 'candle (s)');

                if(this.trend.duration >= this.persistence)
                        this.trend.persisted = true;
                
                if (this.trend.persisted && !this.trend.adviced) {
                        this.trend.adviced = true;
                        this.advice('long');
        
                } else {
                        this.advice();
                }
        
        } else if(this.rsi > this.RSIhigh && this.dema < this.DEMAdown) {
                // New trend detected
                if(this.trend.direction !== 'low')
                        this.trend = {
                        duration: 0,
                        persisted: false,
                        direction: 'low',
                        adviced: false
                };

                this.trend.duration++;

                log.debug('In downtrend since', this.trend.duration, 'candle (s)');

                if(this.trend.duration >= this.persistence)
                        this.trend.persisted = true;

                if (this.trend.persisted && !this.trend.adviced) {
                        this.trend.adviced = true;
                        this.advice('short');
        
                } else {
                        this.advice();
                }

        } else {

                log.debug('No trend');
        
        }        
}

// Optional for executing code after completion of a backtest. This block will not execute in live use as a live gekko is never ending.
method.end = function() {
        // nothing!
}

module.exports = method;

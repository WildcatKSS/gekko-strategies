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

// helpers
var _ = require('lodash');
var log = require('../core/log.js');
var MACD = require('./indicators/MACD.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
	this.name = 'MACD-TS'; 
	
	this.trend = {
		direction: 'none',
		duration: 0,
		persisted: false,
		adviced: false
	};

	// how many candles do we need as a base before we can start giving advice?
	this.requiredHistory = this.tradingAdvisor.historySize;

	// define the indicators we need
	this.addIndicator('macd', 'MACD', this.settings.MACD);
	
	// define the thresholds
	this.up = this.settings.thresholds.up;
    	this.down = this.settings.thresholds.down;
	this.persistence = this.settings.thresholds.persistence;
}

// what happens on every new candle?
method.update = function(candle) {
	this.MACD = this.indicators.macd.result;
}

// for debugging purposes: log the last calculated parameters.
method.log = function() {
//    log.debug(`
//===============================
// MACD: ${this.MACD}
//===============================
//`);
}

method.check = function() {
	if(this.MACD > this.up) {
    if(this.trend.direction !== 'up')
		this.trend = {
			direction: 'up',
			duration: 0,
			persisted: false,
			adviced: false
		};

    this.trend.duration++;

    log.info('In uptrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.persistence)
		this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced) {
		this.trend.adviced = true;
		this.advice('long');
    } else
		this.advice();

	} else if(this.MACD < this.down) {
	if(this.trend.direction !== 'down')
		this.trend = {
			direction: 'down',
			duration: 0,
			persisted: false,
			adviced: false
		};

    this.trend.duration++;

    log.info('In downtrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.persistence)
		this.trend.persisted = true;

    if(this.trend.persisted && !this.trend.adviced) {
		this.trend.adviced = true;
		this.advice('short');
    } else
		this.advice();

	} else {
	if(this.trend.direction !== 'none')
		this.trend = {
			direction: 'none',
			duration: 0,
			persisted: false,
			adviced: false
		};
	
		this.trend.duration++;
		
		log.info('In no trend', this.trend.duration, 'candle(s)');
	
		this.advice();
	}
}

module.exports = method;

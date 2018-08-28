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

const log = require('../../core/log');

var Indicator = function(lossPercent) {
  this.input = 'candle';
  this.lastHighPrice = 0;
  this.lastBuyPrice = 0;
  this.shouldSell = false;
  this.lossPercent = lossPercent;
  this.timesStopped = 0;
}

Indicator.prototype.update = function(candle) {

  if(candle.high > this.lastHighPrice)
  {
      this.lastHighPrice = candle.high;
      this.shouldSell = false;
  }
  const stopPrice = this.lastHighPrice * ((100 - this.lossPercent) / 100);
  if(this.previousAction == 'buy' && candle.close < stopPrice)
  {
    this.timesStopped++;
    this.shouldSell = true;
    log.debug("StopLoss Triggered: " + this.timesStopped);
    log.debug("Last buy price: " + this.lastBuyPrice, " Last high price: " + this.lastHighPrice);
    const actualPercentChanged = (candle.close - this.lastBuyPrice) / this.lastBuyPrice * 100;
    log.debug("Current Price: " + candle.close, " Actual percent changed from buy: " +  actualPercentChanged);
    this.lastHighPrice = 0;
    this.lastBuyPrice = 0;
  }

}
Indicator.prototype.long = function(price){
  this.previousAction = 'buy';
  this.lastBuyPrice = price;
  this.lastHighPrice = price;
  this.shouldSell = false;
}
Indicator.prototype.short = function(price){
  this.previousAction = 'sell';
  this.shouldSell = false;
}
module.exports = Indicator;

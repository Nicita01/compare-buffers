'use strict';

const EventEmitter = require('events');
const common = require('metarhia-common');

const DEFAULT_LENGTH = 16385;
const MAX_ARRAYS_COUNT = 256;

function ArrayBuffer(length, maxArrays, timeout) {
  this.length = length || DEFAULT_LENGTH;
  this.maxArrays = maxArrays || MAX_ARRAYS_COUNT;
  this.size = 0;
  this.buffer = [];
  this.writeInterval = timeout || null;
  this.writeTimer = null;
}

common.inherits(ArrayBuffer, EventEmitter);

ArrayBuffer.prototype.write = function(buffer) {
  const bufferSize = buffer.byteLength;
  if (this.size + bufferSize <= this.length &&
    this.buffer.length + 1 <= this.maxArrays) {
    this.size += bufferSize;
    this.buffer.push(Buffer.from(buffer));
  } else {
    this.flush(buffer, bufferSize);
    this.buffer = [];
    this.size = 0;
  }
  clearTimeout(this.writeTimer);
  this.writeTimer = setTimeout(this.flush.bind(this), this.writeInterval);
};

ArrayBuffer.prototype.flush = function(buffer, bufferSize = 0) {
  const arrayBuffers = this.buffer.slice();
  if (buffer) {
    arrayBuffers.push(buffer);
  }
  this.emit('data', null, Buffer.concat(arrayBuffers, this.size + bufferSize));
};

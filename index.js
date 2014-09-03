var Readable = require('readable-stream');
var util = require('util');
var debug = require('debug')('s3-download-stream')
var async = require('async');
util.inherits(S3Readable, Readable);

module.exports = S3Readable;

function S3Readable(opts) {
  opts = opts || {};
  if (!(this instanceof S3Readable)) return new S3Readable(opts);
  if (!opts.client) throw Error("S3Readable: client option required (aws-sdk S3 client instance)")
  if (!opts.params) throw Error("S3Readable: params option required for getObject call")
  if (!opts.params.Key) throw Error("S3Readable: Key option required for getObject call")
  if (!opts.params.Bucket) throw Error("S3Readable: Bucket option required for getObject call")
  Readable.call(this, opts)
  this.client = opts.client;
  this.params = opts.params;
  this.bytesRead = 0;
}

S3Readable.prototype._read = function(numBytes) {
  var self = this;
  var shouldSip = true;
  debug('_read');

  async.whilst(test, sip, function(err){
    if (err) return self.emit('error', err);
  });

  function test() { return shouldSip; };
  function sip(done) {
    self.sip(numBytes, function(err, keepSipping){
      shouldSip = keepSipping;
      done(err);
    });
  }
}

S3Readable.prototype.sip = function(numBytes, done) {
  var self = this;
  this.params.Range = range(this.bytesRead, numBytes)
  debug('range %s', this.params.Range);
  var req = self.client.getObject(self.params, function(err, res){
    if (err) return done(err)
    var contentLength = +res.ContentLength;
    self.bytesRead += contentLength;
    var keepPushing = self.push(res.Body);
    done(null, keepPushing)
  });
}

function range(read, toRead) {
  return util.format("bytes=%d-%d", read, read+toRead);
}

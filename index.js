var Readable = require('stream').Readable;
var util = require('util');
var debug = require('debug')('s3-download-stream')
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
  debug("_read")
  this.params.Range = range(this.bytesRead, numBytes)
  var req = self.client.getObject(self.params, function(err, res){
    // range is past EOF, can return safely
    if (err && err.statusCode === 416) return self.push(null)
    if (err) return self.emit('error', err);
    var contentLength = +res.ContentLength;
    self.bytesRead += contentLength;
    self.push(contentLength === 0? null : res.Body);
  });
}

function range(read, toRead) {
  return util.format("bytes=%d-%d", read, read+toRead);
}

var Readable = require('stream').Readable;
var util = require('util');
var debug = require('debug')('s3-download-stream');
var SimpleQueue = require('SimpleQueue');
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
  this.bytesReading = 0;
  this.working = 0;
  this.concurrency = opts.concurrency || 6;
  this.queue = new SimpleQueue(worker, processed, null, this.concurrency)
  var self = this;

  function worker(numBytes, done) {
    self.working += 1
    self.sip(self.bytesReading, numBytes, done);
    self.bytesReading += numBytes;
  }

  function processed(err, result) {
    self.working -= 1
    debug("working %d queue %d %s", self.working, self.queue._queue.length, result.range);
    if (err) return self.emit('error', err)
    self.push(result.data);
  }
}

S3Readable.prototype._read = function(numBytes) {
  var toQueue = this.concurrency - this.queue._queue.length;
  for (var i = 0; i < toQueue; ++i)
    this.queue.push(this.chunkSize || numBytes);
}

S3Readable.prototype.sip = function(from, numBytes, done) {
  var self = this;
  var rng = this.params.Range = range(from, numBytes)
  var req = self.client.getObject(self.params, function(err, res){
    // range is past EOF, can return safely
    if (err && err.statusCode === 416) return self.push(null)
    if (err) return self.emit('error', err);
    var contentLength = +res.ContentLength;
    var data = contentLength === 0? null : res.Body;
    done(null, {range: rng, data: data, contentLength: contentLength});
  });
}

function range(from, toRead) {
  return util.format("bytes=%d-%d", from, from+toRead);
}

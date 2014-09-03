
var test = require('tape');
var aws = require('aws-sdk');
var assert = require('assert');
var downloader = require('./');

var auth = {
  apiVersion: "2006-03-01",
  secretAccessKey: process.env.S3_SECRET_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY
}

var config = {
  client: new aws.S3(auth),
  params: {
    Key: process.env.S3_KEY,
    Bucket: process.env.S3_BUCKET
  }
}


test('first chunk reads ok', function(t){
  t.plan(1);

  var stream = downloader(config)

  stream.on('data', function(chunk){
    t.ok(chunk.length > 0, "chunk size " + chunk.length);
    stream.pause()
  });

  stream.on('error', function(err) {
    t.error(err);
  });
});

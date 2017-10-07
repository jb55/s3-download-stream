
var test = require('tape');
var aws = require('aws-sdk');
var assert = require('assert');
var downloader = require('./');

var auth = {
  apiVersion: "2006-03-01",
  secretAccessKey: process.env.S3_SECRET_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY
}

var client = new aws.S3(auth);
var bucket = process.env.S3_BUCKET

var config = {
  client: client,
  params: {
    Key: process.env.S3_KEY,
    Bucket: bucket
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

test('expect no such key error', function(t){
  t.plan(2);

  var stream = downloader({
    client: client,
    params: {
      Key: 'dskjsdfsdf',
      Bucket: bucket
    }
  })

  stream.on('data', function(chunk){
  });

  stream.on('error', function(err) {
    t.equal(err.code, 'NoSuchKey');
    t.equal(err.notFound, true);
  });
});

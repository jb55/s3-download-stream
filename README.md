
# s3-download-stream

[![Build Status](https://travis-ci.org/jb55/s3-download-stream.svg)](https://travis-ci.org/jb55/s3-download-stream)

  Very fast concurrent + streaming downloads from S3

## Installation

  Install with npm

    $ npm install s3-download-stream

## Example

```js
var downloader = require('s3-download-stream')
var aws = require('aws-sdk')

// config
var auth = {
  apiVersion: "2006-03-01",
  secretAccessKey: process.env.S3_SECRET_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY
}

//
// params documentation:
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
//
var file = process.env.S3_KEY;
var config = {
  client: new aws.S3(auth),
  concurrency: 6,
  params: {
    Key: file,
    Bucket: process.env.S3_BUCKET
  }
}

// stream
downloader(config)
  .pipe(fs.createWriteStream("/tmp/" + file)
```

## API

### var downloader = require('s3-download-stream')(config)

`config` options:

* `client`: [AWS.S3](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) instance

* `concurrency`: (default `6`) Number of download workers.

* `chunkSize`: (default `512KB`) multiply this by concurrency to get rough MBps.
  set to `null` to use chunk size chosen by downstream `read(n)` calls (usually `16KB`)

* `params`: See [AWS docs](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property)

## License

    The MIT License (MIT)

    Copyright (c) 2014 William Casarin

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

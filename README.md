Dockerize for NodeJS applications
=================================

A command-line utility to help you dockerize your NodeJS applications.

## Installation

```sh
npm install -g dockerize2
```

## Usage

```sh
cd /your/app/directory
dockerize2 build --tag your/tag --env development
docker run -it your/tag
```

## Notes

* This utility assumes that your application can be started by running `npm start`.
* The Docker image generated is based off of my NodeJS docker image: this should be changed to the default NodeJS image, and will eventually be configurable in the future.

# LICENSE

Copyright (c) 2016, Company or Person's Name <jrapodaca@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
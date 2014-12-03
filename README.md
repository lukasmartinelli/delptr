# delptr [![Build Status](https://travis-ci.org/lukasmartinelli/delptr.svg)](https://travis-ci.org/lukasmartinelli/delptr) ![Dependencies](https://david-dm.org/lukasmartinelli/delptr.svg) [![Code Climate](https://codeclimate.com/github/lukasmartinelli/delptr/badges/gpa.svg)](https://codeclimate.com/github/lukasmartinelli/delptr)

Realtime linting of C++ projects on Github.

## Install

Clone the repository and install the dependencies with Node.

```
npm install
```

## Run

Run the server with an optional Github Access Token.
Please be aware that this will download alot of data.

```
export GITHUB_ACCESS_TOKEN=asb1234gwa...
node server.js $GITHUB_ACCESS_TOKEN
```

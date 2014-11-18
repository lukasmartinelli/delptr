var util = require('util');
var events = require('events');

function GithubEventEmitter(client) {
    events.EventEmitter.call(this);

    this.client = client;
    this.lastEvent = 0;
    this.intervalTime = 1 * 1000;
    this.interval = null;
}

util.inherits(GithubEventEmitter, events.EventEmitter);

GithubEventEmitter.prototype.start = function() {
    this.stop();
    this.interval = setInterval(function(){
        this.makeRequest();
    }.bind(this), this.intervalTime);
}

GithubEventEmitter.prototype.stop = function() {
    if (this.interval !== null) {
        clearInterval(this.interval);
    }
}

GithubEventEmitter.prototype.makeRequest = function() {
    this.client.get('/events', {}, function(err, status, body, headers) {
        var lowestTime = 0;
        body.forEach(function(event){
            var eventTime = Date.parse(event.created_at);
            if (eventTime > this.lastEvent) {
                this.emit('event', event);
            }
            if (lowestTime < eventTime) {
                lowestTime = eventTime;
            }
        }.bind(this));
        this.lastEvent = lowestTime;
    }.bind(this));
}

module.exports = GithubEventEmitter;

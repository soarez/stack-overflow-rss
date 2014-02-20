var util = require('util');
var events = require('events');
var request = require('request');
var xml2js = require('xml2js');
var moment = require('moment');
var _ = require('lodash');

var utlTemplate = 'http://stackoverflow.com/feeds/tag?tagnames=%s&sort=%s';

function fetch(url, callback) {

  request(url, function (requestError, response, body) {
    if (requestError) {
      callback(requestError);
      return;
    }

    var parser = new xml2js.Parser();
    parser.parseString(body, function (parseError, result) {
      if (parseError) {
        callback(parseError);
        return;
      }

      var entries = _.map(result.entry, function(entry) {
        if (!Array.isArray(entry.category)) entry.category = [entry.category]
        return {
          id: entry.id,
          title: entry.title['#'],
          tags: entry.category.map(function (o) {return o['@'].term}),
          published: moment(entry.published, 'YYYY-MM-DDTHH:mm:ss').toDate()
        };
      });

      callback(null, entries);
    });
  });
}

module.exports = exports = function(options) {
  
  var tags = options.tags || options.tag || ['javascript'];
  var sort = options.sort || 'newest';
  var pollInterval = options.pollInterval || 1000 * 60 * 2;
  var lazy = options.lazy === 'undefined' ? true : options.lazy;

  if (!util.isArray(tags))
    tags = [tags];

  var url = util.format(utlTemplate, tags.join('+'), sort);
  var entries = options.entries || [];
  var interval = null;
  var eventEmitter = new events.EventEmitter();

  function update(silent) {
    fetch(url, function(error, latestEntries) {
      if (error) {
        eventEmitter.emit('error', error);
        return;
      }

      var newEntriesIds = _.difference(_.pluck(latestEntries, 'id'), _.pluck(entries, 'id'));
      var newEntries = _.filter(latestEntries, function(entry) { return _.include(newEntriesIds, entry.id); });

      entries = latestEntries;

      if (!silent) {
        if (newEntries.length > 0) {
          eventEmitter.emit('new', newEntries);
        }
        
        eventEmitter.emit('update', entries);
      }
    });
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
    }
  }

  function boot() {
    update(true);
    interval = setInterval(update, pollInterval);
  }

  if (lazy) {
    eventEmitter.once('newListener', boot);
  } else {
    boot();
  }
  
  eventEmitter.update = update;
  eventEmitter.stop = stop;
  return eventEmitter;
};

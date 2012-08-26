## Stack Overflow RSS

### Install

    npm install stack-overflow-rss

### Use

```javascript
var stackOverflowRss = require('stack-overflow-rss');

// get the latest javascript questions
var consumer = stackOverflowRss({ tag: 'javascript'});
consumer.on('update', function(questions) {
  console.dir(questions);
});
consumer.update();

// poll the most voted json and node.js questions feed
var anotherConsumer = stackOverflowRss({ tags: ['json', 'node.js'], sort: 'votes'});
anotherConsumer.on('new', function(newQuestions) {
  console.dir(newQuestions);
});

```

Requiring 'stack-overflow-rss' returns a function used to consume question feeds. The following options are allowed:

* `tag` or `tags` - The question tags.
* `sort` - Default is `'newest'`. Can also be `'unanswered'`, `'active'`, `'votes'` or `'faq'`.
* `pollInterval` - Default is `1000 * 60 * 2` (2 minutes).
* `lazy` - Defer polling until the first subscription to `'new'`. Default is `true`. You can use `consumer.update()`to trigger a single update.

Upon registering, an [EventEmitter](http://nodejs.org/api/events.html) is returned. The events to mind are:

* `'update'` - triggered every time the questions are fetched.
* `'new'`- triggered only when new questions exist. At leat two updates must be done to trigger this event.

### License

MIT
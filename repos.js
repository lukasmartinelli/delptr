var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017/github';

var args = process.argv.slice(2);
var language = args[0] ? args[0] : 'C++';

MongoClient.connect(url, function(err, db) {
  var repos = db.collection('repos');
  repos.find({"language": language}).toArray(function(err, results) {
      results.sort(function(a, b) {
          return b.watchers_count - a.watchers_count;
      });
      results.forEach(function(repo) {
          console.log(repo.full_name + "\t" + repo.watchers_count);
      });
      db.close();
  });
});

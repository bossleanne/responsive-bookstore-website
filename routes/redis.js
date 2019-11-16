var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
const client = redis.createClient({
  host: '127.0.0.1', 
  port: 6379
});
client.on('error', function (err) {
  console.log('could not establish a connection with redis. ' + err);
});

client.on('connect', function (err) {
  console.log('connected to redis successfully');
});

var redisStore = new RedisStore({client: client})

function getAllActiveSessions() {
    return new Promise((resolve, reject) => {
        redisStore.all(function(err, sessions) {
            if(err)
              reject(err);
            else 
              resolve(sessions);
        });
    });
} 

module.exports = { redisStore, getAllActiveSessions };
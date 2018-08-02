const {Pool} = require('pg');
const config = require('config');

const ENV = process.env.ENV;
const SERVER = process.env.SERVER;
console.log('ENV:', ENV, 'SERVER:', process.env.SERVER);

let configInfo = '';
if (config.has(`${ENV}`)) {
  configInfo = config.get(ENV);
} else {
  configInfo = config.get('dev');
}

const db = {};
const dbConfig = configInfo.get('dbConfig');
const {dialect, user, password, server, host, dbName} = dbConfig;

let serverUrl = server;
if(SERVER !== undefined){
  serverUrl = SERVER;
}
const connectionString = `${dialect}://${user}:${password}@${serverUrl}:${host}/${dbName}`;
console.log('[models][index]node postgres:', connectionString);

module.exports = new Pool({connectionString: connectionString, "idleTimeoutMillis": 30000});

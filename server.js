const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const Logger = require('koa-logger');
const wsService = require('./rest/service/utils/ws');
const schedule = require('node-schedule');
const healthCheck = require('./rest/service/utils/healthCheck');
const schedules = require('./rest/service/utils/schedule');

const pool = require('./rest/models/index');
const app = new Koa().use(BodyParser());

const corsOptions = {
  origin: '*', // Access-Control-Allow-Origin 
  allowMethods: ['GET', 'POST', 'DELETE'], // Access-Control-Allow-Methods
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // Access-Control-Allow-Headers
  credentials: true // Access-Control-Allow-Credentials
};
app.use(cors(corsOptions));

// router
app.use(require('./rest/middlewares/response'));
app.use(require('./rest/middlewares/filter'));
require('./rest/routes')(app);

const server = require('http').Server(app.callback());  // implement koa app to http server
const io = require('socket.io')(server);
wsService.initialize(io);  // 將server包上webSocket

// // 當第一次啟動時，會去 delete DB[health_check]
// // get worker pid and insert data to DB[health_check]
// setTimeout( () => {
//   schedules.getWorkerProcessId();
// }, 10000);
// // 用pid and DB[pids] 檢查是否有child process lose
// // If lost, emit worker, 讓worker重新啟動
// setTimeout( () => {
//   schedules.checkWorkerProcess();
// }, 60000);

// // 每10分鐘，會emit[health_check]後, 會listen[health_result],並做後續處理
// schedule.scheduleJob('*/10 * * * *', () => {
//   schedules.getWorkerProcessId();
// });
// schedule.scheduleJob('*/11 * * * *', () => {
//   schedules.checkWorkerProcess();
// });

// start
server.listen(8080)
console.log('listening on port 8080');

module.exports = app;

const http = require('http')
const config = require('./../../../config/default.json');
const tagsDao = require('../../models/tagsDao');
const errorCode = require('../../utils/errorCode')
const generateUUID = require('../../utils/generateUUID');
const Decimal = require('decimal.js');
let data = require('./data.json')
const healthCheckDao = require('../../models/healthCheckDao');
const wsService = require('../utils/ws');

class schedules {
  static async cron(tagobj) {
    try {
      const { indoorId } = tagobj;
      const taginfo = await aggregateTags(http, indoorId);
      data.location = JSON.parse(taginfo);
      data = await convertPosition(data, tagobj)
      const id = await generateUUID.generateUUIDByRandom();
      const duration = '3s'
      const taginfoObj = data.location;
      Object.assign(taginfoObj, { id, indoorId, duration});
      const result = await tagsDao.create(taginfoObj);
      if (result === undefined || Number(result.rowCount) !== 1) {
        throw new Error(errorCode.INTERNAL_ERROR);
      }
      return data
    }
    catch (e) { throw new Error(errorCode.SCHEDULE_INTERNAL_ERROR); }
  }

  static async getWorkerProcessId() {
    console.log('node server get worker pid.');
    try {
      await healthCheckDao.deleteAll();
      await wsService.io.emit('health_check', 'node server init check worker status.');
      //  listen.on[health_result],並做後續處理
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async checkWorkerProcess() {
    console.log('node server check worker status. and recovery worker');
    try {
      const result = await healthCheckDao.checkWorkerProcess();
      if(result !== undefined){
        console.log('result.rows:', result.rows);
        for (let i = 0; i < result.rows.length ; i++){
          const {tagid, map_width, map_height} = result.rows[i];
          const obj = {mapWidth:map_width, mapHeight: map_height, indoorId: tagid};
          wsService.io.emit('recovery', obj);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const convertPosition = (data, tagobj) => {
  try {
    const { mapWidth, mapHeight } = tagobj;
    data.location.position_x = (new Decimal(mapWidth).mul(new Decimal(data.location.position_x))).div(new Decimal(data.field.width)).toNumber()
    data.location.position_y = (new Decimal(mapHeight).mul(new Decimal(data.location.position_y))).div(new Decimal(data.field.height)).toNumber()
    return data
  } catch (error) {
    throw new Error(error.message);
  }
};

const aggregateTags = (httpReq, uuid) => {
  return new Promise((fulfill, reject) => {
    const options = {
      hostname: config.LBS.HOST,
      port: config.LBS.PORT,
      path: `/api/message/tag/${uuid}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const req = httpReq.request(options, (res) => {
      if (res.statusCode == 200) {
        let data = ''
        res.on('data', function (chunk) {
          data = chunk.toString()
        })
        res.on('end', function () {
          fulfill(data)
        })
      } else {
        reject({ message: `get tag info status err, status code = ${res.statusCode}`, code: 500 })
      }
    })
    req.on('socket', function (socket) {
      socket.setTimeout(5000)
      socket.on('timeout', function () {
        req.abort()
      })

    })
    req.on('error', ex => reject({ message: ex.message, code: 500 }))
    req.end()
  })

}

module.exports = schedules
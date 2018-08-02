const schedule = require('node-schedule')
const schedules = require('../utils/schedule')

process.on('message', (tagobj) => {
  // do something
  schedule.scheduleJob('*/3 * * * * *', async function () {
    const data = await schedules.cron(tagobj)
    process.send(data)
  })
});

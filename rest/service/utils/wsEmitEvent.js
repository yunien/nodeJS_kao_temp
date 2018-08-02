const wsService = require('./ws');
const healthCheck = require('./healthCheck');

exports.createIndoorPosition = async (pamars) => {
  console.log('wsEmitEvent createIndoorPosition. pamars:', pamars);
  wsService.io.emit('checkin', pamars);
};

exports.destoryIndoorPosition = async (indoorid) => {
  console.log('wsEmitEvent destoryIndoorPosition. indoorid:', indoorid);
  wsService.io.emit('checkout', indoorid);
};

exports.createRobot = async (indoorId) => {
  console.log('wsEmitEvent createRobot.', indoorId);
  //initial robot position to front-end
  try {
    const result = await healthCheck.getWorkerPid(indoorId);
    if (result.rows[0] === undefined) {
        console.log('ws.io.emit robot to front-end');
        wsService.io.emit('robot', {
            "x": "24.0",
            "y": "2.5",
            "uuid": "robot-1",
            "location": "Mega Plus",
            "floorRoom": "13F/1304",
            "robotNo": "robot-1",
            "status": "charging",
            "duration": "3s",
            "direction": "down"
        })
    };
  } catch (error) {
    throw new Error(error.message);
  }
  
};

exports.createPeople = async (people_uuid) => {
  console.log('wsEmitEvent createPeople.', people_uuid);
  //initial robot position to front-end
  try {
    const result = await healthCheck.getWorkerPid(indoorId);
    if (result.rows[0] === undefined) {
      console.log('ws.io.emit people to front-end');
      wsService.io.emit('people', {
        x: '15.200',
        y: '5.100',
        uuid: people_uuid
      })
    }
  } catch (error) {
    throw new Error(error.message);
  }
  
};
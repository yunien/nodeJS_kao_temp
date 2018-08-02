const generateUUID = require('../../utils/generateUUID');
const areasDao = require('../../models/areasDao');
const camerasDao = require('../../models/camerasDao');
const robotsDao = require('../../models/robotsDao');
const errorCode = require('../../utils/errorCode');


exports.checkAreaUuidIsExist = async(roomId) => {
  console.log('initialSettingService checkAreaUuidIsExist');
  try {
    const result = await areasDao.checkAreaUuid(roomId);
    if (typeof result === undefined || Number(result.rows[0].count) !== 1) {
      throw new Error(errorCode.UUID_DOES_NOT_EXIST);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


exports.checkCamera = async(reqBody) => {
  console.log('initialSettingService checkCamera');
  try {
    const result = await camerasDao.checkCameraByIp(reqBody);
    // result.rows[0].count = 0 代表未使用
    if (result === undefined || Number(result.rows[0].count) !== 0) {
      throw new Error(errorCode.PRIVATE_IP_HAS_BEEN_EXIST);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createCamera = async(reqBody) => {
  console.log('initialSettingService createCamera');
  try {
    const {roomId, camera} = reqBody;

    await camera.forEach( async (element) => {
      const uuid = await generateUUID.generateUUIDByRandom();
      Object.assign(element, {uuid}, {areaUuid: roomId});
      if (element.flip) {
        Object.assign(element, {flip: 1});
      } else {
        Object.assign(element, {flip: 0});
      }
    });

    const result = await camerasDao.batchCreate(camera);
    if (result.length === 0) {
      throw new Error(errorCode.INTERNAL_ERROR);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


exports.createRobot = async(reqBody) => {
  console.log('initialSettingService createRobot');
  try {
    const {roomId, robot} = reqBody;
    await robot.forEach( async (element) => {
      const uuid = await generateUUID.generateUUIDByRandom();
      Object.assign(element, {uuid}, {areaUuid: roomId});
    });

    const result = await robotsDao.batchCreate(robot);
    if (result.length === 0) {
      throw new Error(errorCode.INTERNAL_ERROR);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

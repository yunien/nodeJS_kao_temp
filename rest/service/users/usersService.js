const generateUUID = require('../../utils/generateUUID');
const rackInfosDao = require('../../models/rackInfosDao');
const usersDao = require('../../models/usersDao');
const badgeUseStatusDao = require('../../models/badgeUseStatusDao');
const wsEmitEvent = require('../utils/wsEmitEvent');
const errorCode = require('../../utils/errorCode');


exports.checkRackIdAndInfo = async (rackId) => {
  console.log('usersService checkRackIdAndInfo');
  try {
    const result = await rackInfosDao.getRackInfo(rackId);
    if (result === undefined) {
      throw new Error(errorCode.INTERNAL_ERROR);
    } else if (result.rows[0] === undefined) {
      throw new Error(errorCode.RACKID_DOES_NOT_EXIST);
    } else {
      return {mapWidth: result.rows[0].map_width, mapHeight: result.rows[0].map_height};
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.checkBadgeStatus = async (reqBody, InUse) => {
  console.log('usersService checkBadgeStatus');
  let rowsCount = 0;
  (InUse) ? rowsCount = 1 : rowsCount = 0;
  try {
    const result = await badgeUseStatusDao.checkBadgeStatus(reqBody);
    // result.rows[0].count = 0 代表未使用
    if (result === undefined || Number(result.rows[0].count) !== rowsCount){
      if (rowsCount === 0) {
        throw new Error(errorCode.BADGE_BE_USING);
      } else {
        throw new Error(errorCode.BADGE_UN_USING);
      } 
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.checkUserIsEnable = async (reqBody) => {
  console.log('usersService checkUserIsEnable');
  try {
    const result = await badgeUseStatusDao.checkBadgeStatusByUserUuid(reqBody);
    if (result === undefined || Number(result.rows[0].count) !== 0){
      throw new Error(errorCode.BADGE_BE_USING);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const fillUserData = async (params) => {
  console.log('usersService fillUserData');
  const uuid = await generateUUID.generateUUIDByRandom();
  return Object.assign(params, {uuid});
};

exports.createOrUpdateUser = async (reqBody) => {
  console.log('usersService createUser');
  try {
    const checkStatus = await usersDao.checkUserByCompanyAndMobile(reqBody);
    // console.log('checkStatus.rows[0]:', checkStatus.rows[0]);
    if (checkStatus.rows[0] === undefined) { //create
      console.log('create');
      const userVO = await fillUserData(reqBody);
      const result = await usersDao.create(userVO);
      if (result === undefined || Number(result.rowCount) !== 1){
        throw new Error(errorCode.INTERNAL_ERROR);
      }
      return userVO;
    } else {  //update
      console.log('update');
      const uuid = checkStatus.rows[0].uuid;
      Object.assign(reqBody, {uuid});
      const result = await usersDao.updateByUuid(reqBody);
      if (result === undefined || Number(result.rowCount) !== 1){
        throw new Error(errorCode.INTERNAL_ERROR);
      }
      return reqBody;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const fillBadgeUseStatusData = async (params) => {
  console.log('usersService fillBadgeUseStatusData');
  const uuid = await generateUUID.generateUUIDByRandom();
  const obj = {};
  return Object.assign(obj, 
    { uuid, badge_id: params.badgeId, indoor_id: params.indoorId, user_uuid: params.uuid, is_enable: 1 });
};

exports.createBadgeAndUser = async (userVO) => {
  console.log('usersService createBadgeAndUser');
  try {
    const badgeAndUserVO = await fillBadgeUseStatusData(userVO);
    const result = await badgeUseStatusDao.create(badgeAndUserVO);
    if (result === undefined || Number(result.rowCount) !== 1){
      throw new Error(errorCode.INTERNAL_ERROR);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.findBadgeByBadgeId = async (badgeId) => {
  console.log('usersService findBadgeByBadgeId');
  try {
    const result = await badgeUseStatusDao.findBadgeByBadgeId(badgeId);
    if (Number(result.rowCount) === 0){
      throw new Error(errorCode.BADGE_ID_NO_ENABLED);
    }
    const {badge_uuid, badge_id, indoor_id, user_uuid, company, name,
      mobile, gender, image, rack_id, rack_location} = result.rows[0];
    const cxtBody = {uuid: badge_uuid, badgeId: badge_id, indoorId: indoor_id, company,
      name, mobile, gender, image, rackId: rack_id, rackLocation: rack_location};
    return cxtBody;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.checkOutByUuID = async (reqBody) => {
  console.log('users service checkOutByBadgeID');
  try {
    const result = await badgeUseStatusDao.updateByUuid(reqBody);
    if (result === undefined || Number(result.rowCount) !== 1){
      throw new Error(errorCode.INTERNAL_ERROR);
    }
    return reqBody;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.destoryIndoorPosition = async (uuid) => {
  console.log('users service destoryIndoorPosition.');
  try {
    const result = await badgeUseStatusDao.findIndoorIdByUuid(uuid);
    if (Number(result.rowCount) === 0){
      throw new Error(errorCode.NOT_FOUND_UUID);
    }
    if (result.rows[0].indoorid === undefined ) {
      throw new Error(errorCode.NOT_FOUND_INDOOR_ID);
    }
    await wsEmitEvent.destoryIndoorPosition(result.rows[0].indoorid);
  } catch (error) {
    throw new Error(error.message);
  }
};


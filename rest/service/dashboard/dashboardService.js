const generateUUID = require('../../utils/generateUUID');
const imageUtils = require('../../utils/imageUtils');
const areasDao = require('../../models/areasDao');
const rackInfosDao = require('../../models/rackInfosDao');
const camerasDao = require('../../models/camerasDao');
const robotsDao = require('../../models/robotsDao');
const tempRobotView = require('../../models/tempRobotView');
const thresholding = require('../../utils/thresholding');
const dijkstra = require('../../utils/dijkstra');
const errorCode = require('../../utils/errorCode');
const forEach = require('async-foreach').forEach;

const MAP_PATH = 'rest/static/images/map/';

/**
 * reqBody{
 *  area: String,
 *  building: String,
 *  floor: String,
 *  roomNo: String,
 *  mapWidth: float,
 *  mapHeight: float,
 *  space: integer,
 *  mapImg: String,
 *  prohibitedAreaImg: String
 * }
 */
exports.saveImage = async(reqBody) => {
  console.log('dashboardService saveImage');
  try {
    const {
      area,
      building,
      floor,
      roomNo,
      mapImg,
      mapMask
    } = reqBody;
    const mapImgName = area + building + floor + roomNo;
    const imgPathAndName = MAP_PATH + mapImgName + '.png';
    await imageUtils.saveImage(mapImg, imgPathAndName);
    // throw new Error('saveImage');
    let mapMaskName = area + building + floor + roomNo + '_mapMask.png';
    mapMaskName = MAP_PATH + mapMaskName;
    const mapMaskPath = await imageUtils.saveImage(mapMask, mapMaskName);

    return mapMaskPath;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createMapCoordinate = async(reqBody) => {
  console.log('dashboardService createMapCoordinate');
  try {
    console.time('getPhotoPixels');
    const pixels = await thresholding.getPhotoPixels(reqBody);
    console.timeEnd('getPhotoPixels');
    console.time('thresholding');
    const thresholdingData = await thresholding.thresholding(pixels);
    console.timeEnd('thresholding');
    console.time('calculateCoordinates');
    const zone = await dijkstra.calculateCoordinates(reqBody);
    console.timeEnd('calculateCoordinates');
    console.time('conveterPxToCmAndShortDistance');
    const prohibitedZoneName = await dijkstra.conveterPxToCmAndShortDistance(reqBody, thresholdingData);
    console.timeEnd('conveterPxToCmAndShortDistance');
    console.time('calculateZoneAndProhibitedZone');
    const resultBody = dijkstra.calculateZoneAndProhibitedZone(reqBody, prohibitedZoneName, zone);
    console.timeEnd('calculateZoneAndProhibitedZone');
    console.time('saveProhibitedImage');
    const newImgName = await thresholding.saveProhibitedImage(resultBody, thresholdingData);
    console.timeEnd('saveProhibitedImage');
    console.time('saveProhibitedImage');
    const prohibitedAreaBase64 = await imageUtils.encodeImage(newImgName);
    console.timeEnd('saveProhibitedImage');
    Object.assign(resultBody, {prohibitedAreaBase64});
    return resultBody;
  } catch (error) {
    console.error('createMapCoordinate:', error);
    throw new Error(error.message);
  }
};

exports.createArea = async(reqBody) => {
  console.log('dashboardService createArea');
  try {
    const uuid = await generateUUID.generateUUIDByRandom();
    Object.assign(reqBody, {uuid});
    const result = await areasDao.create(reqBody);
    if (result === undefined || Number(result.rowCount) !== 1) {
      throw new Error(errorCode.INTERNAL_ERROR);
    }
  } catch (error) {
    console.error('createArea service:', error.message);
    throw new Error(error.message);
  }
};

const converterResultToFirstMenuVo = async(results) => {
  const areaObject = {};
  results.forEach((element) => {
    const {uuid, area, building, floor, room_no} = element;
    if (!areaObject['area']) {
      areaObject['area'] = [];
    }
    let region = areaObject['area'].find(d => d.name === area);
    if(!region) {
      region = {name: area, value: area, tower: []};
      areaObject['area'].push(region);
    }
    let item = region.tower.find(d => d.name === building);
    if(!item) {
      item = {name: building, value: building, floor: []};
      region.tower.push(item);
    }
    let flooritem = item.floor.find(d => d.name === floor);
    if(!flooritem) {
      flooritem = {name: floor, value: floor, roomList: []};
      item.floor.push(flooritem);
    }
    roomitem = {name: room_no, value: uuid};
    flooritem.roomList.push(roomitem);

    // let roomitem = flooritem.roomList.find(d => d.name === room_no);
    // if(!roomitem){
    //   roomitem ={name:room_no, value:uuid}
    //   flooritem.roomList.push(roomitem);
    // }
  });

  return areaObject;
};

exports.getFirstMenu = async() => {
  console.log('dashboardService getFirstMenu');
  try {
    const result = await areasDao.selectAll();
    // console.log('result.rows:', result.rows); console.log('result.rows[0]:',
    // result.rows[0]);
    if (result === undefined) {
      throw new Error(errorCode.INTERNAL_ERROR);
    } else {
      return converterResultToFirstMenuVo(result.rows);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const converterResultToResVo = (resultVo) => {
  const {area, building, floor, room_no, map_width, map_height, map_img, space,
    map_img_prohibired_area, working_area_coordinate, prohibired_area_coordinate} = resultVo;
  return {
    area,
    building,
    floor,
    roomNo: room_no,
    mapWidth: map_width,
    mapHeight: map_height,
    space,
    mapImg: map_img,
    mapMask: map_img_prohibired_area
  };
};

exports.getRoomInfo = async(uuid) => {
  console.log('dashboardService getRoomInfo:', uuid);
  try {
    const result = await areasDao.getAreaInfoByUuid(uuid);
    // console.log('result.rows[0]:', result.rows[0]);
    if (result === undefined) {
      throw new Error(errorCode.INTERNAL_ERROR);
    } else if (result.rows[0] === undefined) {
      throw new Error(errorCode.RACKID_DOES_NOT_EXIST);
    } else {
      return converterResultToResVo(result.rows[0]);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getPassableArea = async(uuid) => {
  console.log('dashboardService getPassableArea');
  try {
    const result = await areasDao.getAreaInfoByUuid(uuid);
    if (result === undefined) {
      throw new Error(errorCode.INTERNAL_ERROR);
    } else if (result.rows[0] === undefined) {
      throw new Error(errorCode.UUID_DOES_NOT_EXIST);
    } else {
      const working_area_coordinate = result.rows[0].working_area_coordinate;
      return {
        zone: JSON.parse(working_area_coordinate)
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getProhibitedArea = async (uuid) => {
  console.log('dashboardService getProhibitedArea');
  try {
    const result = await areasDao.getAreaInfoByUuid(uuid);
    if (result === undefined) {
      throw new Error(errorCode.INTERNAL_ERROR);
    } else if (result.rows[0] === undefined) {
      throw new Error(errorCode.UUID_DOES_NOT_EXIST);
    } else {
      const prohibired_area_coordinate = result.rows[0].prohibired_area_coordinate;
      return {
        zone: JSON.parse(prohibired_area_coordinate)
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const fillResultVo = async(resultRows) => {
  console.log('fillResultVo');
  const resultVos = [];
  try {
    await resultRows.forEach(async(element) => {
      const {
        area_uuid,
        name,
        position_x,
        position_y,
        rotate,
        flip,
        private_ip
      } = element;
      const resultVo = {
        roomUuid: area_uuid,
        name,
        x: position_x,
        y: position_y,
        rotate,
        flip,
        privateIp: private_ip
      };
      await resultVos.push(resultVo);
    });
    return resultVos;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getCameras = async(uuid) => {
  console.log('dashboardService getCameras');
  try {
    const result = await camerasDao.findCamerasByAreauuid(uuid);
    if (Number(result.rowCount) === 0) {
      throw new Error(errorCode.UUID_DOES_NOT_EXIST);
    }
    return fillResultVo(result.rows);
  } catch (error) {
    throw new Error(error.message);
  }
};

const fillRobotsResultVo = async(resultRows) => {
  console.log('fillRobotsResultVo:', resultRows);
  const resultVos = [];
  try {
    await resultRows.forEach(async(element) => {
      const {uuid, area_uuid, name, indoor_id, x, y, height, width} = element;
      const resultVo = {
        uuid,
        roomUuid: area_uuid,
        name,
        indoorId: indoor_id,
        x: parseFloat(x).toFixed(2),
        y: parseFloat(y).toFixed(2),
        height: parseFloat(height).toFixed(2),
        width: parseFloat(width).toFixed(2)
      };
      await resultVos.push(resultVo);
    });
    return resultVos;
  } catch (error) {
    console.error('fillRobotsResultVo:', error);
    throw new Error(error.message);
  }
};

exports.getRobots = async(uuid) => {
  console.log('dashboardService getRobots');
  try {
    const result = await robotsDao.findRobotsByRoomId(uuid);
    if (Number(result.rowCount) === 0) {
      throw new Error(errorCode.UUID_DOES_NOT_EXIST);
    }
    return fillRobotsResultVo(result.rows);
  } catch (error) {
    console.error('dashboardService getRobots:', error);
    throw new Error(error.message);
  }
};

exports.robotView = async(direction) => {
  console.log('dashboardService getRobots');
  try {
    const result = await tempRobotView.findRobotViewById(direction);
    if (Number(result.rowCount) === 0) {
      throw new Error('DIRECTION_DOES_NOT_EXIST');
    }
    const {img} = result.rows[0];
    return {image: img};
  } catch (error) {
    throw new Error(error.message);
  }
};
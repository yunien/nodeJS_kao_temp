const validate = require('./validate');
const dashboardService = require('../../service/dashboard/dashboardService');
const wsEmitEvent = require('../../service/utils/wsEmitEvent');
const ResFormator = require('../../utils/formator');
const generateUUID = require('../../utils/generateUUID')

exports.createArea = async (ctx, next) => {
  console.log('dashboardController createArea');
  try {
    validate.createArea(ctx.request.body);
    const reqBody = ctx.request.body;
    const mapMaskPath = await dashboardService.saveImage(reqBody);
    Object.assign(reqBody, {mapMaskPath});
    const resultBody = await dashboardService.createMapCoordinate(reqBody);
    await dashboardService.createArea(resultBody);
    
    const {mapImg, mapMask, prohibitedAreaBase64} = resultBody;
    const resultVo = {mapImg, mapMask, prohibitedArea: prohibitedAreaBase64};
    ctx.body = new ResFormator(resultVo).fullResponse;
  } catch(error){
    console.error('createArea:', error.message);
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;;
  }
};

exports.getFirstMenu = async (ctx, next) => {
  console.log('dashboardController getFirstMenu');
  try {
    const result = await dashboardService.getFirstMenu();
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.getPassableArea = async (ctx, next) => {
  console.log('dashboardController getPassableArea');
  try {
    validate.uuid(ctx.params);
    const result = await dashboardService.getPassableArea(ctx.params.uuid/*'8353a595-ea9f-4f12-813a-9aaf9ad61209'*/);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.getRoomInfo = async (ctx, next) => {
  console.log('dashboardController getRoomInfo');
  try {
    validate.uuid(ctx.params);
    const result = await dashboardService.getRoomInfo(ctx.params.uuid);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.getCameras = async (ctx, next) => {
  console.log('dashboardController getCameras');
  try {
    validate.uuid(ctx.params);
    const result = await dashboardService.getCameras(ctx.params.uuid);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.getRobots = async (ctx, next) => {
  console.log('dashboardController getRobots');
  try {
    validate.uuid(ctx.params);
    const result = await dashboardService.getRobots(ctx.params.uuid);
    console.log('result', result);
    //先寫死，之後result 會是陣列
    await wsEmitEvent.createRobot('robot-1');
    //for 障礙物模擬測試 
    // const people_uuid = await generateUUID.generateUUIDByRandom();
    // await wsEmitEvent.createPeople(people_uuid);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    console.error('Controller:', error);
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.robotView = async (ctx, next) => {
  console.log('dashboardController robotView');
  try {
    validate.direction(ctx.params);
    const result = await dashboardService.robotView(ctx.params.direction);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

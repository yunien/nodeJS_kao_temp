const validate = require('./validate');
const initialSettingService = require('../../service/initialSetting/initialSettingService');
const ResFormator = require('../../utils/formator');

/**
 * 
 * body:
 * {
 *   "roomId": "2ed270e9-784d-46cb-8bac-65f8e0f4be8e", 
 *   "camera": [{
 *       "name": "camera1",
 *       "x": 0.78, 
 *       "y": 1.00,
 *       "rotate": 0,
 *       "flip": false,
 *       "privateIp": "192.168.0.1"
 *   }, {}, ...]
 * }
 * 
 */
exports.camera = async (ctx, next) => {
  console.log('initialSettingController camera');
  try {
    validate.camera(ctx.request.body);
    const {roomId} = ctx.request.body;
    await initialSettingService.checkAreaUuidIsExist(roomId);
    // await initialSettingService.checkCamera(ctx.request.body);
    await initialSettingService.createCamera(ctx.request.body);
    ctx.body = new ResFormator({roomId}).fullResponse;;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;;
  }
};

/**
 * 
 * body:
 * {
 *   "roomId": "2ed270e9-784d-46cb-8bac-65f8e0f4be8e", 
 *   "robot": [{
 *       "name": "robot1",
 *       "indoorId": "2222"
 *       "x": 0.78, 
 *       "y": 1.00,
 *       "height": 60,
 *       "width": 60
 *   }, {}, ...]
 * }
 * 
 */
exports.robot = async (ctx, next) => {
  console.log('initialSettingController robot');
  try {
    validate.robot(ctx.request.body);
    const {roomId} = ctx.request.body;
    await initialSettingService.checkAreaUuidIsExist(roomId);
    await initialSettingService.createRobot(ctx.request.body);
    ctx.body = new ResFormator({roomId}).fullResponse;;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;;
  }
};

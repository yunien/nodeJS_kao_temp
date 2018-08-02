const validate = require('./validate');
const usersService = require('../../service/users/usersService');
const wsEmitEvent = require('../../service/utils/wsEmitEvent');
const ResFormator = require('../../utils/formator');

exports.register = async (ctx, next) => {
  console.log('userController register');
  try {
    validate.register(ctx.request.body);
    const {rackId, indoorId} = ctx.request.body;
    const toIndorInfo = await usersService.checkRackIdAndInfo(rackId);
    await usersService.checkBadgeStatus(ctx.request.body, false);
    const userVO = await usersService.createOrUpdateUser(ctx.request.body);
    await usersService.createBadgeAndUser(userVO);
    Object.assign(toIndorInfo, {indoorId})
    await wsEmitEvent.createIndoorPosition(toIndorInfo);
    ctx.body = new ResFormator().fullResponse;;
  } catch(error){
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;;
  }
};

exports.getBadge = async (ctx, next) => {
  console.log('user controller');
  try {
    validate.badgeId(ctx.params);
    const result = await usersService.findBadgeByBadgeId(ctx.params.badgeId);
    ctx.body = new ResFormator(result).fullResponse;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;
  }
};

exports.checkOut = async (ctx, next) => {
  console.log('user controller checkOut:', ctx.request.body);
  try {
    validate.checkOut(ctx.request.body);
    await usersService.checkBadgeStatus(ctx.request.body, true);
    await usersService.checkOutByUuID(ctx.request.body);
    await usersService.destoryIndoorPosition(ctx.request.body.uuid);
    ctx.body = new ResFormator().fullResponse;;
  } catch (error) {
    ctx.body = new ResFormator(new Error(error.message)).fullResponse;;
  }
};
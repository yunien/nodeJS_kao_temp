const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');
const errorCode = require('../../utils/errorCode');

exports.createArea = (value) => {
  const schema = Joi.object().keys({
    area: Joi.string().required(),
    building: Joi.string().required(),
    floor: Joi.string().required(),
    roomNo: Joi.string().required(),
    mapWidth: Joi.number().required(),
    mapHeight: Joi.number().required(),
    space: Joi.number().integer().required(),
    mapImg: Joi.string().required(),
    mapMask: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.uuid = (value) => {
  const schema = Joi.object().keys({
    uuid: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.direction = (value) => {
  const schema = Joi.object().keys({
    direction: Joi.string().valid(['center', 'up', 'down', 'right', 'left']).required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

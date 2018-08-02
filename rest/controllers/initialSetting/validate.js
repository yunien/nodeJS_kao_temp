const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');
const errorCode = require('../../utils/errorCode');

exports.camera = (value) => {
  const schema = Joi.object().keys({
    roomId: Joi.string().required(),
    camera: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        x: Joi.number().required(),
        y: Joi.number().required(),
        rotate: Joi.number().integer().required(),
        flip: Joi.boolean().required(),
        privateIp: Joi.string().required()
      })
    )
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.robot = (value) => {
  const schema = Joi.object().keys({
    roomId: Joi.string().required(),
    robot: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        indoorId: Joi.string().required(),
        x: Joi.number().required(),
        y: Joi.number().required(),
        height: Joi.number().required(),
        width: Joi.number().required()
      })
    )
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};
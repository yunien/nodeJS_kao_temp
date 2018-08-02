const Joi = require('joi');
const { validateFormat } = require('../../utils/validator');
const errorCode = require('../../utils/errorCode');

exports.rackId = (value) => {
  const schema = Joi.object().keys({
    rackId: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.register = (value) => {
  const schema = Joi.object().keys({
    badgeId: Joi.string().required(),
    indoorId: Joi.string().required(),
    company: Joi.string().required(),
    gender: Joi.string().valid(['male', 'female']).required(),
    image: Joi.string().required(),
    mobile: Joi.string().required(),
    name: Joi.string().required(),
    rackId: Joi.string().required(),
    rackLocation: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.badgeId = (value) => {
  const schema = Joi.object().keys({
    badgeId: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

exports.checkOut = (value) => {
  const schema = Joi.object().keys({
    uuid: Joi.string().required(),
    badgeId: Joi.string().required()
  });
  const validator = Joi.validate(value, schema, { abortEarly: false });
  const validateResult = validateFormat(validator);
  if (validateResult.error) {
    throw new Error(errorCode.ARGUMENTS_ERROR(validateResult.errorKeys));
  }
};

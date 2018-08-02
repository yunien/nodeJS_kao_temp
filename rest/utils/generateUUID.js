const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');

exports.generateUUIDByTimestamp = () => uuidv1();
exports.generateUUIDByRandom = () => uuidv4();
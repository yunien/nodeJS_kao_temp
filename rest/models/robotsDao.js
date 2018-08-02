const pool = require('./index');

/**
 * params: [{},...]
 */
exports.batchCreate = async (params) => {
  console.log('robotsDao batchCreate');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = [];
    params.forEach((param) => {
      Object.assign(param, {isEnable: 1});
      const {uuid, areaUuid, name, indoorId, x, y, height, width, isEnable} = param;
      const insertPhotoText = 
      'INSERT INTO robots (uuid, area_uuid, name, indoor_id, x, y, '+
      'height, width, is_enable, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const insertPhotoValues = [uuid, areaUuid, name, indoorId, x, y, 
      height, width, isEnable, new Date(), new Date()];
    const res = client.query(insertPhotoText, insertPhotoValues);
      result.push(res);
    });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    console.log('client.release');
    client.release();
  }
};

exports.create = async (params) => {
  console.log('robotsDao create');
  Object.assign(params, {isEnable: 1});
  const {uuid, areaUuid, name, indoorId, x, y, height, width, isEnable} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO robots (uuid, area_uuid, name, indoor_id, x, y, height, width, is_enable, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const insertPhotoValues = [uuid, areaUuid, name, indoorId, x, y, height, width, isEnable, new Date(), new Date()];
    const res = await client.query(insertPhotoText, insertPhotoValues);
    await client.query('COMMIT');
    return res;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    console.log('client.release');
    client.release();
  }
};

exports.findRobotsByRoomId = async (uuid) => {
  console.log('robotsDao findRobotsByRoomId');
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT * FROM robots WHERE area_uuid = $1 ', 
      [uuid]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

const pool = require('./index');

/**
 * params: [{},...]
 */
exports.batchCreate = async (params) => {
  console.log('camerasDao batchCreate');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = [];
    params.forEach((param) => {
      const {uuid, areaUuid, name, x, y, rotate, flip, privateIp} = param;
      const insertPhotoText = 
      'INSERT INTO cameras (uuid, area_uuid, name, position_x, position_y, rotate, '+
      'flip, private_ip, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
      const insertPhotoValues = [uuid, areaUuid, name, x, y, rotate, 
        flip, privateIp, new Date(), new Date()];
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
  console.log('camerasDao create');
  const {uuid, areaUuid, name, x, y, rotate, flip, privateIp} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO cameras (uuid, area_uuid, name, position_x, position_y, rotate, '+
      'flip, private_ip, created_at, updated_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    const insertPhotoValues = [uuid, areaUuid, name, x, y, rotate, 
      flip, privateIp, new Date(), new Date()];
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


exports.checkCameraByIp = async (params) => {
  console.log('camerasDao checkCameraByIp');
  const {privateIp} = params;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT count(*) FROM cameras '+
      'WHERE private_ip = $1 ',
      [privateIp]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.findCamerasByAreauuid = async (uuid) => {
  console.log('camerasDao findCamerasByRackId:', uuid);
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT * FROM cameras WHERE area_uuid = $1 ', 
      [uuid]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

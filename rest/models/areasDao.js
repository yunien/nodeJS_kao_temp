const pool = require('./index');

exports.checkAreaUuid = async (roomId) => {
  console.log('areasDao checkAreaUuid');
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT count(*) FROM areas WHERE uuid = $1 AND enable = $2 ',
      [roomId, 1]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.create = async (params) => {
  console.log('areasDao create');
  const {uuid, area, building, floor, roomNo, mapWidth, mapHeight, 
    space, mapImg, mapMask, prohibitedAreaBase64, zones,
    prohibitedZone} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO areas (uuid, area, building, floor, room_no, '+
      'map_width, map_height, map_img, space, map_img_prohibired_area, '+
      'map_img_prohibired_area_by_thresholding, working_area_coordinate, '+
      'prohibired_area_coordinate, enable, create_time, update_time) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';
    const insertPhotoValues = [uuid, area, building, floor, roomNo, 
      mapWidth, mapHeight, mapImg, space, mapMask, prohibitedAreaBase64,
      zones, prohibitedZone, 1, new Date(), new Date()];
    const res = await client.query(insertPhotoText, insertPhotoValues);
    await client.query('COMMIT');
    return res;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createArea dao:', error.message);
    throw new Error(error.message);
  } finally {
    console.log('client.release');
    client.release();
  }
};

exports.selectAll = async () => {
  console.log('areasDao getFirstMenu');
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT area, building, floor, room_no, uuid FROM areas WHERE enable = $1 '+
      'ORDER BY area, building, floor, room_no, uuid ',
      [1]
    );
  } catch (error) {
    console.log(error.stack);
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.getAreaInfoByUuid = async (uuid) => {
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT * FROM areas WHERE uuid = $1 ',
      [uuid]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};


exports.updateWorkingZones = async (zones) => {
  console.log('areasDao updateWorkingZones');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'update areas set working_area_coordinate = $1 '+
      'where uuid = $2 ';
    const insertPhotoValues = [zones, 'd9192e04-5078-48c8-b664-20483628c054'];
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

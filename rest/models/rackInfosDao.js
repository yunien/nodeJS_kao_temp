const pool = require('./index');

exports.checkRackId = async (params) => {
  console.log('rackInfosDao checkRackId');
  const {rackId} = params;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT count(*) FROM rack_infos WHERE rack_id = $1 ',
      [rackId]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.create = async (params) => {
  console.log('rackInfosDao create');
  const {rackId, rackLocation, area, building, floor, roomNo, mapWidth, mapHeight, mapImg} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO rack_infos (rack_id, rack_location, area, building, floor, room_no, '+
      'map_width, map_height, map_img, create_time, update_time) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const insertPhotoValues = [rackId, rackLocation, area, building, floor, roomNo, 
      mapWidth, mapHeight, mapImg, new Date(), new Date()];
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

exports.getRackInfo = async (rackId) => {
  console.log('rackInfosDao getRackInfo');
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT * FROM rack_infos i '+
      'INNER JOIN areas a ON a.uuid = i.area_uuid '+
      'WHERE i.rack_id = $1 ', 
      [rackId]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};



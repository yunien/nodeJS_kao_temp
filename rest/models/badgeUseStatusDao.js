const pool = require('./index');

exports.create = async (params) => {
  console.log('create BadgeUserStatus');
  const {uuid, badge_id, indoor_id, user_uuid, is_enable} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO badge_use_status(uuid, badge_id, indoor_id, user_uuid, created_at, updated_at, is_enable) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)';
    const insertPhotoValues = [uuid, badge_id, indoor_id, user_uuid, new Date(), new Date(), is_enable];
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

exports.checkBadgeStatus = async (params) => {
  console.log('badgeUseStatus Dao checkBadgeStatus');
  Object.assign(params, {is_enable: 1});
  const {badgeId, is_enable} = params;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT count(*) FROM badge_use_status WHERE badge_id = $1 AND is_enable = $2 ', 
      [badgeId, is_enable]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.checkBadgeStatusByUserUuid = async (params) => {
  console.log('badgeUseStatus Dao checkBadgeStatus');
  Object.assign(params, {is_enable: 1});
  const {badgeID, is_enable} = params;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT count(*) FROM badge_use_status WHERE badge_id = $1 AND is_enable = $2 ', 
      [badgeID, is_enable]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.updateByUuid = async (params) => {
  console.log('badgeUseStatus Dao updateByUuid');
  Object.assign(params, {is_enable: 0});
  const {uuid, is_enable} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatePhotoText = 
      'UPDATE badge_use_status SET updated_at = $2, is_enable = $3 ' +
      'WHERE uuid = $1';
    const updatePhotoValues = [uuid, new Date(), is_enable];
    const res = await client.query(updatePhotoText, updatePhotoValues);
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

exports.findBadgeByBadgeId = async (uuid) => {
  console.log('badgeUseStatus Dao findBadgeByBadgeId');
  const is_enable = 1;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT bg.uuid AS badge_uuid, bg.badge_id, bg.indoor_id, u.uuid AS user_uuid, ' +
      'u.company, u.name, u.mobile, u.gender, u.image, u.rack_id, ri.rack_location ' +
      'FROM badge_use_status bg ' +
      'INNER JOIN users u ON bg.user_uuid = u.uuid ' +
      'INNER JOIN rack_infos ri ON ri.rack_id = u.rack_id ' +
      'WHERE bg.badge_id = $1 AND bg.is_enable = $2 ', 
      [uuid, is_enable]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.findIndoorIdByUuid = async (uuid) => {
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT indoor_id AS indoorId FROM badge_use_status ' +
      'WHERE uuid = $1 ', 
      [uuid]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

const pool = require('./index');

exports.create = async (pid) => {
  console.log('healthCheck create');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO health_check (p_id, create_time) VALUES ($1, $2)';
    const insertPhotoValues = [pid, new Date()];
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

exports.deleteAll = async (pid) => {
  console.log('healthCheck deleteAll');
  const client = await pool.connect();
  try {
    await client.query(
      'DELETE FROM health_check '
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(error.message);
  } finally {
    console.log('client.release');
    client.release();
  }
};

exports.checkWorkerProcess = async () => {
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT res.tagid, ri.map_width, ri.map_height FROM ( '+
      ' SELECT * FROM pids p '+
      ' LEFT JOIN health_check h ON p.pid = h.p_id '+
      ') res '+
      'INNER JOIN badge_use_status bus ON bus.indoor_id = res.tagid AND bus.is_enable = 1 '+
      'INNER JOIN users u ON bus.user_uuid = u.uuid '+
      'INNER JOIN rack_infos ri ON u.rack_id = ri.rack_id '+
      'WHERE res.p_id is null '
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.checkPidByTag = async (indoorId) => {
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT pid FROM pids WHERE tagid = $1',
      [indoorId]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.deletePidByTag = async (indoorId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query('DELETE FROM pids WHERE tagid=($1)', [indoorId]);
    await client.query('COMMIT');
    return res;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    console.log('client.release');
    client.release();
  }
};
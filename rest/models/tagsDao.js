const pool = require('./index');

exports.create = async (params) => {
  console.log('insert tags info');
  const { id, indoorId, name, position_x, position_y, power, power_status, size } = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertTagText = 
      'INSERT INTO tags(uuid, tagid, name, position_x, position_y, power, power_status, size, created_at, updated_at) ' + 
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    const insertTagValues = [id, indoorId, name, position_x, position_y, power, power_status, size, new Date(), new Date()];
    const res = await client.query(insertTagText, insertTagValues);
    console.log('res:', res);
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

const pool = require('./index');

exports.create = async (params) => {
  console.log('insert pids info');
  const { indoorId, pid } = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPidText = 
      'INSERT INTO pids(tagid, pid, created_at, updated_at) ' + 
      'VALUES ($1, $2, $3, $4)';
    const insertPidValues = [indoorId, pid, new Date(), new Date()];
    const res = await client.query(insertPidText, insertPidValues);
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

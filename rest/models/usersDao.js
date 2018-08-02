const pool = require('./index');

exports.checkUserByCompanyAndMobile = async (params) => {
  console.log('checkUserByCompanyAndMobile');
  const {company, mobile} = params;
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT uuid FROM users WHERE company = $1 AND mobile = $2 ', 
      [company, mobile]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

exports.create = async (params) => {
  console.log('createuser');
  const {uuid, company, gender, image, mobile, name, rackId} = params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPhotoText = 
      'INSERT INTO users(uuid, company, name, mobile, gender, image, ' + 
      'rack_id, created_at, updated_at) ' + 
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    const insertPhotoValues = [uuid, company, name, mobile, gender, image, rackId, new Date(), new Date()];
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

exports.updateByUuid = async (params) => {
  const {uuid, company, gender, image, mobile, name, rackId} = params;
  console.log('updateByUuid:', params);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatePhotoText = 
      'UPDATE users SET company = $2, name = $3, mobile = $4, ' +
      'gender = $5, image = $6, rack_id = $7, updated_at = $8 ' +
      'WHERE uuid = $1';
    const updatePhotoValues = [uuid, company, name, mobile, gender, image, rackId, new Date()];
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
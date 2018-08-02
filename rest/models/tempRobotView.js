const pool = require('./index');

exports.findRobotViewById = async (direction) => {
  console.log('tempRobotViewDao findRobotViewById');
  const client = await pool.connect();
  try {
    return res = await client.query(
      'SELECT * FROM temp_robot_view_img WHERE id = $1 ', 
      [direction]
    );
  } catch (error) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
};

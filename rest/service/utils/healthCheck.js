const healthCheckDao = require('../../models/healthCheckDao');

exports.deleteHealthCheckData = async () => {
  console.log('healthCheck deleteHealthCheckData');
  try {
    await healthCheckDao.deleteAll();
  } catch (error) {
    throw new Error(error.message);
  }
  
};

const insertData = async (pid) => {
  await console.log('healthCheck insertData');
  try {
    await healthCheckDao.create(pid);
  } catch (error) {
    throw new Error('ERROR: duplicate key value violates unique constraint "health_check_pkey"');
  }

};

exports.getWorkerPidAndInsert = async (workerPids) => {
  try {
    await console.log('healthCheck checkWorker:', workerPids);
    for (let i = 0 ; i < workerPids.length ; i++) {
      await insertData(workerPids[i]);
    }
  } catch (error) {
    throw new Error(error.message);
  }
  
};

exports.getWorkerPid = async (indoorId) => {
  try {
    await console.log('healthCheck getWorkerPid:', indoorId);
    const result = await healthCheckDao.checkPidByTag(indoorId);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deletePid = async (indoorId) => {
  try {
    await console.log('healthCheck deletePid:', indoorId);
    const result = await healthCheckDao.deletePidByTag(indoorId);
    if (result === undefined || Number(result.rowCount) !== 1) {
      throw new Error('fail to delete pids record');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
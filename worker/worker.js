var io = require('socket.io-client');
var socket = io.connect("https://www.wistron-ibs.com", {
    reconnection: true
});
const { fork } = require('child_process');
const pidsDao = require('../rest/models/pidsDao');
const errorCode = require('../rest/utils/errorCode')
let data = require('../rest/service/utils/data.json')
var ps = require('ps-node');
const generateUUID = require('../rest/utils/generateUUID');
const healthCheck = require('../rest/service/utils/healthCheck');

socket.on('connect', function () {
    socket.on('checkin', async function (tagobj) {
        console.log('********* checkin message from the server:', tagobj);
        try {
            const { indoorId } = tagobj;
            const forked = fork(`${__dirname}/../rest/service/process/child.js`);
            forked.on('message', (msg) => {
                socket.emit('taginfo', msg);
            });
            const pid = forked.pid
            const pidInfoObj = Object.assign({ indoorId, pid });
            const result = await pidsDao.create(pidInfoObj);
            if (result === undefined || Number(result.rowCount) !== 1) {
                throw new Error('ERROR: fail to create pids record')
            }
            forked.send(tagobj);
        }
        catch (error) { throw error }
    });
    socket.on('recovery', async function (tagobj) {
        console.log('********* recovery message from the server:', tagobj);
        try {
            const { indoorId } = tagobj;
            const worker_pid = await healthCheck.getWorkerPid(indoorId)
            if (worker_pid.rows[0] !== undefined) {
                await healthCheck.deletePid(indoorId)
            }
            const forked = fork(`${__dirname}/../rest/service/process/child.js`);
            forked.on('message', (msg) => {
                socket.emit('taginfo', msg);
            });
            const pid = forked.pid
            const pidInfoObj = Object.assign({ indoorId, pid });
            const result = await pidsDao.create(pidInfoObj);
            if (result === undefined || Number(result.rowCount) !== 1) {
                throw new Error('ERROR: fail to create pids record')
            }
            forked.send(tagobj);
        }
        catch (error) { throw error }
    });
    socket.on('checkout', async function (indoorId) {
        console.log('********* checkout message from the server:', indoorId);
        try {
            const pidInfoObj = Object.assign({ indoorId });
            const result = await healthCheck.getWorkerPid(indoorId)
            if (result.rows[0] !== undefined) {
                await healthCheck.deletePid(indoorId)
                process.kill(result.rows[0].pid);
                socket.emit('destory_tag', indoorId);
            }
        } catch (error) {
            throw error;
        }
    });
    socket.on('health_check', async function (msg) {
        let pids = [];
        // A simple pid lookup 
        ps.lookup({
            command: 'node',
            arguments: 'child.js',
        }, function (err, resultList) {
            if (err) {
                throw new Error(err);
            }

            resultList.forEach(function (process) {
                if (process) {
                    pids.push(process.pid)
                }
            });
            socket.emit('health_result', pids);
        });
    });
    socket.on('worker_robot_event', async function (robot_obj) {
        //delete first
        const { x, y, uuid, type, gotoDestination } = robot_obj;       
        const worker_pid = await healthCheck.getWorkerPid(uuid)
        if (worker_pid.rows[0] !== undefined) {
            await healthCheck.deletePid(uuid)
            process.kill(worker_pid.rows[0].pid);
        }
        // create child process for robot event 
        const forked = fork(`${__dirname}/../rest/service/process/robot.js`);
        //message form child process 
        const belongingsList = []
        forked.on('message', async (data) => {
            if (((data.x === '24.0' && data.y === '10.40' ||
                data.x === '17.50' && data.y === '16.80' ||
                data.x === '15.25' && data.y === '10.0') && data.patrol === true) 
                || (data.x === '1.5' && data.y === '5.5' && data.goto === true)) {
                const belongings_uuid = await generateUUID.generateUUIDByRandom();
                const msg = Object.assign({}, { x: data.x, y: data.y, uuid: belongings_uuid });
                belongingsList.push(msg)
            }
            if (data.status === 'done') {
                const worker_pid = await healthCheck.getWorkerPid(uuid)
                if (worker_pid.rows[0] !== undefined) {
                    await healthCheck.deletePid(uuid)
                    process.kill(worker_pid.rows[0].pid);
                    socket.emit('worker_robot_stop', {
                        "type": type,
                        "uuid": uuid, // robot's
                        "duration": data.duration,
                        "belongings": data.belongings,
                        "floorRoom": "13F/1304"
                    });
                    for (var i = 0; i < belongingsList.length; i++) {
                        socket.emit('worker_belongings', belongingsList[i]);
                    }
                    return;
                }
            }
            socket.emit('worker_robot_result', data);
        });
        const pid = forked.pid
        const indoorId = uuid
        const pidInfoObj = Object.assign({ x, y, indoorId, pid, type, gotoDestination });
        const result = await pidsDao.create(pidInfoObj);
        if (result === undefined || Number(result.rowCount) !== 1) {
            throw new Error('ERROR: fail to create pids record')
        }
        //send event to child process
        forked.send(pidInfoObj);
    });
});



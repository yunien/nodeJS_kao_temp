const healthCheck = require('./healthCheck');
//socket io module
const socketIo = require('socket.io');
// create a new ojbect chat
let ws = {};

ws.initialize = function (service) {
    this.io = service;
    this.ioListen();
}
// major socket listening method
ws.ioListen = function () {
    console.log('wsService io Listen')
    this.io.on('connection', (socket) => {
        console.log('somebody on connection', socket.id);
        //front-end: people postition.
        socket.on('taginfo', (data) => {
            ws.io.emit('tagdata', data);
        });
        //front-end: destory people postition.
        socket.on('destory_tag', (data) => {
            ws.io.emit('destory', data);
        });
        //backend: worker child process status (init server or once every 10 min).
        socket.on('health_result', async (data) => {
            await healthCheck.getWorkerPidAndInsert(data);
        });
        //front-end: robot patrol event.
        socket.on('patrol', (data) => {
            Object.assign(data, { type: 'patrol' });
            ws.io.emit('worker_robot_event', data)
        });
        //front-end: robot goto event.
        socket.on('goto', (data) => {
            const { gotoDestination } = data
            Object.assign(data, { type: 'goto' });
            ws.io.emit('worker_robot_event', data)
        });
        //front-end: robot goto event.
        socket.on('return', async (data) => {
            Object.assign(data, { type: 'return' });
            ws.io.emit('worker_robot_event', data)
        });
        //worker response robot's position and sent to front-end
        socket.on('worker_robot_result', (data) => {
            ws.io.emit('robot', data)
        });
        //worker send robot stop event and sent to front-end
        socket.on('worker_robot_stop', (data) => {
            data.type === 'patrol' ? ws.io.emit('patrol_stop', data) : ws.io.emit('goto_stop', data)
        });
        //worker response rebot belongings event and sent to front-end
        socket.on('worker_belongings', (data) => {
            ws.io.emit('belongings', data)
        });
    });
}

module.exports = ws;

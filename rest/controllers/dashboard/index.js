const Router = require('koa-router');
const controller = require('./dashboardController');

const router = new Router();

// {ip}:{port}/api/dashboard/???
router.post('/createArea', controller.createArea);
router.get('/getFirstMenu', controller.getFirstMenu);
router.get('/getPassableArea/:uuid', controller.getPassableArea);
router.get('/getRoomInfo/:uuid', controller.getRoomInfo);
router.get('/getCameras/:uuid', controller.getCameras);
router.get('/getRobots/:uuid', controller.getRobots);
router.get('/robotView/:direction', controller.robotView);

module.exports = router;
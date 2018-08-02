const Router = require('koa-router');
const controller = require('./initialSettingController');

const router = new Router();

// {ip}:{port}/api/initialSetting/???
router.post('/camera', controller.camera);
router.post('/robot', controller.robot);

module.exports = router;
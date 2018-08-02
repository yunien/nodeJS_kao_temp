const Router = require('koa-router');
const controller = require('./userController');

const router = new Router();

// {ip}:{port}/api/users/???
router.post('/register', controller.register);
router.get('/getBadge/:badgeId', controller.getBadge);
router.post('/checkOut', controller.checkOut);

module.exports = router;
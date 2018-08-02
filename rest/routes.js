const Router = require('koa-router');
const usersRouter = require('./controllers/users/index');
const dashboardRouter = require('./controllers/dashboard/index');
const initialSettingRouter = require('./controllers/initialSetting/index');

module.exports = (app) => {
  
  const rootRouter = new Router(
    { prefix: '/api' }
  );

  rootRouter.get('/', (ctx, next) => {
    ctx.body = 'Sev Palform Project';
  });

  //all router root
  rootRouter.use('/users', usersRouter.routes());
  rootRouter.use('/dashboard', dashboardRouter.routes());
  rootRouter.use('/initialSetting', initialSettingRouter.routes());

  //http://{domainName}/{port}/api/...
  app.use(rootRouter.routes(), rootRouter.allowedMethods());

}

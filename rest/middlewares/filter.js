module.exports = async (ctx, next) => {
  console.log('filter');
  try {
    await next();
  } catch (err) {
    if (!err) {
      return ctx.error({ msg: new Error('未知错误!') });
    }
    if (typeof (err) == 'string') {
      return ctx.error({ msg: new Error(err) });
    }
    // logger.error(err.stack);
    ctx.error({ msg: 'server error!', error: err, status: ctx.status });
  }
}
// 导出一个专门处理静态资源的方法
const KoaStatic = require('koa-static')
const path = require('path')

module.exports = function(context) {
    // root 项目根目录
    const {app, root} = context
    // 托管项目的根目录
    app.use(KoaStatic(root))
    // 托管项目的public 目录
    app.use(KoaStatic(path.resolve(root, 'public')))
    // app.use(KoaStatic(path.resolve(root, 'src')))
}

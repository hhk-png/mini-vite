const Koa = require('koa')
const { readFile } = require('fs/promises')
const serveStaticPlugin = require('./plugins/server/serveStaticPlugin')
const rewriteModulePlugin = require('./plugins/server/rewriteModulePlugin')
const moduleResolvePlugin = require('./plugins/server/moduleResolvePlugin')
const htmlRewritePlugin = require('./plugins/server/htmlRewritePlugin')
const vueServerPlugin = require('./plugins/server/vueServerPlugin')

module.exports = function createServer() {
    console.log('createServer')
    // 使用koa 创建一个服务器
    const app = new Koa()
    // 目标项目的根目录路径
    const root = process.cwd()
    const context = { app, root }
    // 插件
    const resolvePlugins = [
        // 重写html，插入需要的代码
        htmlRewritePlugin,
        // 重写模块路径
        rewriteModulePlugin,
        // 解析.vue 文件
        vueServerPlugin,
        // 解析模块路径
        moduleResolvePlugin,
        // 配置静态资源服务
        serveStaticPlugin,
    ]
    resolvePlugins.forEach(f => f(context))

    return app
}
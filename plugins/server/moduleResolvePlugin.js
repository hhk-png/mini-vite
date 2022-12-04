const fs = require('fs').promises
const moduleReg = /^\/@modules\//
const path = require('path')

function resolveVue(root) {
    const compilePkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json')
    const compilerPkg = require(compilePkgPath)
    const compilerPath = path.join(path.dirname(compilePkgPath), compilerPkg.main)
    const resolvePath = (name) => path.join(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`)
    const runtimeCorePath = resolvePath('runtime-core')
    const runtimeDomPath = resolvePath('runtime-dom')
    const reactivityPath = resolvePath('reactivity')
    const sharedPath = resolvePath('shared')
    return {
        compiler: compilerPath,
        '@vue/runtime-dom': runtimeDomPath,
        '@vue/runtime-core': runtimeCorePath,
        '@vue/reactivity': reactivityPath,
        '@vue/shared': sharedPath,
        'vue': runtimeDomPath
    }
}   

module.exports = function({app, root}) {
    const vueResolved = resolveVue(root)
    app.use(async (ctx, next) => {
        if (!moduleReg.test(ctx.path)) {
            return next()
        }

        const id = ctx.path.replace(moduleReg, '')
        ctx.type = 'js'
        const content = await fs.readFile(vueResolved[id], 'utf8')
        ctx.body = content
    })
}



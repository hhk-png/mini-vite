const { readFile } = require('fs/promises')
const path = require('path')

function getCompilerPath(root) {
    const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json')
    const compilerPkg = require(compilerPkgPath)
    return path.join(path.dirname(compilerPkgPath), compilerPkg.main)
}

module.exports = function ({ app, root }) {
    app.use(async (ctx, next) => {
        const filePath = path.join(root, ctx.path)
        if (!ctx.path.endsWith('.vue')) {
            return next()
        }
        // 拿到文件内容
        const content = await readFile(filePath, 'utf8')
        const { parse, compileTemplate } = require(getCompilerPath(root))
        const { descriptor } = parse(content)

        const defaultExportRE = /((?:^|\n|;)\s*)export default/
        if (!ctx.query.type) {
            let code = ''
            if (descriptor.script) {
                let content = descriptor.script.content
                let replaced = content.replace(defaultExportRE, '$1const __script = ')
                code += replaced
            }
            if (descriptor.styles.length) {
                descriptor.styles.forEach((item, index) => {
                    code += `\nimport "${ctx.path}?type=style&index=${index}"\n`
                })
            }
            if (descriptor.template) {
                const templateRequest = ctx.path + '?type=template'
                code += `\nimport {render as __render} from ${JSON.stringify(templateRequest)}`
                code += `\n__script.render = __render`
            }
            ctx.type = 'js'
            code += `\nexport default __script`
            ctx.body = code
        }
        if (ctx.query.type === 'style') {
            const styleBlock = descriptor.styles[ctx.query.index]
            ctx.type = 'js'
            ctx.body = `
                \n const __css = ${JSON.stringify(styleBlock.content)}
                \n updateCss(__css)
                \n export default __css
            `
        }
        if (ctx.query.type === 'template') {
            ctx.type = 'js'
            let content = descriptor.template.content
            const { code } = compileTemplate({ source: content })
            ctx.body = code
        }
    })
}


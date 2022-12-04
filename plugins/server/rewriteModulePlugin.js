const { readBody } = require('./utils')
const { parse } = require('es-module-lexer')
const MagicString = require('magic-string')
const { readFileSync } = require('fs')

function rewriteImports(source) {
    let imports = parse(source)[0]
    let magicString = new MagicString(source)
    if (imports.length) {
        imports.forEach(item => {
            const { start, end } = item
            let id = source.substring(start, end)
            const reg = /^[^\/\.]/
            if (reg.test(id)) {
                id = `/@modules/${id}`
                magicString.overwrite(start, end, id)
            }
        })
    }
    console.log(magicString.toString())
}

module.exports = function ({ app, root }) {
    app.use(async (ctx, next) => {
        await next()

        if (ctx.body && ctx.response.is('js')) {
            console.log(ctx.body.path)
            const content = await readBody(ctx.body);
            ctx.body = rewriteImports(content)
        }

    })
}


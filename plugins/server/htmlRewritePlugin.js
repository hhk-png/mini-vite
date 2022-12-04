const { readBody } = require('./utils')

module.exports = function ({ root, app }) {
    // 处理客户端没有process 对象的情况
    const inject = `
    <script type='text/javasript'>
        window.process = {
            env: {
                NODE_ENV: 'development'
            }
        };
        function updateCss(css) {
            const style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = css
            document.head.appendChild(style)
        }

    </script>
    `
    app.use(async (ctx, next) => {
        await next()
        if (ctx.response.is('html')) {
            let html = await readBody(ctx.body)
            ctx.type = 'text/html'
            ctx.body = html.replace(/<head>/, `$&${inject}`)
        }
    })
}

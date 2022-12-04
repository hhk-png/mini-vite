#! /usr/bin/env node
// 声明该文件以node 环境运行

// 在package.json 文件的bin 对象下添加自定义的命令

const createServer = require('../index.js')

createServer().listen(5138, () => {
    console.log('app has started at port 5138: localhost:5138')
})


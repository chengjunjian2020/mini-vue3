npm init

npm install jest @types/jest -D

npm install -g typescript 

tsc --init

安装babel和配置支持esm模块

https://www.jestjs.cn/docs/getting-started

使用babel支持jest使用typescript

npm install --save-dev @babel/preset-typescript

`module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};`
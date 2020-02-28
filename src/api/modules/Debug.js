/* @Lee */

// 调试模块的接口

export default [{
  name: 'startDebug',
  protocol: 'websocket',
  desc: '开启调试',
  params: {}
},{
  name: 'stepOver',
  protocol: 'websocket',
  desc: '单步调试（不进入函数）',
  params: {}
},{
  name: 'stepInto',
  protocol: 'websocket',
  desc: '单步调试（进入函数）',
  params: {}
},{
  name: 'continueDebug',
  protocol: 'websocket',
  desc: '继续调试，即进入下一个断点或者切换至下组数据',
  params: {}
},{
  name: 'stopDebug',
  protocol: 'websocket',
  desc: '停止调试',
  params: {}
},{
  name: 'updateBreakPoint',
  protocol: 'websocket',
  desc: '调试过程中更新断点',
  params: {}
},{
  name: 'setWatch',
  protocol: 'websocket',
  desc: '设置观察点',
  params: {}
},{
  name: 'setObservePoint',
  protocol: 'websocket',
  desc: '设置观察点',
  params: {}
},{
  name: 'saveBreakPoint',
  protocol: 'websocket',
  desc: '关闭题目时保存断点',
  params: {}
},{
  name: 'saveObservePoint',
  protocol: 'websocket',
  desc: '关闭题目时保存观察点',
  params: {}
},{
  name: 'getBreakPoint',
  protocol: 'websocket',
  desc: '获取上次保存的断点',
  params: {}
},{
  name: 'getObservePoint',
  protocol: 'websocket',
  desc: '获取上次保存的观察点',
  params: {}
}]
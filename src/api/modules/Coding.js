/* @Lee */

// 编码模块的接口

export default [{
  name: 'compile',
  protocol: 'websocket',
  desc: '编译代码',
  params: {}
},{
  name: 'breakCompile',
  protocol: 'websocket',
  desc: '编译时间太长，用户可以选择中断编译',
  params: {}
},{
  name: 'run',
  protocol: 'websocket',
  desc: '运行代码',
  params: {}
},{
  name: 'breakRun',
  protocol: 'websocket',
  desc: '运行时间太长，用户可以选择中断运行',
  params: {}
},{
  name: 'input',
  protocol: 'websocket',
  desc: '程序输入',
  params: {}
},{
  name: 'saveAnswer',
  protocol: 'websocket',
  desc: '保存答案',
  params: {}
},{
  name: 'getPassedCode',
  protocol: 'websocket',
  desc: '获取已通过的代码',
  params: {}
},{
  name: 'getUnPassedTestData',
  protocol: 'websocket',
  desc: '获取未通过的测试数据集',
  params: {}
},{
  name: 'banOrOpenOrRemoveTestData',
  protocol: 'websocket',
  desc: '禁用、启用或移除未通过测试数据集',
  params: {}
}]
<template>
  <div class="variates-pane" ref="varPane">
    <pane-header bgColor="info" title="变量与堆栈">
      <i class="el-icon-setting" title="设置堆栈数据的显示"></i>
    </pane-header>
    <transition  @before-enter="containerBeforeEnter">
      <div class="stacks-container" 
        v-if= "showcontainer">
        <active-stack 
          ref= "activeStack"
          :stack-top= "finalShow.stackTop"
          :diff.sync= "diff"
          :showTop= "showTop"
          :pushStack= "pushStack"
          :oldLen= "oldStacks.length"
          :clearSign= "clearSign"/>
        <div class="not-stack-top">
          <inactive-stack-top 
            :in-stack-top= "finalShow.first"
            :showNotTop= "showNotTop"
            :oldLen= "oldStacks.length"/>
          <inactive-stack-other
            :in-stack-other= "finalShow.other"/>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

import ActiveStack from './active-stack'
import InactiveStackTop from './inactive-stack-top'
import InactiveStackOther from './inactive-stack-other'
import paneHeader from 'components/pane-header'
import mixin from './mixin'

export default {
  mixins: [mixin],
  data() {
    return {
      controlDiff: false,
      topEnterClass: '' ,
      topLeaveClass: '' , 
      notTopEnterClass: '',
      notTopLeaveClass: '',
      showcontainer: true,
      pushStack: 1, 
      changeDom: '',
      changeIdArr: [],
      oldStacks: [],
      cacheVarArr: [],
      finalShow: {},
      diff: false,
      showTop: true,
      showNotTop: true,
      clearSign: false
    }
  },
  methods: {
    /*整个栈变化的逻辑，出现在刚开启调试或者是整组数据切换 时 */
    containerBeforeEnter(el){   //堆栈整体出现前
      el.style.opacity = 0
    },
    containerEnter(el,done){  //堆栈整体出现动画执行
      el.velocity({opacity: 1},{duration: 700,complete: done})
    },
    containerLeave(el,done){    //堆栈整体离开时的动画
      el.velocity({opacity: 0},{duration: 700,complete: done})
    },

    /*函数栈数据清洗逻辑*/
    isNextData(output) {     //判断本次调试是否是一组新的数据(这种判断方式不标准，建议后端添加相应标志)
      if(output.includes("--------ERROR--------")||output.includes("--------RIGHT--------"))
        return true
      return false
    },
    formatVariates(variates) {        //格式化变量名，将字符串变为数组用以高亮
      if(!variates) return
      variates = Array.isArray(variates) ? variates : [variates]
      let tempArr = []
      variates.forEach((item,index)=>{
        let obj = {}
        let formatName 
        if(item.name)
          formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
        obj.varInfo = [formatName,": ",item.value]
        obj.sign = item.name     
        obj.id = item.name
        if(item.innerObj) 
          obj.varChild = this.formatVariates(item.innerObj)
        tempArr.push(obj)
      })
      return tempArr
    },
    formatStacksName(backTraces) {   //格式化函数名，用以高亮
      if(!Array.isArray(backTraces)) return
      const stacksName = []
      const variatesName = []
      backTraces.forEach((item,i)=>{
        const tempArr = []
        let lastPlace = 0
        item.replace(/\(\s*(\w*?)=|,\s*(\w*?)=/g,(a,b,c,d,e)=>{
          tempArr.push(" "+e.substring(lastPlace,d+1)+" ",b?b:c)
          lastPlace = d+a.length-1
        })
        tempArr.push(item.substring(lastPlace))
        stacksName.push(tempArr)
      })
      return stacksName
    },

    setStackTop(stacks,backTrace) {   //设置栈顶
      if(!stacks) return
      const stackTop = {}
      stackTop.varInfo = stacks[0].name
      stackTop.sign = backTrace[0]
      stackTop.id = backTrace[0]
      stackTop.varChild = stacks[0].variates
      return [stackTop]
    },
    setNotStackTop(stacks,fullNames) {  //设置非栈顶
      return stacks.filter((item,index)=>index!=0).map((item,i)=>{
        const stack = {}
        stack.varInfo = item.name
        stack.sign = fullNames[i+1]
        stack.varChild = item.variates
        return stack
      })
    },
    setNewStacks(stacksName,oldStacks=[],stackTopVariates,isNewGroup){   //设置全新的函数栈
      oldStacks= !isNewGroup ? oldStacks: []
      this.setOldStacks(oldStacks)  //oldStacks被清空
      const newStacks = []
      const newLen = stacksName.length
      const oldLen = oldStacks.length
      this.clearSign = true      //是否要清空已展开数据
      if(newLen>oldLen){
        stacksName.forEach((item,i)=>{
          const oldVariates = oldStacks[i-1] ? oldStacks[i-1].variates : []
          const variates = (i==0) ? stackTopVariates : oldVariates
          newStacks.push({name:item,variates:variates})
        })
      }else if(newLen==oldLen){
        this.clearSign = false   //只有在栈顶函数未发生变化时才不清空
        stacksName.forEach((item, i)=>{
          const oldVariates = oldStacks[i].variates
          const variates = (i==0) ? stackTopVariates : oldVariates
          newStacks.push({name:item,variates:variates})
        })
      }else{
        stacksName.forEach((item, i)=>{
          const variates = (i==0) ? stackTopVariates : oldStacks[i+1].variates
          newStacks.push({name:item,variates:variates})
        })       
      }
      return newStacks
    },
    setOldStacks(newStacks){    //设置旧函数栈
      this.oldStacks = newStacks
    },

    /*控制全部动画的总开关(为了触发transition的钩子函数，只能通过切换v-if来触发)*/
    setAnimation(newLen,oldLen,isNewGroup) {   
      return new Promise((resolve,reject)=>{
        if(isNewGroup){
          this.showcontainer = false
          setTimeout(()=>{    
            this.showcontainer = true
            resolve()
          },690)
        }
        else{
          if(oldLen==0){
            this.showTop = true
            resolve()
          }
          if(!this.pushStack){
            resolve()
          }
          else if(this.pushStack!=0)
              this.showTop = false
          setTimeout(()=>{    
            this.showTop = true
            resolve()
          },690)
          if(this.pushStack==-1){
            this.showNotTop = false
            setTimeout(()=>{    
              this.showNotTop = true
              resolve()
            },690)
        }
        }
      })
    },
    
    /*函数出栈还是入栈，或者是还在当前函数 */
    getPushStack(newLen,oldLen){      //判断本次调试的行为是函数入栈，函数出栈或者是没有出入栈
      let pushStack = 0
      if(newLen>oldLen)       //函数入栈
        pushStack=1
      else if(newLen==oldLen)   //未出栈和入栈
        pushStack=0
      else
        pushStack=-1       //函数出栈
      return pushStack
    },

    /*入口函数 */
    mainFun(backTrace,variates,output) {  
      //每次都对栈顶做清空操作 
      //判断本步调试是否是一组全新的数据
      const isNewGroup = this.isNextData(output)    //判断是否是新的一组调试数据
      //清洗数据
      const stackTopVariates = this.formatVariates(variates)  //格式化栈顶函数的变量
      const stacksName = this.formatStacksName(backTrace)     //格式化所有函数的函数名

      //计算最新的函数栈
      const newStacks = this.setNewStacks(stacksName,this.oldStacks,stackTopVariates,isNewGroup)  //设置新的函数栈

      const stackTop = this.setStackTop(newStacks,backTrace)  //设置最终的栈顶函数
      const notStackTop = this.setNotStackTop(newStacks,backTrace)    //设置最终的非栈顶函数
      //非活跃函数拆分
      const first = notStackTop.length?[notStackTop[0]]:[]
      const other = notStackTop.slice(1)
      
      //计算本地动作
      this.pushStack=this.getPushStack(newStacks.length,this.oldStacks.length)
      
      // this.$refs.activeStack&&this.$refs.activeStack.clearCache()  
      //动画设置，并在动画执行结束后缓存函数栈，以便下次做对比，同时设置最终用于展示的数据
      this.setAnimation(newStacks.length,this.oldStacks.length,isNewGroup).then(()=>{
        this.$refs.activeStack.clearCache()
        this.setOldStacks(newStacks)    //设置旧函数栈
        //拆分完成的值，将用于分配至子组件
        this.finalShow = {stackTop,first,other}
        //根据pushStack决定是否对栈顶组件做diff
        !this.pushStack&&(this.diff=true)
      })
    },
  },
  watch: {
    'currentDebug.backTrace': {
      immediate: true,  
      deep: true,
      handler(backTrace){  
        //这里监听backTrace而不是currentDebug是为了防止watch面板的变量和variate面板相互干扰
        const currentDebug = this.currentDebug  
        const variates =  currentDebug.variate.map(item=>item.variate) 
        const output = currentDebug.output
        this.mainFun(backTrace,variates,output)   //调用主函数
      }
    },
  },
  components:{
    ActiveStack,
    InactiveStackTop,
    InactiveStackOther,
    paneHeader
  }
}
</script>

<style lang="scss" scoped>
  .variates-pane /deep/{
    height: 100%;
    position: relative;
    font-family: "Courier New";
    .el-tree{
      height: calc(100% - 32px);
      overflow: auto;
      color: black;
      font-family: "Cambria Math";
      position: static;
    }
    .el-tree-node{
      margin-bottom: 3px;
      background-color: rgb(248,248,248);
    }
    .el-tree-node__children {
      font-size: 15px;
    }
    .el-tree__empty-block{
      display: none;
    }
    .el-tree-node__content:hover {
        background-color: #dcdcdc;
    }
  } 
  .stacks-container {
    position: relative;
    height: calc(100% - 32px);
    margin-top: 5px;
    width: 100%;
  }
  .not-stack-top {
    position: absolute;
    bottom: 10px;
    width: 100%;
  }
</style>
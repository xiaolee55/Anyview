<template>
  <div class="variates-pane" ref="varPane">
    <pane-header bgColor="info" title="变量与堆栈">
      <i class="el-icon-setting" title="设置堆栈数据的显示"></i>
    </pane-header>
    <transition  @before-enter="containerBeforeEnter">
      <div class="stacks-container" 
        v-if= "showcontainer">
        <active-stack 
          v-if= "showTop"
          :stack-top= "finalShow.stackTop"
          :diff= "diff"/>
        <inactive-stack-top 
          v-if= "showNotTop"
          :in-stack-top= "finalShow.first"/>
        <inactive-stack-other
          :in-stack-top= "finalShow.other"/>
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
      topEnterClass: '' ,
      topLeaveClass: '' , 
      notTopEnterClass: '',
      notTopLeaveClass: '',
      showcontainer: true,
      showTop: true,
      showNotTop: true,
      pushStack: 1, 
      changeDom: '',
      changeIdArr: [],
      oldStacks: [],
      cacheVarArr: [],
      finalShow: {},
      diff: false
    }
  },
  methods: {
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
    isNextData(output) {     //判断本次调试是否是一组新的数据
      if(output.includes("<br>========RIGHT========<br>")||output.includes("<br>--------ERROR--------<br>"))
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
      // this.createExpandElement(stackTop.id)
      return [stackTop]
    },
    setNotStackTop(stacks,fullNames) {  //设置非栈顶
      return stacks.filter((item,index)=>index!=0).map((item,i)=>{
        const stack = {}
        stack.varInfo = item.name
        stack.sign = fullNames[i]
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
      let clearSign = true      //是否要清空已展开数据
      if(newLen>oldLen){
        stacksName.forEach((item,i)=>{
          const oldVariates = oldStacks[i-1] ? oldStacks[i-1].variates : []
          const variates = (i==0) ? stackTopVariates : oldVariates
          newStacks.push({name:item,variates:variates})
        })
      }else if(newLen==oldLen){
        clearSign = false   //只有在栈顶函数未发生变化时才不清空
        stacksName.forEach((item, i)=>{
          const oldVariates = oldStacks[i].variates
          const variates = (i==0) ? stackTopVariates : oldVariates
          // i==0&&(this.diff=true)
          newStacks.push({name:item,variates:variates})
        })
      }else{
        stacksName.forEach((item, i)=>{
          const variates = (i==0) ? stackTopVariates : oldStacks[i+1].variates
          newStacks.push({name:item,variates:variates})
        })       
      }
      // this.clearExpandList(clearSign)
      return newStacks
    },
    setOldStacks(newStacks){    //设置旧函数栈
      this.oldStacks = newStacks
    },
    setOldVariates(variates){   //设置旧变量
      this.oldVariates = variates
    },

    /*控制全部动画的总开关*/
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
      if(newLen>oldLen)
        pushStack=1
      else if(newLen==oldLen)
        pushStack=0
      else
        pushStack=-1
      return pushStack
    },

    /*入口函数 */
    mainFun(backTrace,variates,output) {   
      //判断本步调试是否是一组全新的数据
      const isNewGroup = this.isNextData(output)    //判断是否是新的一组调试数据

      // console.log("backTrace",backTrace,"variates",variates);
      //清洗数据
      const stackTopVariates = this.formatVariates(variates)  //格式化栈顶函数的变量
      const stacksName = this.formatStacksName(backTrace)     //格式化所有函数的函数名

      // console.log("stackTopVariates",stackTopVariates,"stacksName",stacksName);

      //计算最新的函数栈
      const newStacks = this.setNewStacks(stacksName,this.oldStacks,stackTopVariates,isNewGroup)  //设置新的函数栈
      const stackTop = this.setStackTop(newStacks,backTrace)  //设置最终的栈顶函数
      const notStackTop = this.setNotStackTop(newStacks,backTrace)    //设置最终的非栈顶函数
      this.pushStack=this.getPushStack(newStacks.length,this.oldStacks.length)
      //非活跃函数拆分
      const first = notStackTop.length?[notStackTop[0]]:[]
      const other = notStackTop.slice(1)

      //动画设置，并在动画执行结束后缓存函数栈，以便下次做对比，同时设置最终用于展示的数据
      this.setAnimation(newStacks.length,this.oldStacks.length,isNewGroup).then(()=>{
        //判断函数是否有出栈入栈，进而判断函数内变量是否修改
        this.setOldVariates(variates)   //设置旧栈顶函数变量（未经格式化的）
        this.setOldStacks(newStacks)    //设置旧函数栈
        this.finalShow = {stackTop,first,other}
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
        setTimeout(()=>{
          this.mainFun(backTrace,variates,output)   //调用主函数
        },500)    //调试布局完成后再加载数据，防止卡顿现象的出现
      }
    }
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
  .stack-top {    //防止子元素设置margin-top影响父元素
    height: 100%;
    border: 0.1px white solid; 
  }
  .stack-top-var-name {
    color: rgb(255,255,0)!important
  }
  .not-stack-top-var-name {
    color: #0089BD
  }
  .var-name {
    transition: color 1s ease;
    color: rgb(112,48,160);
  }
  .point-val {
    transition: color 1s ease;
    color: rgb(127, 127, 127)
  }
  .change-var{
    color: red;
  }
</style>
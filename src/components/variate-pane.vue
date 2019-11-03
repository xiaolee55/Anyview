<template>
  <div class="variates-pane" ref="varPane">
    <el-tag type="info" effect="dark" class="variates-title" ref="varTitle">变量与堆栈</el-tag>
    <div class="stacks-container">
      <div class="stack-top">
        <el-tree :data= "finalShow.stackTop" 
          empty-text = ""
           node-key = "id"
          @node-expand= "nodeExpand"
          @node-collapse= "nodeCollapse"
          :default-expanded-keys= "expandedNodeList"
          :props= "defaultProps">
          <span class="custom-tree-node" slot-scope="{ node,data }" :id="node.level==1?'stackName':''">
            <span v-for= "(item,index) in node.label" :key="item">
               <el-tooltip class="item" effect="light" :content= "getOldVal(data)" placement="right">
                <span :class= "stackClass({index,item,node},'top')">{{item}}</span>
              </el-tooltip>
            </span>
          </span>
        </el-tree>
      </div>
      <div class="not-stack-top">
        <el-tree :data= "finalShow.notStackTop"
          empty-text = "" 
          :props= "defaultProps">
          <span class="custom-tree-node" slot-scope="{ node}" :id="node.level==1?`stackName${node.id}`:''">
            <span v-for= "(item,index) in node.label" :key="item">
              <span :class= "stackClass({index,item,node},'notTop')">{{item}}{{test}}</span>
            </span>
          </span>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import log from 'common/js/log.js'

export default {
  data () {
    return {
      changeVarArr: [],
      changeVarMap: {},
      expandedNodeList: [],
      cacheVarArr: [],
      finalShow: {},
      num: 0,
      defaultProps: {
        children: 'varChild',
        label: 'varInfo'
      },  
    }
  },
  methods: {
    getOldVal(data) {
      const changeVar = this.changeVarArr.find(item=>item.id == data.id)
      this.cacheOldValue(changeVar)
      const val = this.changeVarMap[data.id]
      let oldVal = val ? val : "未变化"
      return `上一次的值：${oldVal}`
    },
    cacheOldValue(_var) {
      if(!_var)
        return
      const arr = this.cacheVarArr
      this.changeVarMap[_var.id] = _var.oldVal
    },
    nodeExpand(data,node,component) {     
      this.createExpandElement(data.id); // 在节点展开是添加到默认展开数组
    },
    nodeCollapse(data) {
      this.removeExpandElement(data)
    },
    createExpandElement(element) {
      this.expandedNodeList.push(element);
    },
    removeExpandElement(element) {
      this.expandedNodeList=this.expandedNodeList.filter(item=>item!=element.id) // 收起时删除数组里对应选项
      if(element.varChild){
        element.varChild.forEach((item,index)=>{
          this.removeExpandElement(element.varChild[index])
        })   
      }
    },
    clearExpandList(id){    //清空展开的变量标志
      id?this.expandedNodeList = []: ''
    },
    stackClass({index,item,node},flag) {      //设置函数栈的样式
      const level = node.level
      const id = node.id
      const data = node.data
      this.$nextTick(()=>{
      let el
      let backgroundColor 
      let color
      if(flag =='top'){   //设置栈顶函数的基本样式
        el = document.getElementById("stackName")?document.getElementById("stackName").parentNode: null
        backgroundColor =  "rgb(51,153,102)"
        color = "white"
      }else{ //设置非栈顶函数的基本样式
        el = document.querySelector(`#stackName${id}`)?document.querySelector(`#stackName${id}`).parentNode: null
        backgroundColor = "#dcdcdc"
        color = "#909399"
      }
      if(level==1&&el){
        this.setStackNameBaseClass({el,backgroundColor,color})
      }
     })
     if(level==1&&index%2!=0) {   //设置函数名中形参变量的高亮
       return  this.setStackNameClass(flag)
     }else if(level!=1){ //设置函数内变量的高亮
        const ifChange = this.changeVarArr.find(element=>element.id==data.id)
        // ifChange?this.removeExpandElement(data):''  //从变量展开数组中移除该项，即变量发生变化时应该将其收起来
        return this.setStackVarsClass({flag,ifChange,index,item})
      }
    },
    setStackNameBaseClass({el,backgroundColor,color}) {
      el.style.backgroundColor = backgroundColor
      el.style.color = color
      el.style.fontSize = "17px"
    },
    setStackNameClass(flag){
      return flag=='top' ? 'stack-top-var-name' : 'not-stack-top-var-name'
    },
    setStackVarsClass({flag,ifChange,index,item}) {
      let varClass
      if(ifChange&&flag=="top"){   //刚发生变化的变量
        varClass ="change-var"
      }else if(index==0){ //普通变量名
        varClass = 'var-name'
      }else if(item.charAt(0)==0&&item[1]=="x"){  //变量值为指针
        varClass = 'point-val' 
      }else{   //普通变量值

      }
      return varClass
    },
    isNextData(output) {
      if(output.includes("<br>========RIGHT========<br>")||output.includes("<br>========ERROR========<br>"))
        return true
      return false
    },
    formatVariates(variates) {
      variates = Array.isArray(variates) ? variates : [variates]
      let tempArr = []
      variates.forEach((item,index)=>{
        let obj = {}
        let formatName 
        if(item.name)
          formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
        obj.varInfo = [formatName,": ",item.value]
        obj.sign = item.name
        obj.id = item.name+this.num    //名字加遍历的序号就能产生一个唯一ID，用于在保存变化变量或者被展开变量的标识
        this.setNum(1)
        if(item.innerObj) 
          obj.varChild = this.formatVariates(item.innerObj)
        tempArr.push(obj)
      })
      return tempArr
    },
    formatStacksName(backTraces) {
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
    findChangeVar(newVars,oldVars) {
      newVars = Array.isArray(newVars) ? newVars : [newVars]
      oldVars = Array.isArray(oldVars) ? oldVars : [oldVars]
      newVars.forEach((item,i)=>{
        const newVal = item.varInfo[2]
        const oldVal = oldVars[i].varInfo[2]
        if(newVal!=oldVal)
          this.setChangeVar(item.id,newVal,oldVal)
        else{
          if(item.varChild)
            this.findChangeVar(item.varChild,oldVars[i].varChild)
        }
      })
    },
    setChangeVar(id,newVal,oldVal){
      if(!this.changeVarArr.includes(id))
        this.changeVarArr.push({id,newVal,oldVal})
    },
    removeChangeVarArr(id){
      this.changeVarArr = this.changeVarArr.filter(item=>item.id!=id)
    },
    clearChangeVar() {
      this.changeVarArr = []
    },
    setStackTop(stacks,backTrace) {
      const stackTop = {}
      stackTop.varInfo = stacks[0].name
      stackTop.sign = backTrace[0]
      stackTop.id = backTrace[0]+'00'
      stackTop.varChild = stacks[0].variates
      this.createExpandElement(stackTop.id)
      return [stackTop]
    },
    setNotStackTop(stacks,fullNames) {
      return stacks.filter((item,index)=>index!=0).map((item,i)=>{
        const stack = {}
        stack.varInfo = item.name
        stack.sign = fullNames[i]
        stack.varChild = item.variates
        return stack
      })
    },
    setNewStacks(stacksName,oldStacks=[],stackTopVariates,isNewGroup){ 
      oldStacks= !isNewGroup ? oldStacks: []
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
          i==0?this.findChangeVar(variates,oldVariates): '' //查找发生变化的变量
          newStacks.push({name:item,variates:variates})
        })
      }else{
        stacksName.forEach((item, i)=>{
          const variates = (i==0) ? stackTopVariates : oldStacks[i+1].variates
          newStacks.push({name:item,variates:variates})
        })       
      }
      this.clearExpandList(clearSign)
      return newStacks
    },
    setOldStacks(newStacks){
      this.oldStacks = newStacks
    },
    setOldVariates(variates){
      this.oldVariates = variates
    },
    setNum(num) {
      this.num = this.num+num
    },
    resetNum() {
      this.num = 0
    },
    resetChangeVarMap(flag){
      flag?this.changeVarMap = {}:''
    },
    resetChangeVarArr() {
      this.changeVarArr=[]
    },
    setFinalShow(val){
      this.finalShow = val
    },
    mainFun(backTrace,variates,output) {    //主入口函数
      const isNewGroup = this.isNextData(output)    //判断是否是新的一组调试数据
      const stackTopVariates = this.formatVariates(variates)  //格式化栈顶函数的变量
      const stacksName = this.formatStacksName(backTrace)     //格式化所有函数的函数名
      this.resetNum()     //重置设置id所用的序号
      this.resetChangeVarMap(isNewGroup)    //重置保存变量旧值的对象
      this.resetChangeVarArr()    //清空保存变化变量的数组
      const newStacks = this.setNewStacks(stacksName,this.oldStacks,stackTopVariates,isNewGroup)  //设置新的函数栈
      this.setOldVariates(variates)   //设置旧栈顶函数变量（未经格式化的）
      this.setOldStacks(newStacks)    //设置旧函数栈
      const stackTop = this.setStackTop(newStacks,backTrace)  //设置最终的栈顶函数
      const notStackTop = this.setNotStackTop(newStacks,backTrace)    //设置最终的非栈顶函数
      this.setFinalShow({stackTop,notStackTop})   //设置最终用于展示的值
    }
  },
  watch: {
    currentDebug: {
      immediate: true,    //使用了immediate后handler函数会在created钩子函数之前执行，此时methods还未生成
      deep: true,     //深度监听currentDebug的所有属性
      handler(currentDebug){  //这里使用箭头函数的话使用this是不能访问到组件实例的,因为箭头函数绑定的是父级作用域的上下文，而匿名函数是指向全局
        const backTrace = currentDebug.backTrace
        const variates =  currentDebug.variate
        const output = currentDebug.output
        setTimeout(()=>{
          this.mainFun(backTrace,variates,output)   //调用主函数
        },0)
      }
    }
  },
  computed: {
    // finalShow(){//展开或者收缩变量都会触发这个computed ??? 所以改用watch ,computed的触发究竟和那些因素有关？
    //   const backTrace = this.currentDebug.backTrace
    //   const variates = this.currentDebug.variate
    //   const isNewGroup = this.isNextData(this.currentDebug.output)
    //   return this.computedFun(backTrace,variates,isNewGroup)
    // },
    ...mapGetters([
      "currentDebug",
    ]),
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
    }
    .el-tree-node{
      background-color: rgb(248,248,248);
    }
    .el-tree-node__children {
      font-size: 15px;
    }
  } 
  .variates-title {
    width:100%;
    text-align:center;
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
  .stack-top /deep/ {
    position: absolute;
    top: 0;
    width: 100%;
  }
  .stack-tree-title {
    transition: all 1s ease;
    background-color: rgb(51,153,102);
    color: white;
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
    transition: color 1s ease;
    color: red;
  }
</style>
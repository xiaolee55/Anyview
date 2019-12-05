<template>
  <div class="variates-pane" ref="varPane">
       <pane-header bgColor="info" title="变量与堆栈">
         <i class="el-icon-setting" title="设置堆栈数据的显示"></i>
        </pane-header>
      <transition @before-enter="containerBeforeEnter"
                @enter="containerEnter"
                @leave="containerLeave">
      <div class="stacks-container" v-if="showcontainer">
        <div class="stack-top" >
          <transition @before-enter="stackBeforeEnter"
                      @enter="stackEnter"
                      @leave="stackLeave">
          <el-tree :data= "finalShow.stackTop"
                    v-if= "showTop"
                    empty-text = ""
                    node-key = "id"
                    @node-expand= "nodeExpand"
                    @node-collapse= "nodeCollapse"
                    :default-expanded-keys= "expandedNodeList"
                    :render-after-expand= false
                    :props= "defaultProps">
            <span class="custom-tree-node" slot-scope="{ node,data }" :id="node.level==1?'stackName':''" v-change="node">
              <span v-for= "(item,index) in node.label" :key="item">
                <el-tooltip class="item" effect="light" :content= "getOldVal(data)" placement="right">
                  <span :class= "stackClass({index,item,node},'top')" :id="data.id">{{item}}</span>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </transition>
        </div>
        <div class="not-stack-top">
          <transition @before-leave="notTopBeforeLeave" @leave="notTopLeave">
            <el-tree :data= "finalShow.first"
                      v-if= "showNotTop"
                      empty-text = "" 
                      :props= "defaultProps">
              <span class="custom-tree-node" slot-scope="{ node}" :id="node.level==1?`stackName${node.id}`:''">
                <span v-for= "(item,index) in node.label" :key="item">
                  <span :class= "stackClass({index,item,node},'notTop')">{{item}}</span>
                </span>
              </span>
            </el-tree>
          </transition>
            <el-tree :data= "finalShow.other"
                      empty-text = "" 
                      :props= "defaultProps">
              <span class="custom-tree-node" slot-scope="{ node}" :id="node.level==1?`stackName${node.id}`:''" >
                <span v-for= "(item,index) in node.label" :key="item">
                  <span :class= "stackClass({index,item,node},'notTop')">{{item}}</span>
                </span>
              </span>
            </el-tree>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import log from 'common/js/log.js'
import  Velocity from 'velocity-animate'
import paneHeader from 'components/pane-header'

export default {
  directives: {
    change: {
      // 指令的定义
      update: function (el,binding,vnode) {
        const node = binding.value
        const changeObj = vnode.context.changeVarArr.find(element=>element.id==node.data.id)  //查找是否是变化对象
        const changeId = vnode.context.changeIdArr.find(item=>item==node.data.id)       //查找该DOM是否已经动画过
        if(changeObj&&!changeId){   //只有是变化对象且没有动画过过才发生动画
         vnode.context.changeIdArr.push(changeObj.id)
         vnode.context.setChangeDomAnimation(node)
        }
      }
    }
  },
  data () {
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
      changeVarArr: [],
      changeVarMap: {},
      expandedNodeList: [],
      cacheVarArr: [],
      finalShow: {},
      defaultProps: {
        children: 'varChild',
        label: 'varInfo'
      },  
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
    stackBeforeEnter(el){    //栈顶函数出现前
      el.style.opacity = 0
    },
    stackEnter(el, done){ //栈顶函数出现时的动画
      Velocity(el, {
        marginTop: 0,
        opacity: 1
      }, {
        duration: 700,
        complete: done
      })
    },
    stackLeave(el, done){ //栈顶函数的离开有两种情况，1.函数出栈，则慢慢淡去直至消失，2.新函数入栈，则向下移动至非栈顶区域
      if(this.pushStack==1){
        const stackHeight = 26
        const moveDistance = document.getElementsByClassName("stacks-container")[0].clientHeight - (this.oldStacks.length-1)*stackHeight-30
        Velocity(el, 'stop');
        el
        .velocity({height: 30,overflow:'hidden'}, {duration: 10})
        .velocity({marginTop: moveDistance}, { duration: 700,complete: done})
      }else if(this.pushStack==-1){
        el.velocity({opacity:0}, { duration: 700,complete: done})
      }
    },
    notTopBeforeLeave(el){   //非栈顶函数入栈前
    },
    notTopLeave(el,done){    //有函数出栈时，非栈顶元素的最上面的函数向上移动成为新栈顶
      const stackHeight = 26
      const bottom = document.getElementsByClassName("stacks-container")[0].clientHeight - (this.oldStacks.length-1)*stackHeight-30 
      Velocity(el, 'stop');
      el.velocity({marginBottom:bottom}, { duration: 700,complete: done})
    },
    getOldVal(data) {       //返回该变量变化之前的值
      const changeVar = this.changeVarArr.find(item=>item.id == data.id)
      this.cacheOldValue(changeVar)
      const val = this.changeVarMap[data.id]
      let oldVal = val ? val : "未变化"
      return `上一次的值：${oldVal}`
    },
    cacheOldValue(_var) {    //缓存变量本次的值，以供变量发生变化后查看上次的值
      if(!_var)
        return
      const arr = this.cacheVarArr
      this.changeVarMap[_var.id] = _var.oldVal
    },
    nodeExpand(data) {       //点击结点的展开图标
      this.createExpandElement(data.id); // 在节点展开是添加到默认展开数组
    },
    nodeCollapse(data) {           //点击结点的收缩图标
      this.removeExpandElement(data)
    },
    createExpandElement(element) {        //将传入结点加入默认展开结点的数组
      this.expandedNodeList.push(element);
    },
    removeExpandElement(element) {          //将传入结点从展开结点的数组移除
      this.expandedNodeList=this.expandedNodeList.filter(item=>item!=element.id) // 收起时删除数组里对应选项
      if(element.varChild){
        element.varChild.forEach((item,index)=>{
          this.removeExpandElement(element.varChild[index])
        })   
      }
    },
    clearExpandList(id){    //清空展开结点的数组
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
       return this.setStackVarsClass({flag,ifChange,index,item,node})
     }
    },
    setStackNameBaseClass({el,backgroundColor,color}) {  //设置函数名的基础样式
      el.style.backgroundColor = backgroundColor
      el.style.color = color
      el.style.fontSize = "17px"
    },
    setStackNameClass(flag){    //设置函数名的不同样式
      return flag=='top' ? 'stack-top-var-name' : 'not-stack-top-var-name'
    },
    setStackVarsClass({flag,ifChange,index,item,node}) {   //设置函数栈中变量的样式
      let varClass
      if(ifChange&&flag=="top"){   //刚发生变化的变量
        // this.setChangeDomAnimation(node)
        varClass ="change-var"
      }else if(index==0){ //普通变量名
        varClass = 'var-name'
      }else if(item.charAt(0)==0&&item[1]=="x"){  //变量值为指针
        varClass = 'point-val' 
      }else{   //普通变量值

      }
      return varClass
    },
    setChangeDomAnimation(node) {        //设置变化结点的动画
      this.$nextTick(()=>{
        const changeId = this.setChangeDomId(node)
        this.changeDom = document.getElementById(changeId).parentNode.parentNode.parentNode
        this.changeDom.velocity({backgroundColor:'#F56C6C'}, { duration: 500})
                      .velocity({backgroundColor:'#f8f8f8'}, { duration: 500})
      })
    },
    setChangeDomId(node) {   //获取应该变化的结点的ID
      if(node.level>1){   //在结点为非函数名的前提下，如果结点的父节点是展开的且该结点是收缩的或者他本身就是变化的结点，则高亮该结点
        if((node.expanded==false||this.changeIdArr.includes(node.data.id))&&node.parent.expanded==true){
          return node.data.id
        }
        else
          return this.setChangeDomId(node.parent)
      }
    },
    isNextData(output) {     //判断本次调试是否是一组新的数据
      if(output.includes("<br>========RIGHT========<br>")||output.includes("<br>--------ERROR--------<br>"))
        return true
      return false
    },
    formatVariates(variates) {        //格式化变量名，将字符串变为数组用以高亮
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
    findChangeVar(newVars,oldVars) {    //寻找发生变化的变量
      newVars = Array.isArray(newVars) ? newVars : [newVars]
      oldVars = Array.isArray(oldVars) ? oldVars : [oldVars]
      newVars.forEach(item=>{
        this.compareVal(item,oldVars)
      })
    },
    compareVal(newItem,oldVars){     //根据新变量的ID和对应旧变量对比
      for(let item of oldVars){
        if(item.id==newItem.id){
          const newVal = newItem.varInfo[2]
          const oldVal = item.varInfo[2]
          if(newVal!=oldVal){
            this.setChangeVar(item.id,newVal,oldVal)  //将发生变化的变量加入数组为动画做准备
            this.removeExpandElement(item)  //该值发生变化时要将其展开的树收起来
          }else{
            if(newItem.varChild)
              this.findChangeVar(newItem.varChild,item.varChild)
          }
          break;    //只要找到对应的变量，不管值有无发生变化，都应终止继续查询（如果有子元素会查询子元素）
        }
      }
    },
    setChangeVar(id,newVal,oldVal){   //收集在本次调试中发生了变化的变量
      if(!this.changeVarArr.includes(id))
        this.changeVarArr.push({id,newVal,oldVal})
      this.setChangeVarsArr({id,newVal,oldVal})  //提交mutation
    },
    clearChangeVar() {      //清空收集变化变量的数组
      this.changeVarArr = []   //这个变量是标志每点击一次调试的变化变量的ID
      this.setChangeVarsArr()   //提交mutation，清空vuex中对应的值
      this.changeIdArr = []     //这个标识该变量是否已进行动画过，因为会有多次对比
    },
    setStackTop(stacks,backTrace) {   //设置栈顶
      const stackTop = {}
      stackTop.varInfo = stacks[0].name
      stackTop.sign = backTrace[0]
      stackTop.id = backTrace[0]
      stackTop.varChild = stacks[0].variates
      this.createExpandElement(stackTop.id)
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
    setOldStacks(newStacks){    //设置旧函数栈
      this.oldStacks = newStacks
    },
    setOldVariates(variates){   //设置旧变量
      this.oldVariates = variates
    },
    resetChangeVarMap(flag){  //重置保存变化变量的集合
      flag?this.changeVarMap = {}:''
    },
    setFinalShow(val){   //设置最终用以展示的堆栈数据
      this.finalShow = val
    },
    setAnimation(newLen,oldLen,isNewGroup) {   //控制全部动画的总开关
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
    setPushStack(newLen,oldLen){      //判断本次调试的行为是函数入栈，函数出栈或者是没有出入栈
      if(newLen>oldLen)
        this.pushStack=1
      else if(newLen==oldLen)
        this.pushStack=0
      else
        this.pushStack=-1
    },
    mainFun(backTrace,variates,output) {    //主入口函数
      this.clearChangeVar()   //清空上次发生变化的变量的缓存，防止影响下次变化
      const isNewGroup = this.isNextData(output)    //判断是否是新的一组调试数据
      const stackTopVariates = this.formatVariates(variates)  //格式化栈顶函数的变量
      const stacksName = this.formatStacksName(backTrace)     //格式化所有函数的函数名
      this.resetChangeVarMap(isNewGroup)    //重置保存变量旧值的对象
      const newStacks = this.setNewStacks(stacksName,this.oldStacks,stackTopVariates,isNewGroup)  //设置新的函数栈
      const stackTop = this.setStackTop(newStacks,backTrace)  //设置最终的栈顶函数
      const notStackTop = this.setNotStackTop(newStacks,backTrace)    //设置最终的非栈顶函数
      const first = notStackTop.length?[notStackTop[0]]:[]
      const other = notStackTop.filter((_,index)=>index!=0)
      this.setPushStack(newStacks.length,this.oldStacks.length)
      this.setAnimation(newStacks.length,this.oldStacks.length,isNewGroup).then(()=>{
        this.setOldVariates(variates)   //设置旧栈顶函数变量（未经格式化的）
        this.setOldStacks(newStacks)    //设置旧函数栈
        this.setFinalShow({stackTop,first,other})   //设置最终用于展示的值
      })
    },
    ...mapMutations({
      setChangeVarsArr :"SET_CHANGE_VARS_ARR",
    })  
  },
  watch: {
    'currentDebug.backTrace': {
      immediate: true,    //使用了immediate后handler函数会在created钩子函数之前执行，此时methods还未生成
      deep: true,     //深度监听currentDebug的所有属性
      handler(backTrace){  //这里使用箭头函数的话使用this是不能访问到组件实例的,因为箭头函数绑定的是父级作用域的上下文，而匿名函数是指向全局
        //这里监听backTrace而不是currentDebug是为了防止watch面板的变量和variate面板相互干扰
        const currentDebug = this.currentDebug
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
    //猜测：每次展开或者收缩会触发computed的原因是这组动作会重新渲染这个computed，所以会重新调用它，而并不是其依赖值发生了改变
    //   const backTrace = this.currentDebug.backTrace
    //   const variates = this.currentDebug.variate
    //   const isNewGroup = this.isNextData(this.currentDebug.output)
    //   return this.computedFun(backTrace,variates,isNewGroup)
    // },
    ...mapGetters([
      "currentDebug",
    ]),
  },
  components: {
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
  .stack-tree-title {
    transition: all 1s ease;
    background-color: rgb(51,153,102);
    color: white;
    width: 100%;
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
<template>
<!-- 当前活跃函数 -->
  <div class="stack-top" >
    <transition @before-enter= "stackBeforeEnter"
                @enter= "stackEnter"
                @leave= "stackLeave">
      <el-tree :data= "stackTop"
                empty-text = ""
                node-key = "id"
                @node-expand= "nodeExpand"
                @node-collapse= "nodeCollapse"
                :default-expanded-keys= "expandedNodeList"
                :render-after-expand= false
                :props= "defaultProps">
        <span 
          class="custom-tree-node" 
          :class="{'tree-title-class': node.level==1}" 
          slot-scope="{ node,data }" 
          :id= "node.level==1?'stackName':''" 
          v-change="node">
          <span 
            v-for= "(item,index) in node.label" 
            :key= "item">
              <el-tooltip 
                class="item" 
                effect="light" 
                placement="right" 
                close-delay="0"
                :content= "getOldVal(data.id)">
                <span 
                  :id= "data.id" 
                  :class= "stackClass({index,item,node})">{{item}}</span>
              </el-tooltip>
          </span>
        </span>
      </el-tree>
    </transition>
  </div>
</template>

<script>
import minxin from './mixin'

export default {
  mixins: [minxin],
  updated() {
    this.oldStackTop = this.stackTop
    // console.log("oldStackTop",this.oldStackTop)
  },
  directives: {
    change: {
      // 指令的定义
      // update: function (el,binding,vnode) {
      //   const node = binding.value
      //   const changeObj = vnode.context.changeVarArr.find(element=>element.id==node.data.id)  //查找是否是变化对象
      //   const changeId = vnode.context.changeIdArr.find(item=>item==node.data.id)       //查找该DOM是否已经动画过
      //   if(changeObj&&!changeId){   //只有是变化对象且没有动画过过才发生动画
      //    vnode.context.changeIdArr.push(changeObj.id)
      //    vnode.context.setChangeDomAnimation(node)
      //   }
      // }
    }
  },
  props:{
    stackTop:{
      type: Array,
      default: ()=>[]
    },
    diff: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expandedNodeList: [],
      changeVarArr: [],
      changeVarMap: {},
    }
  },
  methods: {
    /*函数整体入栈的动画*/
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

    stackClass({index,item,node}) {  //设置样式
      const {level} = node
      if(level == 1&&index%2!=0) {   //函数名里面的变量
        return "fun-var-name"
      }else if(level!=1&&index==0){  //变量名
        return "var-name"
      }else if(item.slice(0,2)=="0x") { //指针类型变量
        return "point-val"
      }
    },

    /*结点动画相关逻辑*/
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
    /*缓存旧函数栈相关函数 */
    getOldVal(id) {       //获取该变量变化之前的值
      const changeVar = this.changeVarMap[id]
      let newVal
      let oldVal
      if(changeVar){
        newVal = changeVar.newVal
        oldVal = changeVar.oldVal 
      }
      let value = newVal ===oldVal ?  "未变化" : oldVal
      return `上一次的值：${value}`
    },
    cacheOldValue(_var) {    //缓存变量本次的值，以供变量发生变化后查看上次的值
      if(!_var)
        return
      const arr = this.cacheVarArr
      this.changeVarMap[_var.id] = _var.oldVal
    },
    clearChangeVar() {      //清空收集变化变量的数组
      this.changeVarArr = []   //这个变量是标志每点击一次调试的变化变量的ID
      this.setChangeVarsArr()   //提交mutation，清空vuex中对应的值
      this.changeIdArr = []     //这个标识该变量是否已进行动画过，因为会有多次对比
    },
    resetChangeVarMap(flag){  //重置保存变化变量的集合
      flag?this.changeVarMap = {}:''
    },

    /*做diff，处理变化变量的逻辑 */
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
            // this.removeExpandElement(item)  //该值发生变化时要将其展开的树收起来
          }else{
            if(newItem.varChild)
              this.findChangeVar(newItem.varChild,item.varChild)
          }
          break;    //只要找到对应的变量，不管值有无发生变化，都应终止继续查询（如果有子元素会查询子元素）
        }
      }
    },
    setChangeVar(id,newVal,oldVal){   //收集在本次调试中发生了变化的变量
      this.changeVarMap[id]={newVal,oldVal}
      this.$nextTick(()=>{
         document.getElementById(id).parentNode.parentNode.classList.add("change-var")
      })
      // !this.changeVarArr.includes(id)&&this.changeVarArr.push({id,newVal,oldVal})
      // this.setChangeVarsArr({id,newVal,oldVal})  //提交mutation
    },
    /*树展开收缩相关的逻辑*/
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
      id&&(this.expandedNodeList=[])
    },
  },
  watch: {
    diff(val){
      val&&this.findChangeVar(this.stackTop,this.oldStackTop) //只有栈中的函数数量不变化才需要查找变化的变量
    },
    stackTop:{
      handler(val){
        val.length&&this.expandedNodeList.push(val[0].id);
        console.log("子组件拿到值",val)
      },
      deep: true,
      immediate: true
    }
  },
}
</script>

<style lang="scss" scoped>
  .tree-title-class{
    background-color: rgb(51,153,102);
    display: inline-block;
    height: 30px;
    width: 100%;
    padding: 0 10px;
    line-height: 30px;
    color: white;
    font-size: 17px;
    border: 1px solid #d9ecff;
  }
  .fun-var-name {
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
    color: red!important;
  }
</style>
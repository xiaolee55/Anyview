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
                :props= "defaultProps"
                 v-if= "showTop">
        <span 
          class="custom-tree-node" 
          :class="{'tree-title-class': node.level==1}" 
          slot-scope="{ node,data }" 
          :id= "node.level==1?'stackName':''" 
          v-change= "node">
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
  directives: {
    change: {
      // 指令的定义
      update: function (el,binding,vnode) {  //用来产生在直接可视结点的背景动画
        const node = binding.value
        const id = Object.keys(vnode.context.changeVarMap).find(id=>id==node.data.id)  //查找是否为变化的结点
        const animateId= vnode.context.animateIdArr.find(item=>item==node.data.id)       //看是否已经进行过动画
        if(id&&!animateId){   //只有是变化对象且没有动画过过才发生动画
         vnode.context.animateIdArr.push(id)
         vnode.context.setChangeDomAnimation(node)  //动画（冒泡递归，红色背景动画）
        }
      }
    }
  },
  mixins: [minxin],
  updated() {
    this.oldStackTop = this.stackTop
  },
  props:{
    stackTop:{
      type: Array,
      default: ()=>[]
    },
    diff: {
      type: Boolean,
      default: false
    },
    showTop: {
      type: Boolean,
      default: true   
    },
    pushStack:{
      type: Number,
      default: 0      
    },
    oldLen: {
      type: Number,
      default: 0
    },
    clearSign: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expandedNodeList: [],
      changeVarMap: {},   //存储所有本次操作变化的值
      copyVarMap: {},
      animateIdArr:[]   //因为自定义指令会被多次触发，这个数组是用来在动画触发一次后屏蔽掉后面的触发
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
        const moveDistance = document.getElementsByClassName("stacks-container")[0].clientHeight - (this.oldLen-1)*stackHeight-30
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
      const changeVar = this.copyVarMap[id]
      let newVal
      let oldVal
      if(changeVar){
        newVal = changeVar.newVal
        oldVal = changeVar.oldVal 
      }
      let value = newVal ===oldVal ?  "未变化" : oldVal
      return `上一次的值：${value}`
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
          //移除上次发生变化的变量的高亮显示（红色）  
          this.restoreClass(item.id)
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
      this.copyVarMap[id] = {newVal,oldVal}
      this.setChangeVarsArr({id,newVal,oldVal})  //提交vuex，用于监视变量模块的动画
      this.$nextTick(()=>{
         document.getElementById(id).parentNode.parentNode.classList.add("change-var")
         document.getElementById(id).classList.add("change-var")
      })
    },
    restoreClass(id){
      this.$nextTick(()=>{
        const domClass = Array.from(document.getElementById(id).classList)||[]
        if(domClass.includes("change-var")){
          document.getElementById(id).parentNode.parentNode.classList.remove("change-var")
          document.getElementById(id).classList.remove("change-var")    
        }
      })
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
    //如果下一步的操作还在本函数中，那么只清空记录已经动画的id数组，清空用于标识动画的对象，清空vuex中的记录防止影响watch面板
    //如果下一步的操作进行了切换函数的操作，那么一同清空用于展示旧变量的对象，和已展开变量的对象
    clearCache() {
      this.animateIdArr=[]    
      this.changeVarMap={}
      this.setChangeVarsArr()
      if(this.pushStack){
        this.copyVarMap = {}
        //将展开的树形结构收回来
        this.expandedNodeList=[]
      }
    },
  },
  watch: {
    diff(val){
      val&&this.findChangeVar(this.stackTop,this.oldStackTop)//只有栈中的函数数量不变化才需要查找变化的变量
      this.$emit('update:diff', false)  //将diff置为false，防止下次变化时diff的watch无法触发
    },
    stackTop:{
      handler(val){
        val.length&&this.expandedNodeList.push(val[0].id);
      },
      deep: true,
      immediate: true
    },
  },
}
</script>

<style lang="scss" scoped>
  .stack-top {    //防止子元素设置margin-top影响父元素
    height: 100%;
    border: 0.1px white solid; 
  }
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
    transition: color 1s;
    color: red!important;
  }
</style>
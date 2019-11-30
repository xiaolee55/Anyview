<template>
  <div class="watch-pane">
    <div>
      <el-tag type="info" effect="dark" class="watch-title">
        <b>变量监视</b>
        <i class="el-icon-plus var-add" @click="showSearch" v-if="addIcon" title="增加变量"></i>
        <i class="el-icon-minus var-add" @click="hideSearch" v-if="!addIcon" title="删除变量"></i>
        <i class="el-icon-question" title="单击“+”号或双击空白处可跟踪想观察的变量或表达式"></i>
    </el-tag>
    </div>
    <div @dblclick="showSearch" class="var-container">
      <el-tree :data= "finalTree"
          v-if="finalTree.length"
          :props="defaultProps"
          empty-text = ""
          node-key = "sign"
          @node-expand= "nodeExpand"
          @node-collapse= "nodeCollapse"
          :render-after-expand= false
          :default-expanded-keys= "expandedNodeList">
        <span class="custom-tree-node" 
              slot-scope="{ node, data}" 
              :class="{'tree-title-class': node.level==1}" 
              @dblclick.stop= "existVarInput(data.sign)"
              style="position:relative">
          <el-tag contenteditable="true" 
                  v-if= "showexistVarInput==data.sign"
                  @blur.native= "changeVariate(data.sign)"  
                  @input.native= "varInput($event)" 
                  @keyup.enter.native= "changeVariate(data.sign)"
                  style="z-index:100;position:absolute;top:0;left:0;width:100%"
                  ref="existVarInput"
                  >
          </el-tag> 
          <i class="el-icon-minus expand-icon" v-if= "!node.childNodes.length"></i>
          <i class="el-icon-caret-right expand-icon" v-else-if= "!expandedNodeList.includes(data.sign)"></i>
          <i class="el-icon-caret-bottom expand-icon" v-else></i>
          <span v-for="(item,index) in node.label" :key= "item">
            <span :class="varClass(index,item,node)">{{item}}</span>
          </span>
          <i class="el-icon-remove-outline var-delete-icon" v-if="node.level==1" @click= "removeVariate(node,data.sign)"></i>
        </span>
      </el-tree> 
        <el-tag contenteditable="true"
              v-if= "showInput"  
              @blur.native= "addVariate"  
              @input.native= "varInput($event)" 
              style= "width:50%"
              ref="tagInput"
              @keyup.enter.native="addVariate">
      </el-tag>
    </div>
  </div>
</template>

<script>
import * as fun from '@/api/coding'
import * as types from '@/api/config'
import {mapGetters,mapMutations,mapActions} from 'vuex'

export default {
  directives: {
    "focus" : function(el,binding) {
      if(binding){
        el.focus()
      }
    }
  },
  data () {
    return {
      focus: false,
      editable: false,
      showexistVarInput: '',
      variateInput: "",
      showInput: false,
      addIcon: true,
      changeKey: [],
      inputOrderArr: [],
      status: true,
      expandedNodeList: [],
      defaultProps: {
        children: 'varChild',
        label: 'varInfo'
      },
    }
  },
  methods: {
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
    nodeExpand(data) {
      this.expandedNodeList.push(data.sign); // 在节点展开是添加到默认展开数组
    },
    nodeCollapse(data) {
      this.expandedNodeList=this.expandedNodeList.filter(item=>item!=data.sign) // 收起时删除数组里对应选项
      if(data.varChild){
        data.varChild.forEach((item,index)=>{
          this.nodeCollapse(data.varChild[index])
        })   
      }
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
    clearChangeVar() {      //清空收集变化变量的数组
      this.changeVarArr = []   //这个变量是标志每点击一次调试的变化变量的ID
      this.changeIdArr = []     //这个标识该变量是否已进行动画过，因为会有多次对比
    },
    varClass(index,item,node) {
      return index==0 ? 'var-name': item.charAt(0)==0&&item[1]=="x" ? 'point-val' : ''
    },
    changeContenteditable(e) {    //双击当前变量修改为可输入
      this.editable=true
      this.focus = true
    },
    removeVariate(_,varName) {             //点击减号时移除当前变量
      if(!this.status)
        return
      this.inputOrderArr=this.inputOrderArr.filter((item=>item!=varName))
      this.expandedNodeList=this.expandedNodeList.filter(item=>item!=varName)
      const content = {addPoints: "",delPoints: varName}
      fun.getWatchPointMsg(content).then(e => {
        this.status = false
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
          const index = this.currentIndex
          const _obj = {watchPoint: e.content }
          this.setDebugData({index,_obj})
          this.status = true
        }
      })
    },
    varInput(e) {               //输入变量
      this.variateInput = e.target.innerText
    },
    existVarInput(sign) {
      setTimeout(()=>{
         this.$refs.existVarInput.$el.focus()
      })
      this.showexistVarInput = sign
    },
    showSearch() {                  //双击空白处或者点击加号出现一个新框
      if(this.showexistVarInput)    //覆盖变量的输入框不能与新输入框同时出现
        return
      this.autoFocus()
      this.addIcon = false
      this.showInput = true
    },
    autoFocus(){
      setTimeout(()=>{
        this.$refs.tagInput.$el.focus() //给输入框自动聚焦
      })
    },
    hideSearch() {                  //添加变量成功或者点击大减号移除输入框
      this.addIcon = true
      this.showInput = false
    },
    addVariate() {                  //添加一个变量
      const variateName = this.variateInput.replace(/\s*/g,"")   //过滤掉输入字符的空格
      this.variateInput = ""
      if(!variateName)      //空变量直接过滤，要先做这个判断再做状态判断，否则在空白状态下status置为空则导致接下来程序无法运行
       return 
      if(!this.status)
        return
      this.status = false
      if(!this.inputOrderArr.find((item)=>variateName==item)){
        this.inputOrderArr.push(variateName)
      }
      const content = {addPoints: variateName,delPoints:""}
      fun.getWatchPointMsg(content).then(e => {
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
          this.hideSearch()     //隐藏输入框
          console.log("watch面板数据",e)
          const index = this.currentIndex
          const _obj = {watchPoint: e.content }
          this.setDebugData({index,_obj})
          this.status = true
        }
      })
    },
    changeVariate(variate){
      const input = this.variateInput.replace(/[\r\n]/g,"")
      if(!input){
        this.showexistVarInput = false
        return
      }
      //将该变量替换成新输入的值
      var index = this.inputOrderArr.findIndex(item=>item==variate) 
      this.inputOrderArr[index] = input
      const content = {addPoints: input,delPoints: variate}
      fun.getWatchPointMsg(content).then(e => {
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
          console.log("修改的watch变量",e)
          this.showexistVarInput=''
          const index = this.currentIndex
          const _obj = {watchPoint: e.content }
          this.setDebugData({index,_obj})
        }
      })
    },
    ...mapMutations({
      setCurrentIndex: "SET_CURRENT_INDEX",
      setCurrentQuestion: 'SET_CURRENT_QUESTION',
      setOpenQuestions: "SET_OPEN_QUESTIONS",
      setOutputData :"SET_OUTPUT_DATA",
      setDebugData: "SET_DEBUG_DATA"
    })
  },
  // watch: {
  //   'currentDebug.backTrace': {
  //     deep: true,     //深度监听currentDebug的所有属性
  //     handler(backTrace){  //这里使用箭头函数的话使用this是不能访问到组件实例的,因为箭头函数绑定的是父级作用域的上下文，而匿名函数是指向全局
  //       //这里监听backTrace而不是currentDebug是为了防止watch面板的变量和variate面板相互干扰
  //       const currentDebug = this.currentDebug
  //       const variates =  currentDebug.variate
  //       setTimeout(()=>{
  //         // this.findChangeVar(this.finalTree,this.oldVariates)
  //       },0)
  //     }
  //   }
  // },
  computed: {
    finalTree() {
      let watchPointMap = this.currentDebug.watchPoint
      const inputOrderArr = this.inputOrderArr
      const watchPointArr=[]
      let finalArr = []
      Object.keys(watchPointMap).forEach((key)=>{   //将后端传来的Map结构转为数组结构，供format函数使用
        let item = watchPointMap[key]
        if(item == "未找到")
          item = {name:key,value:"未找到",type:""}
        watchPointArr.push(item)
      })
      let judegeInWatchPoint = (name,arr)=>{  //如果是输入变量则不对其结构做调整
        if(arr.includes(name))
          return true
        return false
      }
      let format = (variate)=> {
        variate = Array.isArray(variate) ? variate : [variate]
        let tempArr = []
        variate.forEach((item,index)=>{
          let obj = {}
          obj.sign = item.name
          obj.id = item.name
          let formatName = item.name
          if(!judegeInWatchPoint(item.name,inputOrderArr))
            formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
          obj.varInfo = [formatName,": ",item.value]
          if(item.innerObj) 
            obj.varChild = format(item.innerObj)
          tempArr.push(obj)
        })
        return tempArr
      }
      let disOrderArr = format(watchPointArr)   //格式化变量
      inputOrderArr.forEach((key)=>{    //按用户输入顺序排序变量
        const tree = disOrderArr.find(item=>item.sign==key)
        if(tree)
          finalArr.push(disOrderArr.find(item=>item.sign==key))
      })
      return finalArr
    },
    debugStatus() {
      return this.currentQuestion.debugStatus
    },
    ...mapGetters([
      "currentIndex",
      "currentQuestion",
      "currentDebug",
      "openQuestionsArr",
      "changeVarsArr"
    ])
  },
  
  }
</script>

<style lang="scss" scoped>
  .watch-pane /deep/{
    height: 100%;
    font-family: "Courier New";
    .el-tree-node{
      font-size: 15px;
      margin-bottom: 10px;
      background-color: rgb(248,248,248);
    }
    .el-tree-node__expand-icon {
      display: none!important;
    }
  }
  .watch-title {
    width:100%;
    position:relative;
    text-align:center;
  }
  .var-container {
    height: calc(100% - 32px);
    overflow: auto;
  }
  .var-tag {
    display:block;
    position:relative;
    font-size: 16px;
    font-family: "Times New Roman";
  }
  .var-add {
    position: absolute;
    right: 10px;
    font-size: 15px;
    line-height: 30px;
    cursor: pointer;
  }
  .var-name {
    color: rgb(112,48,160);
  }
  .point-val {
    color: rgb(127, 127, 127)
  }
  .tree-title-class {
    position: relative;
    background-color: #ecf5ff;
    display: inline-block;
    height: 30px;
    width: 100%;
    padding: 0 10px;
    line-height: 30px;
    color: #409eff;
    font-size: 17px;
    border: 1px solid #d9ecff;
  }
  .var-delete-icon {
    position: absolute;
    right: 20px;
    line-height: 30px;
    z-index: 10;
  }
  .expand-icon {
    color: grey;
    line-height: 30px;
    font-size: 16px;
  }
</style>
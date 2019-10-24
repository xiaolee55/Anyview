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
          :default-expanded-keys= "expandedNodeList">
        <span class="custom-tree-node" slot-scope="{ node, data}" :class="{'tree-title-class': node.level==1}">
          <i class="el-icon-minus expand-icon" v-if= "!node.childNodes.length"></i>
          <i class="el-icon-caret-right expand-icon" v-else-if= "!expandedNodeList.includes(data.sign)"></i>
          <i class="el-icon-caret-bottom expand-icon" v-else></i>
          <span v-for="(item,index) in node.label" :key="item">
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
      variateInput: "",
      showInput: false,
      addIcon: true,
      changeKey: [],
      inputOrderArr: [],
      oldVariatesMap: {},
      oldVariate: "",
      status: true,
      expandedNodeList: [],
      defaultProps: {
        children: 'varChild',
        label: 'varInfo'
      },
    }
  },
  methods: {
    nodeExpand(data,node,component) {
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
      console.log("输入的变量",e)
      this.variateInput = e.target.innerText
    },
    showSearch() {                  //双击空白处或者点击加号出现一个新框
      this.addIcon = false
      this.showInput = true
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
    ...mapMutations({
      setCurrentIndex: "SET_CURRENT_INDEX",
      setCurrentQuestion: 'SET_CURRENT_QUESTION',
      setOpenQuestions: "SET_OPEN_QUESTIONS",
      setOutputData :"SET_OUTPUT_DATA",
      setDebugData: "SET_DEBUG_DATA"
    })
  },
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
      "openQuestionsArr"
    ]),
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
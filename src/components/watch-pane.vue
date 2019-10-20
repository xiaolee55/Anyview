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
    <div v-for="item in finalVariates" :key= "item.name" >
      <el-tag 
            :contenteditable= "editable"
            class="var-tag"
            @blur.native= "editable=false"
            @input= "varInput($event)" 
            @dblclick.stop.native.prevent= "changeContenteditable">
      <span >{{ `${item.name}:   ${item.val}` }}</span>
      <i class="el-icon-remove var-add" @click.stop= "removeVariate(item.name)" :title= "`删除变量${item.name}`"></i>
    </el-tag>
    <el-tree :data= "item.desc"
        :props="defaultProps" 
        :default-expand-all="false">
      <span class="custom-tree-node" slot-scope="{ node }">
        <span v-for="(item,index) in node.label" :key="item" >
          <span :class="varClass(index,item)">{{item}}</span>
        </span>
      </span>
    </el-tree>
  </div>
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
      plainVarArr: [],
      oldVariatesMap: {},
      oldVariate: "",
      status: true,
      removeVar: '',
      defaultProps: {
        children: 'varChild',
        label: 'varInfo'
      },
    }
  },
  methods: {
    varClass(index,item) {
      return index==0 ? 'var-name': item.charAt(0)==0&&item[1]=="x" ? 'point-val' : ''
    },
    changeContenteditable(e) {    //双击当前变量修改为可输入
      this.editable=true
      this.focus = true
    },
    removeVariate(varName) {             //点击减号时移除当前变量
      this.removeVar = varName
      const content = {addPoints: "",delPoints: varName}
      fun.getWatchPointMsg(content).then(e => {
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
          const index = this.currentIndex
          const _obj = {watchPoint: e.content }
          this.setDebugData({index,_obj})
        }
      })
    },
    varInput(e) {               //输入变量
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
      if(!this.status)
        return
      this.status = false
      const variateName = this.variateInput.replace(/\s*/g,"")   //过滤掉输入字符的空格
      if(!variateName)      //空变量直接过滤
       return 
      this.hideSearch()     //隐藏输入框
      if(!this.plainVarArr.find((item)=>variateName==item.name)){
        this.plainVarArr.push({name:variateName,val:''})
      }
      const content = {addPoints: variateName,delPoints:""}
      fun.getWatchPointMsg(content).then(e => {
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
          console.log("watch面板数据",e)
          this.status = true
          const index = this.currentIndex
          const _obj = {watchPoint: e.content }
          this.setDebugData({index,_obj})
        }
      })
    },
    variatesTitle(watchPoint) {
      const oldMap = this.oldVariatesMap
      const newMap = watchPoint
      if(this.removeVar){
        this.plainVarArr=this.plainVarArr.filter(_item=>_item.name!=this.removeVar)
        this.removeVar = ""
        return
      }
      for(let key in oldMap){
        if(oldMap[key]&&newMap[key]&&oldMap[key] != newMap[key]){ //发生变化的变量
          this.changeKey.push(key)
          setTimeout(() => {
              this.changeKey.pop()
            }, 1000);
        }
      }
      this.plainVarArr.forEach((item,i)=>{   //让值按顺序显示
        if(newMap[item.name]&&newMap[item.name]!="未找到"){
         this.plainVarArr[i].val = newMap[item.name].value
        }
        else if(newMap[item.name]&&newMap[item.name]=="未找到"){
          this.plainVarArr[i].val = "未找到"
        }
      })
      this.oldVariatesMap = watchPoint
      return this.plainVarArr
    },
    variatesDesc(watchPoint) {
      const newArr = []
      let firstDeep = true
      for(let key in watchPoint){
        if(watchPoint[key]=="未找到"){
          let temp = {}
          temp.name = key
          temp.value = "未找到"
          temp.type = "无"
          watchPoint[key] = temp
        }
        newArr.push(watchPoint[key])
      }
      let format = (variate,firstDeep)=> {
        variate = Array.isArray(variate) ? variate : [variate]
        let tempArr = []
        variate.forEach((item,index)=>{
          let obj = {}
          let formatName
          (!firstDeep)
            ?formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
            :formatName = item.name
          obj.varInfo = [formatName,": ",item.value]
          if(item.innerObj) 
            obj.varChild = format(item.innerObj,false)
          tempArr.push(obj)
        })
        return tempArr
      }
      let variate = newArr
      let render =  variate ? format(variate,firstDeep) : []
      return render 
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
    finalVariates() {
        const watchPoint = this.currentDebug.watchPoint   //用于开启监听
        const title = this.variatesTitle(watchPoint)
        const desc = this.variatesDesc(watchPoint)
        const final = []
        const merge = (name)=>{
          for (let i = 0; i < desc.length; i++) {
            if(desc[i].varInfo[0]==name)
              return [desc[i]]
            }
          return []
        }
        title.forEach((item,index)=>{
          final.push({name:item.name,val:item.val,desc:merge(item.name)})
        })
        return final
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
      font-size: 14px;
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
  .change-tag {
    transition: all 1s;
    background-color: blue;
  }
  .var-name {
    color: rgb(112,48,160);
  }
  .point-val {
    color: rgb(127, 127, 127)
  }
</style>
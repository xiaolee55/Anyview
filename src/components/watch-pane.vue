<template>
  <div class="watch-pane">
    <div>
      <el-tag type="info" effect="dark" class="watch-title">
        <b>变量监视</b>
        <i class="el-icon-plus var-add" @click="showSearch" v-if="addIcon" title="增加变量"></i>
        <i class="el-icon-minus var-add" @click="hideSearch" v-if="!addIcon" title="删除变量"></i>
    </el-tag>
  </div>
  <div @dblclick="showSearch" style="flex:1">
      <el-tag v-for="(val,key) in variatesMap"
              :key= "key" 
              :contenteditable= "editable"
              v-focus= "focus"
              :class="{'change-tag' : changeKey.includes(key)}"
              class="var-tag"
              @blur.native= "editable=false"
              @input= "varInput($event)" 
              @dblclick.stop.native.prevent= "changeContenteditable">
        <span >{{ `${key}:   ${val}` }}</span>
        <i class="el-icon-remove var-add" @click.stop= "removeVariate(key)" :title= "`删除变量${key}`"></i>
      </el-tag>
    <el-tag contenteditable="true" v-if= "showInput"  @blur.native= "addVariate"  @input.native= "varInput($event)" style= "width:50%"></el-tag>
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
      oldVariatesMap: {}
    }
  },
  methods: {
    changeContenteditable(e) {    //双击当前变量修改为可输入
      this.editable=true
      this.focus = true
    },
    removeVariate(varName) {             //点击减号时移除当前变量
      const content = {addPoints: "",delPoints: varName}
      fun.getWatchPointMsg(content).then(e => {
        console.log(e);
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
      const variateName = this.variateInput.replace(/\s*/g,"")   //过滤掉输入字符的空格
      if(!variateName)      //重名或者空变量直接过滤
       return 
      this.hideSearch()     //隐藏输入框
      const content = {addPoints: variateName,delPoints:""}
      fun.getWatchPointMsg(content).then(e => {
        if(e.type == types.SET_POINT_SUCCESS_TYPE){
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
  computed: {
    debugStatus() {
      return this.currentQuestion.debugStatus
    },
    variatesMap() {
      if(!this.currentDebug.watchPoint)
        return {}
      const oldMap = this.oldVariatesMap
      const newMap = this.currentDebug.watchPoint
      for(let key in oldMap)
        if(oldMap[key]&&newMap[key]&&oldMap[key] != newMap[key]){
          this.changeKey.push(key)
          setTimeout(() => {
            this.changeKey.pop()
          }, 1000);
        }
      this.oldVariatesMap = this.currentDebug.watchPoint
      return newMap 
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
  .watch-pane {
    display:flex;
    flex-flow: column;
    height: 100%;
  }
  .watch-title {
    width:100%;
    position:relative;
    text-align:center;
  }
  .var-tag {
    display:block;
    position:relative;
  }
  .var-add {
    position: absolute;
    right: 10px;
    font-size: 15px;
    line-height: 30px;
    cursor: pointer;
  }
  .change-tag {
    animation: varchange 1s infinite;
    animation-iteration-count:1;
  }
  @keyframes varchange
  {
    from {
      background-color: #0052d9;
      color: white;
    }
    to {
      background-color: #ecf5ff;
      color: #409eff;
    }
  }

</style>
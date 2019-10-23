<template>
  <div>
    <el-card class="debug-menu" v-if="debugStatus" draggable="true">
      <span class="debug-title"><i class="iconfont icon-_tiaoshi" title="调试栏"></i></span>
      <ul style="display:inline-block">
        <li><i class="iconfont icon-xiayibu clickIcon" title="下一步(进入函数)(F11)" @click= "stepInto"></i></li>
        <li><i class="iconfont icon-xiayihang clickIcon" title="下一步(不进入函数)(F10)" @click= "stepOver"></i></li>
        <li><i class="iconfont icon-jixutiaoshi clickIcon" title="继续调试(F9)" @click= "continueDebug"></i></li>
        <li><i class="iconfont icon-tingzhitiaoshi clickIcon" title="停止调试(shift+F9)" @click= "quitDebug"></i></li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import * as fun from '@/api/coding'
import * as types from '@/api/config'
import {analyseToVisual} from 'common/js/analyseToVisual.js'
import {DebugReq} from 'common/js/class'

export default {
  created () {
  },
  props: {
    renderVariate: {
      type: Array,
      default: () => []
    },
  },
  data () {
    return {
      status: true    //防止快速点击
    }
  },
  methods: {
    test() {
      console.log("haha")
    },
    stepOver() {
      if(!this.status)
        return
      this.status =false
      const content = {eID: this.currentIndex,cmd:"next\n"}
      fun.getStepOverMsg(content).then((e)=>{
        if(types.STEP_OVER_SUCCESS_TYPE == e.type) {
          // analyseToVisual(e)
          this.status = true
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          }
          this.commitDebugData(e)
        }
      })
    },
    stepInto() {
      if(!this.status){
        return
      }
      this.status =false
      const content = {eID: this.currentIndex,cmd: "step\n"}
      fun.getStepIntoMsg(content).then((e)=>{
        if(types.STEP_INTO_SUCCESS_TYPE == e.type) {
          console.log('into',e)
          this.status = true
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          }
          this.commitDebugData(e)
        }
      })
    },
    commitStopDebug() {
      this.setStatus({type:"debugStatus",status:false}).then(()=>{
        const style = "warning"
        const label = "调试已关闭"
        const index = this.currentIndex
        this.setOutput({style, label})
        this.setDebugData({index})
      })
    },
    commitDebugData(e) {
      if(e.content.exception){
        this.setOutput({
                        style: "danger",
                        label: "调试异常",
                        _content: e.content.output
        })
        return
      }
      const index = this.currentIndex
      const _obj = {}
      _obj.lineNum = e.content.lineNum
      _obj.variate = e.content.variate
      _obj.dataStruct = e.content.dataStruct
      _obj.watchPoint = e.content.watchPoint
      _obj.backTrace = e.content.backTrace
      _obj.output = e.content.output
      this.setDebugData({index,_obj})
      if(e.content.output)
        this.setOutput({
                        style: "",
                        label: "",
                        _content: e.content.output
                      })
    },
    continueDebug() {
      if(!this.status)
        return
      this.status =false
      const content = {eID: this.currentIndex,cmd: "continue\n"}
      fun.getContinueDebugMsg(content).then((e)=>{
        console.log(e)
        if(types.CONTINUE_DEBUG_SUCCESS_TYPE == e.type) {
          console.log('continue',e)
          this.status = true
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          } 
          this.commitDebugData(e)    
        }
      })
    },
    quitDebug() {
      if(!this.status)
        return
      this.status =false
      const content = new DebugReq(this.currentDebug.bp, this.currentQuestion.content.questionFullName)
      fun.getQuitDebugMsg(content).then((e)=>{
        if(types.QUIT_DEBUG_SUCCESS_TYPE == e.type){
          this.status = true
          this.commitStopDebug()
        }
      })
    },
    ...mapActions([
      'setStatus',
      'setOutput'
    ]),
    ...mapMutations({
      setCurrentQuestion: 'SET_CURRENT_QUESTION',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setOpenQuestions: 'SET_OPEN_QUESTIONS',
      setDebugData: "SET_DEBUG_DATA"
    }) 
  },
  watch: {
    debugStatus() {
      var _this = this
  　  document.onkeydown=function(e){
        var e=e||window.event
        const keyCode = e.keyCode
        if(keyCode==122||keyCode==121||keyCode==120){ 
          e.stopPropagation();//阻止冒泡
          e.preventDefault(); //阻止默认事件、
        }
  　　　 if(keyCode == 122)
          _this.stepInto()
        else if(keyCode == 121)
          _this.stepOver()
        else if(keyCode == 120 && e.shiftKey)
          _this.quitDebug()
        else if(keyCode == 120)
          _this.continueDebug()
      }
    }
  },
  computed: {
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
  .debug-menu {
    // position: fixed;
    // top: 500px;
    // left: 40%;
    // transform:translate(-50%,-50%);
    // background-color: white;
    transition: all 1s;
    z-index: 50;
  }
  .debug-menu /deep/{ 
    .el-card__body{
      padding: 12px 20px;
    }
  }
  li:active{
    font-size: 19px;
    margin: -1.8px;
  }
  .debug-title {
    display: inline-block;
    height: 100%;
    padding: 0 5px 0 0;
    margin: -14px 10px -14px -5px;
    border-right: 3px dotted #909399;
  }
</style>
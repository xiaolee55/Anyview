<template>
  <div>
    <el-card class="debug-menu" v-if="debugStatus" draggable="true">
      <span class="debug-title"><i class="iconfont icon-_tiaoshi" title="调试栏"></i></span>
      <ul style="display:inline-block">
        <li><i class="iconfont icon-xiayibu" title="下一步(进入函数)" @click="stepInto"></i></li>
        <li><i class="iconfont icon-xiayihang" title="下一步(不进入函数)" @click="stepOver"></i></li>
        <li><i class="iconfont icon-chongfutiaoshi" title="重复调试" @click="repeatDebug"></i></li>
        <li><i class="iconfont icon-jixutiaoshi" title="继续调试" @click="continueDebug"></i></li>
        <li><i class="iconfont icon-tingzhitiaoshi" title="停止调试" @click="quitDebug"></i></li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import * as fun from '@/api/coding'
import * as types from '@/api/config'
import {DebugReq} from 'static/class'

export default {
  props: {
    renderVariate: {
      type: Array,
      default: () => []
    },
  },
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
    }
  },
  methods: {
    stepOver() {
      const content = {eID: this.currentIndex,cmd:"next\n"}
      fun.getStepOverMsg(content).then((e)=>{
        if(types.STEP_OVER_SUCCESS_TYPE == e.type) {
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          }
          this.commitDebugData(e)
        }
      })
    },
    stepInto() {
      const content = {eID: this.currentIndex,cmd: "step\n"}
      fun.getStepIntoMsg(content).then((e)=>{
        if(types.STEP_INTO_SUCCESS_TYPE == e.type) {
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
      const index = this.currentIndex
      const _obj = {}
      _obj.lineNum = e.content.lineNum
      _obj.variate = e.content.variate
      _obj.dataStruct = e.content.dataStruct
      _obj.watchPoint = e.content.watchPoint
      _obj.backTrace = e.content.backTrace
      this.setDebugData({index,_obj})
      if(e.content.output)
        this.setOutput({
                        style: "",
                        label: "下组数据",
                        _content: e.content.output
                      })
    },
    repeatDebug() {
      const content = new DebugReq(this.currentDebug.bp, this.currentQuestion.content.questionFullName,this.currentIndex)
      fun.getRepeatDebugMsg(content).then((e)=>{
        if(types.REPEAT_DEBUG_SUCCESS_TYPE == e.type) {
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          }       
        }
      })
    },
    continueDebug() {
      const content = {eID: this.currentIndex,cmd: "continue\n"}
      fun.getContinueDebugMsg(content).then((e)=>{
        if(types.CONTINUE_DEBUG_SUCCESS_TYPE == e.type) {
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug()
          }     
        }
      })
    },
    quitDebug() {
      const content = new DebugReq(this.currentDebug.bp, this.currentQuestion.content.questionFullName)
      fun.getQuitDebugMsg(content).then((e)=>{
        if(types.QUIT_DEBUG_SUCCESS_TYPE == e.type){
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
    position: fixed;
    top: 50px;
    left: 50%;
    transform:translate(-50%,-50%);
    background-color: white;
    z-index: 50;
  }
  .debug-menu /deep/{ 
    .el-card__body{
      padding: 12px 20px;
    }
  }
  .debug-title {
    display: inline-block;
    height: 100%;
    padding: 0 5px 0 0;
    margin: -14px 10px -14px -5px;
    border-right: 3px dotted #909399;
  }
</style>
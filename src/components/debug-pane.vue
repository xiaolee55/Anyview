<template>
  <div ref="dp" style="position:absolute;z-index:10">
    <el-card class="debug-menu" v-if="debugStatus">
      <tr class="btn-bar">
        <th class="debug-title"><i class="iconfont icon-_tiaoshi" title="调试栏" style="cursor:move" ref="dpt"></i></th>
        <td><i class="iconfont icon-xiayibu clickIcon" title="下一步(进入函数)(F11)" @click= "stepInto"></i></td>
        <td><i class="iconfont icon-xiayihang clickIcon" title="下一步(不进入函数)(F10)" @click= "stepOver"></i></td>
        <td><i class="iconfont icon-jixutiaoshi clickIcon" title="继续调试(F9)" @click= "continueDebug"></i></td>
        <td  style="margin-right:5px"><i class="iconfont icon-tingzhitiaoshi clickIcon" title="停止调试(shift+F9)" @click= "quitDebug"></i></td>
      </tr>
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
  mounted() {
    let that = this
    this._timer=setTimeout(()=>{
      //获取元素
      var dv = that.$refs.dp;
      var dpt = this.$refs.dpt
      var x = 0;
      var y = 0;
      var l = 0;
      var t = 0;
      var isDown = false;
      //鼠标按下事件
      dpt.onmousedown = function(e) {
          //获取x坐标和y坐标
          x = e.clientX;
          y = e.clientY;
          //获取左部和顶部的偏移量
          l = dv.offsetLeft;
          t = dv.offsetTop;
          //开关打开
          isDown = true;
          //设置样式  
          dv.style.cursor = 'move'
      }
      //鼠标移动
      window.onmousemove = function(e) {
        e.preventDefault()
          if (isDown == false) {
              return;
          }
          //获取x和y
          var nx = e.clientX;
          var ny = e.clientY;
          //计算移动后的左偏移量和顶部的偏移量
          var nl = nx - (x - l);
          var nt = ny - (y - t);
        
          dv.style.left = nl + 'px';
          dv.style.top = nt + 'px';
      }
      //鼠标抬起事件
      dpt.onmouseup = function() {
          //开关关闭
          isDown = false;
          dv.style.cursor = 'default';
      }
    })    
  },
  beforeDestroy(){
    clearTimeout(this._timer)
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
            this.commitStopDebug(e)
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
            this.commitStopDebug(e)
          }
          this.commitDebugData(e)
        }
      })
    },
    commitStopDebug(e) {
      !e.content&&(e.content= {})
      this.setStatus({type:"debugStatus",status:false}).then(()=>{
        let style = "warning"
        let label = "调试已关闭"
        const index = this.currentIndex
        this.setOutput({style, label})
        const len = e.content.errorOrder?Object.keys(e.content.errorOrder).length:0
        if(len===0&&this.initTestDataLength!=0){   //调试结束后如果测试数据全部通过，则提示用户再次运行
          style = 'success'
          label = '本次测试数据已通过，但仍需新生成数据进行测试，请再次运行程序'
          this.setOutput({style, label})
        }
        this.setDebugData({index})
        this.setCurrentTestOrder(-1)
      })
    },
    continueDebug() {
      if(!this.status)
        return
      this.status =false
      const content = {eID: this.currentIndex,cmd: "continue\n"}
      fun.getContinueDebugMsg(content).then((e)=>{
        if(types.CONTINUE_DEBUG_SUCCESS_TYPE == e.type) {
          console.log('continue',e)
          this.status = true
          if(e.content.output.includes("调试结束")) {
            this.commitStopDebug(e)
          } 
          this.commitDebugData(e)    
        }
      })
    },
    quitDebug() {
      if(!this.status)
        return
      this.status =false
      const content = {eID:this.currentIndex}
      fun.getQuitDebugMsg(content).then((e)=>{
        if(types.QUIT_DEBUG_SUCCESS_TYPE == e.type){
          console.log('退出调试',e)
          this.status = true
          this.commitStopDebug(e)
          this.commitDebugData(e)
        }
      })
    },
    commitDebugData(e) {
      !e.content&&(e.content= {output:"调试结束"})
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
      _obj.variate = e.content.variables
      _obj.dataStruct = e.content.dataStruct
      _obj.watchPoint = e.content.watchPoint
      _obj.backTrace = e.content.backtrace
      _obj.output = e.content.output
      this.setDebugData({index,_obj})
      if(e.content.output)
        this.setOutput({
                        style: "",
                        label: "",
                        _content: e.content.output
                      })
      this.setCurrentTestOrder(e.content.order+1)
      this.setErrorTestData({data:e.content.errorOrder,id:this.currentIndex})  //更新错误数据
    },
    ...mapActions([
      'setStatus',
      'setOutput'
    ]),
    ...mapMutations({
      setCurrentQuestion: 'SET_CURRENT_QUESTION',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setOpenQuestions: 'SET_OPEN_QUESTIONS',
      setDebugData: "SET_DEBUG_DATA",
      setErrorTestData: "SET_ERROR_TEST_DATA",
      setCurrentTestOrder: "SET_CURRENT_TEST_ORDER"
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
      "openQuestionsArr",
      "initTestDataLength"
    ]),
  },
}
</script>

<style lang="scss" scoped>
  .debug-menu {
    transition: all 1s;
    z-index: 50;
  }
  .debug-menu /deep/{ 
    .el-card__body{
      padding: 5px;
    }
  }
  .btn-bar{
    display: flex;
    justify-content: space-between;
    line-height: 20px;
    padding: 5px;
    padding-left: 10px;
  }
  .btn-bar>td{
    margin-right: 16px;
    line-height: 23px;
    padding-right: 4px;   
  }
  .btn-bar>td:active{
    padding-right: 3px;  //防止字体变大影响其他按钮也抖动
    font-size: 17px;
  }
  .debug-title {
    border-right: 3px dotted #3e3f41;
    padding-right: 5px;
    margin-right: 20px;
  }
</style>
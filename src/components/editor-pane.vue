<template>
    <el-tabs v-model="nowIndex"  
             type="card"  
             class="editor-tabs"
             :before-leave="beforeLeave">
          <div class="fun-menu" v-if="openQuestionsArr.length">
              <ul class="horizontal-list">
                <li>
                  <i class="iconfont icon-bianyi" 
                      title="编译(F5)" 
                      @click="compile"
                     :class="{'ing':iconStatus.compile==1,'not-ing': iconStatus.compile==2}"></i>
                </li>
                <li>
                  <i class="iconfont icon-chengzuyunxing" title="运行(F7)" @click="runGroup"
                    :class="{'ing':iconStatus.runGroup==1,'not-ing': iconStatus.runGroup==2}"></i>
                </li>
                <li>
                  <i class="iconfont icon-tiaoshi" title="调试(F8)" @click="startDebug"
                     :class="{'ing':iconStatus.debug==1,'not-ing': iconStatus.debug==2}"></i>
                </li>
                <li>
                  <i class="iconfont icon-baocun" title="保存(Ctrl+S)" @click="saveAnswer(currentQuestion.newAnswer)"
                     :class="{'ing':iconStatus.save==1,'not-ing': iconStatus.save==2}"></i>
                </li>
                <li v-if= "showGetPassCodeIcon">
                  <i class="iconfont icon-tongguodaima" title="获取已通过的代码" @click="getPassAnswer"
                     :class="{'ing':iconStatus.passCode==1,'not-ing': iconStatus.passCode==2}"></i>
                </li>
              </ul>          
          </div>
      <el-tab-pane v-for="item in openQuestionsArr" 
                   :key="item[0]"
                   :name="`${item[0]}`"
                   :lazy="true"
                   >
        <span slot="label">
          <i class="iconfont icon-c"></i>
          <span>{{item[1].name}}</span>
          <i class="iconfont icon-yuan question-title-icon" v-if="!currentQuestion.saveStatus&&item[1].id==currentQuestion.id"></i>
          <i class="el-icon-close question-title-icon"  :id="`${item[0]}`" @click.stop="removeTab"></i>
        </span>
          <ace :content= "item[1].answer"
                :debugLine= "debugLine"
                :debugStatus = "debugStatus"
                :ref="`ace${item[1].id}`"
                @changeContent= "changeContent"
                @save= "saveAnswer"
                @compile= "compile"
                @runGroup= "runGroup"
                @debug= "startDebug"
                @setBP= "setBP"
                @updateBP= "updateBP">
          </ace>
          <div class="lb-bar">
            <slot/>
          </div>
      </el-tab-pane>
    </el-tabs>
</template>

<script>
import ace from 'components/ace-editor'
import * as fun from '@/api/coding'
import * as types from '@/api/config'
import {analyseToVisual} from 'common/js/analyseToVisual.js'
import {formatCompileData} from 'common/js/formatCompileData.js'
import {mapGetters,mapMutations,mapActions} from 'vuex'
  export default {
    data () {
      return {
        updateCode:[],
        iconStatus: {
          compile: 0,
          runGroup: 0,
          debug: 0,
          save: 0,
          passCode: 0
        }
      }
    },
    methods: {
      resizeEditor(){
        this.$refs[`ace${this.currentIndex}`][0].aceEditor.resize()
      },
      setBP(bp) {
        const index = this.currentIndex
        const _obj = {"bp" : bp.join(",")}
        this.setDebugData({index,_obj})
      },
      changeIconStatus(iconKey){
        Object.keys(this.iconStatus).forEach((key)=>{
          this.iconStatus[key] = (key == iconKey) ? 1 : 2
        })
      },
      resetIconStatus() {
        Object.keys(this.iconStatus).forEach((key)=>{
          this.iconStatus[key] = 0
        })
      },
      checkIconStatus() {   //只要有任一个图标不是0（正常状态），则返回false，表明有状态在执行
        let flag = true   //forEach return无效
        Object.keys(this.iconStatus).forEach((key)=>{
         if(this.iconStatus[key] != 0){
            flag = false
          }
        })
        return flag
      },
      updateBP(bp,flag){
        const content = {addPoints:'',delPoints:''}
        flag=='add'?content.addPoints=bp:content.delPoints=bp
        fun.updateBreakpointMsg(content).then((e)=>{
          if(types.UPDATE_BREAKPOINT_SUCCESS_TYPE==e.type){
            console.log("调试更新断点",e)
          }
        })
      },
      getPassAnswer() {
        const content = {eID:this.currentIndex}
        fun.getPassAnswer(content).then(e=>{
          this.$confirm('此操作将覆盖您现在的代码, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$refs[`ace${this.currentQuestion.id}`][0].aceEditor.setValue(e.content,1)
            console.log('获取已通过代码',e)
          }).catch(() => {     
          });
        })
      },
      compile(event,_fun=()=>{}) {
        if(!this.checkIconStatus())   //有其他动作未结束则返回
          return
        this.changeIconStatus("compile")  //进行中，修改图标样式
        const res = this.currentQuestion
        const index = this.currentIndex
        // res.content.questionContent.studentAnswer = res.newAnswer

        const questionRes = res.content
        const eID = index
        const stuCode = res.newAnswer
        const content = {questionRes,eID,stuCode}
        
        this.updateOutputData("info", "编译中", "")

        fun.getCompileMsg(content).then((e)=>{
          console.log(e)
          if(e.type == types.COMPILE_SUCCESS_TYPE){
            console.log("编译",e.content)
            this.resetIconStatus()  //动作结束，修改图标样式
            this.updateOutputData()  //编译返回数据后删除‘编译中’的提示
            this.commitQuestionStatus(e.content)
            if(e.content.result.includes("失败")) {
              // formatCompileData(_content,res.newAnswer)
              this.updateOutputData("danger", "编译失败", e.content.result.replace(/\n/g,"<br>"))
            }else{
              this.updateOutputData("success", "编译成功")
              if(!this.currentQuestion.compileStatus)
                this.updateStatus("compileStatus", true)
              _fun()  //埋点，有可能有其他操作要先编译后在执行
            }
          }
        })
        function format(content) {      //格式化编译出错数据
          content = content.result ? content.result : content
          content =content.replace(/[\u4e00-\u9fa5]|(\!)|(\！)/g, "")
          for (let i = 0; i < content.length; i++) {
            if(content[i]=='I')
             if(content[i+1]=='n'){
              content=content.slice(0,i-1)+'<br/>'+content.slice(i)
              i=i+4
            }
          } 
          return content
        }

      },
      runGroup() {
        const _runGroup = () => {
        if(!this.checkIconStatus())
          return
        this.changeIconStatus("runGroup")  //进行中，修改图标样式
        const compileStatus = this.currentQuestion.compileStatus
            const questionFullName = this.currentQuestion.content.questionFullName
            const eID = this.currentIndex
            const content = {questionFullName,eID}

            this.updateOutputData("info", "运行中", "")

            fun.getRunGroupMsg(content).then((e)=>{
              if(e.type == types.RUN_GROUP_SUCCESS_TYPE){
                console.log('运行',e)
                this.resetIconStatus()  //动作结束，修改图标样式
                const _content = e.content.output
                this.updateOutputData()  //编译返回数据后删除进行中的提示
                this.updateOutputData("success", "运行成功", _content)
                this.setErrorTestData({data:e.content.errorOrder,id:this.currentIndex})
                this.commitQuestionStatus(e.content)
                e.content.passed?this.setOutput({style: "success",label: "本道题目已经通过！"}): ''
              }
            })
          }
        // if(!compileStatus){
          // this.resetIconStatus() 
          this.compile({},_runGroup)   //每次运行前都编译一次
        // }else{
          // _runGroup()
        // }
      },
      commitQuestionStatus(content) {
        this.setQuestionStatus({id:this.currentIndex,
                                cmpErrorCount: content.cmpErrorCount,
                                cmpRightCount: content.cmpRightCount,
                                runErrorCount:content.runErrCount,
                                runRightCount:content.runRightCount,
                                passStatus: content.passed})        
      },
      startDebug() {
        if(this.debugStatus){
          this.promptCloseDebug("请勿重复开启调试")
          return
        }
        const bp = this.currentDebug.bp
        if(!bp){
          this.updateOutputData("danger","未设置断点")
          return
        }
        const _this = this   //vue默认严格模式，非严格模式指向window，函数没有直接调用者的话this指向undefined，比如下面的_startDebug函数中的this
        const compileStatus = _this.currentQuestion.compileStatus
        const _startDebug = function(){ //绑定函数作用域
          if(!this.checkIconStatus())
            return
          this.changeIconStatus("debug")  //进行中，修改图标样式
          const questionFullName = this.currentQuestion.content.questionFullName
          const eID = this.currentIndex
          const content= {bp,questionFullName,eID}
          this.updateOutputData("info", "开启调试中", "")
          fun.getStartDebugMsg(content).then((e) => {
            if(e.type == types.START_DEBUG_SUCCESS_TYPE){
              console.log('start',e)
              // analyseToVisual(e)
              this.resetIconStatus()  //动作结束，修改图标样式
              this.updateOutputData()   //移除“调试中”的标签
              if(e.content.exception){
                this.setOutput({
                                style: "danger",
                                label: "调试异常",
                                _content: e.content.output
                })
                return
              }
              const _content = e.content.output
              this.updateOutputData("success", "开启调试成功", _content)    //更新在输出窗口的消息
              this.updateStatus("debugStatus", true)                //更新本道题的调试状态
              //更新调试行号
              const index = this.currentIndex
              const _obj = {}
              const {lineNum,variables,dataStruct,watchPoint,backtrace,output} = e.content
              _obj.lineNum = lineNum
              _obj.variate = variables
              _obj.dataStruct = dataStruct
              _obj.watchPoint = watchPoint
              _obj.backTrace = backtrace
              _obj.output = output
              this.setDebugData({index,_obj})
              this.setCurrentTestOrder(e.content.order+1)
              this.setErrorTestData({data:e.content.errorOrder,id:index})     //更新错误数据
              setTimeout(()=>{
                this.setInitTestDataLength(Object.keys(this.currentErrorData).length) //获取刚进入调试时的错误数据组的长度
              },0)
            }
          }) 
        }.bind(_this)

        // if(!compileStatus){   //如果未编译则先编译再执行
          // this.resetIconStatus()
          _this.compile({},_startDebug)
        // }else{
        //   _startDebug()
        // }
      },
      updateOutputData(style, label, _content) {
        this.setOutput({style, label, _content})
      },
      saveAnswer(answer,index=this.currentIndex) {
        if(!this.checkIconStatus())
          return
         this.iconStatus["save"] = 1
        const content = {}
        content.eID = index
        content.studentCode =answer

        fun.getSaveAnswerMsg(content).then((e) => {
          this.iconStatus["save"] = 0
          if(e.type = types.SAVE_ANSWER_SUCCESS_TYPE)
            this.updateStatus("saveStatus", true, answer)
        })
      },
      changeContent(answer) {  //修改代码
        // this.updateCoding = false
        this.updateStatus("saveStatus", false, answer)
      },
      updateStatus(type, status, content) {
        this.setStatus({
                        type:type,
                        status:status,
                        content:content
                        })
      },
      promptMessage(name) {
        return  this.$confirm(`是否要保存${name}代码？`, '提示', {
                  distinguishCancelAndClose: true,
                  confirmButtonText: '保存',
                  cancelButtonText: '不保存',
                  type: 'warning'
                })
      },
      promptCloseDebug(message) {
        return this.$confirm(message, {
          confirmButtonText: '确定',
          center: true,
          showClose: false
        })
      },
      clickTab(item) {
        let oldIndex = this.currentIndex
        let newQuestion = this.openQuestions.get(Number(item))
        //更新当前的题目索引和当前题目
        this.setCurrentIndex(item)
        this.setCurrentQuestion(newQuestion)
      },
      beforeLeave(item) {
        this.clickTab(item)
      },
      removeTab(e) {
        if(this.debugStatus){
          this.promptCloseDebug('请先关闭调试')
          return
        }
        let _this = this
        let removeIndex = Number(event.target.id)
        let openQuestions = this.openQuestions
        let removeQuestion = openQuestions.get(removeIndex)
        if(!removeQuestion.saveStatus){
            this.promptMessage(removeQuestion.name).then(() => {
              //发送保存请求
              _this.saveAnswer(removeQuestion.newAnswer,removeIndex)
              updateTabs()
            }).catch(action => {
              (action == 'cancel') ? updateTabs(): ''
            })
        }else{
          updateTabs()
        }
        //更新tabs数据
        function updateTabs() {
          if(removeIndex == _this.currentIndex && openQuestions.size!=1) {
            let newQuestion = openQuestions.get(_this.currentIndex)
            let arr = Array.from(openQuestions)
            for (let i = 0; i < arr.length; i++) {    //如果是map中的第一项，则新题目换为map的下一项，否则换为map的上一项
              if(arr[i][0]==removeIndex){
                if(i==0){
                  newQuestion = arr[i+1][1]
                  break
                }else{
                  newQuestion = arr[i-1][1]
                  break;
                }
              }
            }
            //更新当前题目，和当前题目索引
            _this.setCurrentIndex(newQuestion.id)
            _this.setCurrentQuestion(newQuestion)
          }
          if(openQuestions.size == 1) {
            _this.setCurrentIndex(0)
            _this.setCurrentQuestion(null)
            _this.setListOpen(true)
          }
          const index = removeIndex
          const content = ""
          const isRemove = true
          _this.setOutputData({index,content,isRemove}) //删除输出窗口
          //更新已打开题目数组
          openQuestions.delete(removeIndex)
          _this.setOpenQuestions(openQuestions)
        }
      },
      ...mapActions([
        "setStatus" ,
        "setOutput",
        "clearAll"
      ]),
      ...mapMutations({
        setListOpen: 'SET_LIST_OPEN',
        setCurrentIndex: "SET_CURRENT_INDEX",
        setCurrentQuestion: 'SET_CURRENT_QUESTION',
        setOpenQuestions: "SET_OPEN_QUESTIONS",
        setOutputData :"SET_OUTPUT_DATA",
        setDebugData: "SET_DEBUG_DATA",
        setVarAnimation: "SET_VARIATE_ANIMATION",
        setErrorTestData: "SET_ERROR_TEST_DATA",
        setCurrentTestOrder: "SET_CURRENT_TEST_ORDER",
        setInitTestDataLength: "SET_INIT_TEST_DATA_LENGTH",
        setQuestionStatus:  "SET_QUESTION_STATUS"
      })
    },
    computed: {
      showGetPassCodeIcon() {  //如果代码没有通过则不显示获取通过代码的图标
      //要想computed生效，则返回值必须是computed函数直接返回
        return function(){
          setTimeout(()=>{
            return this.questionStatus[this.currentIndex].passStatus
          })
        } 
      },
      nowIndex: {
        get (){
          return `${this.currentIndex}`
        },
        set(val) {
           this.setCurrentIndex(Number(val))
        }
      },
      debugLine() {
        return this.currentQuestion.debugStatus ? Number(this.currentDebug.lineNum): -1
      },
      openQuestions() {
        return new Map(this.openQuestionsArr)
      },
      debugStatus() {
        return this.currentQuestion.debugStatus
      },
      ...mapGetters([
        "openQuestionsArr",
        "currentIndex",
        "currentQuestion",
        "outputData",
        "debugData",
        "currentDebug",
        "currentErrorData",
        'questionStatus'
      ])
    },
    components: {
      ace
    }
  };
</script>

<style lang="scss" scoped>
  @import '../assets/css/components/editor-pane.scss';
</style>
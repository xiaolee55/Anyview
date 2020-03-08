<template>
  <div class="code-pane" v-loading="loading"
                         element-loading-text="题目加载中"
                         element-loading-background="rgba(0, 0, 0, 0)"
                         ref="coding">
    <qi-list v-if="questionDetailOpen" 
             :list='questionList'
             @getContent="_getQuestionContent"></qi-list>
    <template v-else>
      <transition name="el-fade-in-linear">
        <debug-pane  v-if="debugStatus" class="init-debP-place" id="debugPane"/>
      </transition>
      <el-drawer :visible.sync="listStatus" 
                  direction="rtl"
                  size="20%" 
                  :show-close="false">
        <question-list :list="questionList" 
                       :title="courseName" 
                       @getContent="_getQuestionContent"
                       :questionStatus="questionStatus"></question-list>
      </el-drawer>
      <splitpanes :push-other-panes="true" watch-slots v-if="debugStatus">
        <pane size=65>
          <splitpanes horizontal  watch-slots>
            <pane size=50>
              <el-tabs v-model="tab" type="card" style="height:100%" class="visual-desc">
                <el-tab-pane label="题目描述" name="desc">
                  <question-description @getContent="_getQuestionContent"/>
                </el-tab-pane>
                <el-tab-pane label="可视化" name="visual">
                  <visual-pane/>
                </el-tab-pane>
              </el-tabs>
            </pane>
            <pane size=40>
              <splitpanes  watch-slots>
                <pane size=50>
                  <!-- <variate-pane/> -->
                  <stack-variate-show/>
                </pane>
                <pane size=50>
                <watch-pane/>
                </pane>
              </splitpanes>
            </pane>
            <pane size=10>
            <wrong-data/>
            </pane>
          </splitpanes>
        </pane>
        <pane size=35>
          <splitpanes horizontal  watch-slots @resized="resizeEditor">
            <pane size=75 min-size="3">
              <editor-pane ref="edPane"/>
            </pane>
            <pane size=25>
              <output-pane/>
            </pane>
          </splitpanes>
        </pane>
      </splitpanes>

      <splitpanes  :push-other-panes="true" watch-slots v-else>
        <pane size=35>
          <splitpanes horizontal  watch-slots>
            <pane size=75>  
              <question-description @openList="showListPane=true" @getContent="_getQuestionContent" style="height:100%"></question-description>
            </pane>
            <pane size=25>
              <wrong-data/>
            </pane>
        </splitpanes>
        </pane>
        <pane size=65>
          <splitpanes  watch-slots horizontal @resized="resizeEditor">  
            <pane size=75 min-size="3">
              <editor-pane ref="edPane"></editor-pane>
            </pane>
            <pane size=25>
              <output-pane/>
            </pane>
          </splitpanes>
        </pane>
      </splitpanes>
    </template>
  </div>
</template>

<script>
import {Splitpanes,Pane} from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import QuestionList from 'components/question-list'
import QuestionDescription from 'components/question-description'
import EditorPane from 'components/editor-pane'
import OutputPane from 'components/output-pane'
import VisualPane from 'components/visual-pane'
import WatchPane from 'components/watch-pane'
import VariatePane from 'components/variate-pane'
import WrongData from 'components/wrong-data'
import DebugPane from 'components/debug-pane'
import QiList from 'components/qi-list'
import stackVariateShow from 'components/stack-variate/data-controller.vue'

import * as fun from '@/api/coding'
import * as types from '@/api/config'
import {getCache,setSessionCache,getSessionCache} from 'common/js/cache';
import {Question} from 'common/js/class'
import {mapGetters,mapMutations} from 'vuex'

export default {
    created () {
      window.addEventListener('beforeunload',this.beforeunloadFn)
      this.initHeight = `${document.documentElement.clientHeight*0.15}px`  //初始化输出框的高度
    },
    mounted() {
        // this.$nextTick(()=>{
        //   const codePane = this.$refs.coding
        //   codePane.addEventListener("click",(e)=>{
        //     if(!e.target.className.includes("tiaoshi")&&this.debugStatus){
        //       e.stopPropagation()
        //       this.$confirm("朋友，关闭调试", {
        //                 center: true,
        //                 showClose: false
        //               })
        //     }
        //   },true)
        // })
      if(!this.courseName){
        this.getCacheData()
      }
    },
    destroyed() {
      window.removeEventListener('beforeunload', this.beforeunloadFn)
    },
    data () {
      return {
        tab: "desc",
        loading: false,
        lastHeight: "",
        changeVal: 0,
        pageStatus: true,
        qs: {}
      }
    },
    methods: {
      resizeEditor(){   //调整编辑器的尺寸
        this.$refs.edPane.resizeEditor()
      },
      timeoutRminder() {
        clearTimeout(this._timer)
        this._timer=setTimeout(()=>{
          if(this.loading){
            this.loading=false
            this.backData=true
            this.$message.error('加载超时，请刷新页面重试')
          }
          clearTimeout(this._timer)
        },5000)
      },
      _getQuestionContent(_question){
        this.timeoutRminder()
        let index = Number(_question.eid)
        let openQuestions = this.openQuestions
        let question = openQuestions.get(index)
        if(question){
          this.updateCurrentData({index,question})
        }else{
          if(this.backData==false)
            return 
          this.backData=false
          this.loading = true
          this.pageStatus = false
          fun.getQuestionContent(_question.eid).then((e) => {
            this.backData=true
            console.log("题目信息",e)
            this.loading = false
            const id = _question.eid
            const name = _question.name
            const number = _question.number
            const  description = e.content.doc
            const answer =  e.content.stuCode
            const newAnswer = e.content.stuCode
            const content = e.content
            const saveStatus = true
            const compileStatus = false
            const debugStatus = false
            const passTime = -1
            let question = new Question({id, name, number, description, answer, newAnswer,content, saveStatus,compileStatus,debugStatus,passTime})
            this.updateCurrentData({index,question,openQuestions})
            setTimeout(()=>{
              this._getErrorData(id)
            }) 
          }) 
        }
      },
      _getErrorData(id){
        const content = {eID:id}
        fun.getErrorDataMsg(content).then(e=>{
          if(e.type == types.GET_ERROR_DATA_SUCCESS_TYPE){
            console.log("开启题目获取的错误数据",e)
            this.setErrorTestData({data:e.content,id: id})
          }
        })
      },
      updateCurrentData({index,question,openQuestions}) {
          //更新当前题目索引
          this.setCurrentIndex(index)
          //更新当前题目
          this.setCurrentQuestion(question)
          //更新已打开题目数组
          if(openQuestions){
            openQuestions.set(index, question)
            this.setOpenQuestions(openQuestions)
          }
      },
      getCacheData() {
        let _questionList = JSON.parse(getSessionCache("questionList"))
        let _courseName = getSessionCache("courseName")
        this.setQuestionList(_questionList)
        this.setCourseName(_courseName)  
      },
      setCacheData() {
        let _questionlist = JSON.stringify(this.questionList)
        let _courseName = this.courseName
        setSessionCache("questionList", _questionlist)
        setSessionCache("courseName",_courseName)
      },
      beforeunloadFn() {    //刷新窗口时执行的函数
        this.setCacheData()
      },

      ...mapMutations({
        setListOpen: 'SET_LIST_OPEN',
        setQuestionList: 'SET_QUESTION_LIST',
        setCourseName: 'SET_COURSE_NAME',
        setCurrentQuestion: 'SET_CURRENT_QUESTION',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setOpenQuestions: 'SET_OPEN_QUESTIONS',
        setErrorTestData: "SET_ERROR_TEST_DATA",
        setQuestionStatus:  "SET_QUESTION_STATUS",
        setQuestionDetailOpen: 'SET_QUESTION_DETAIL_OPEN'
      })
    },
    computed:{
        openQuestions() {
          return new Map(this.openQuestionsArr)
        },
        debugStatus() {
          return this.currentQuestion.debugStatus
        },
        listStatus: {
          get() {
            return this.listOpen
          },
          set() {
            this.setListOpen(false)
          }
        },
        ...mapGetters([
          "listOpen",
          "questionDetailOpen",
          "questionList",
          "courseName",
          "questionDescription",
          "currentQuestion",
          "openQuestionsArr",
          'questionStatus'
        ]),
    },
    watch: {
      questionList: {
        immediate: true,
        handler:function(val){
          if(!val) return
          let self=this
          val.flat(1).forEach(item=>{
            self.setQuestionStatus({id:item.eid,
                            cmpRightCount:item.cmpRightCount||0,
                            cmpErrorCount:item.cmpErrorCount||0,
                            runErrorCount:item.runErrCount||0,
                            runRightCount:item.runResult||0,
                            passStatus: item.firstPastTime||0})
          })
        }
      }
    },
      components: {
        Splitpanes,
        Pane,
        DebugPane,
        QuestionList,
        QuestionDescription,
        EditorPane,
        DebugPane,
        VisualPane,
        OutputPane,
        WatchPane,
        VariatePane,
        WrongData,
        QiList,
        stackVariateShow,
   }
}
</script>

<style>
  @import '../assets/css/base.css';
 .el-drawer {    
  padding: 15px;
  overflow: auto!important;
}
.el-drawer__header {
  margin-bottom: 10px;
} 
</style>
<style lang="scss" scoped>
   @import '../assets/css/coding.scss';
</style>

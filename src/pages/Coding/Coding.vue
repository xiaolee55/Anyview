<template>
  <div class="code-pane" v-loading="loading"
                         element-loading-text="题目加载中"
                         element-loading-background="rgba(0, 0, 0, 0)">
    <el-drawer :visible.sync="listStatus" 
                direction="rtl"
                size="20%" 
                :show-close="false">
      <question-list :list="questionList" :title="courseName" @getContent="_getQuestionContent"></question-list>
    </el-drawer>
    <splitpanes :push-other-panes="true" watch-slots v-if="debugStatus">
      <splitpanes :splitpanes-size="65" horizontal  watch-slots  @resize="resizeLeft">
        <el-tabs v-model="tab" type="card" :splitpanes-size="50" style="height:100%" class="visual-desc">
          <el-tab-pane label="题目描述" name="desc">
            <question-description @getContent="_getQuestionContent"></question-description>
          </el-tab-pane>
          <el-tab-pane label="可视化" name="visual">
            <visual-pane></visual-pane>
          </el-tab-pane>
        </el-tabs>
        <splitpanes :splitpanes-size="40"  watch-slots>
          <variate-pane :splitpanes-size="50" ref="variatePane"></variate-pane>
          <watch-pane :splitpanes-size="50" ref="watchPane"></watch-pane>
        </splitpanes>
        <wrong-data :splitpanes-size="10" ref="wrongData"></wrong-data>
      </splitpanes>
      <splitpanes :splitpanes-size="35" horizontal  watch-slots >
        <editor-pane :splitpanes-size="75" ref="editorPane"></editor-pane>
        <output-pane :splitpanes-size="25" ref="outputPane"></output-pane>
      </splitpanes>
    </splitpanes>

    <splitpanes  :push-other-panes="true" watch-slots v-if="!debugStatus">
          <question-description  @openList="showListPane=true" @getContent="_getQuestionContent" style="height:100%"></question-description>
      <splitpanes  :push-other-panes="true" watch-slots horizontal :splitpanes-size="80">  
        <editor-pane :splitpanes-size="75" ref="editorPane"></editor-pane>
        <output-pane :splitpanes-size="25" ref="outputPane"></output-pane>
      </splitpanes>
    </splitpanes>
  </div>
</template>

<script>
import Splitpanes from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import ace from 'components/aceEditor'

import QuestionList from 'components/question-list'
import QuestionDescription from 'components/question-description'
import EditorPane from 'components/editor-pane'
import OutputPane from 'components/output-pane'
import VisualPane from 'components/visual-pane'
import DebugPane from 'components/debug-pane'
import WatchPane from 'components/watch-pane'
import VariatePane from 'components/variate-pane'
import WrongData from 'components/wrong-data'

import * as fun from '@/api/coding'
import {getCache,setSessionCache,getSessionCache} from 'common/js/cache';
import {Question} from 'common/js/class'
import {mapGetters,mapMutations} from 'vuex'

export default {
    created () {
      window.addEventListener('beforeunload',this.beforeunloadFn)
      this.initHeight = `${document.documentElement.clientHeight*0.15}px`  //初始化输出框的高度
    },
    mounted() {
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
        changeVal: 0
      }
    },
    methods: {
      resizeLeft(e) {
        const val = (e[1].width-this.lastHeight)*document.body.clientHeight/100
        if(val<100)
          this.changeVal+=val
        this.$refs.variatePane.fixedFun(this.changeVal)
        this.lastHeight = e[1].width
      },
      _getQuestionContent(_question){
        let index = Number(_question.eid)
        let openQuestions = this.openQuestions
        let question = openQuestions.get(index)
        if(question){
          this.updateCurrentData({index,question})
        }else{
          this.loading = true
          fun.getQuestionContent(_question.eid).then((e) => {
            console.log("题目信息",e)
            this.loading = false
            const id = _question.eid
            const name = _question.name
            const number = _question.number
            const  description = e.content.questionContent.questionDescription
            const answer =  e.content.questionContent.studentAnswer
            const newAnswer = e.content.questionContent.studentAnswer
            const content = e.content
            const saveStatus = true
            const compileStatus = false
            const debugStatus = false
            let question = new Question({id, name, number, description, answer, newAnswer,content, saveStatus,compileStatus,debugStatus})
            this.updateCurrentData({index,question,openQuestions})
          }) 
        }
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
        setOpenQuestions: 'SET_OPEN_QUESTIONS'
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
          "questionList",
          "courseName",
          "questionDescription",
          "currentQuestion",
          "openQuestionsArr"
        ]),
      },
      components: {
        Splitpanes,
        ace,
        QuestionList,
        QuestionDescription,
        EditorPane,
        DebugPane,
        VisualPane,
        OutputPane,
        WatchPane,
        VariatePane,
        WrongData
   }
}
</script>

<style>
   @import '../../common/css/base.css';
   /* 这个组件不一定嵌套在code-pane里面，所以不能嵌套修改 */
  .el-drawer {    
    padding: 15px;
    overflow: auto!important;
  }
  .el-drawer__header {
    margin-bottom: 10px;
  }
</style>

<style lang="scss" scoped>
.code-pane /deep/ {
  canvas {
      position: absolute;
      left: -10px;
      z-index: 33;
  }
  li {
    display: inline-block;
  }
  .el-tabs__header{
    margin-bottom: 0px!important;
    border-bottom: 1px solid transparent!important;
  }
  .el-tabs__item {
    padding: 0 10px;
    line-height: 30px;
    height: 30px;
  }
  .ace_gutter-cell{
    cursor: pointer;
  }
  /* #pane-desc{
    display: flex;
  } */
  .el-tabs {
    display: flex;
    flex-direction: column;
  }
  .el-tabs__content,.el-tab-pane{
    flex: 1;
    display: flex;
  }
}

</style>

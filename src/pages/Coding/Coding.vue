<template>
  <div class="code-pane">
    <el-drawer :visible.sync="showListPane" 
                direction="rtl"
                size="20%" 
                :show-close="false">
      <question-list :list="questionList" :title="courseName" @getContent="_getQuestionContent"></question-list>
    </el-drawer>
    <debug-pane></debug-pane>
    <splitpanes :push-other-panes="true" watch-slots v-if="debugStatus">
      <splitpanes :splitpanes-size="65" horizontal  watch-slots @resize="_updataWdHeight">
        <el-tabs v-model="tab" type="card" :splitpanes-size="50" style="height:100%" class="visual-desc">
          <el-tab-pane label="题目描述" name="desc">
            <question-description  @openList="showListPane=true" @getContent="_getQuestionContent"></question-description>
          </el-tab-pane>
          <el-tab-pane label="可视化" name="visual">
            <visual-pane></visual-pane>
          </el-tab-pane>
        </el-tabs>
        <splitpanes :splitpanes-size="40"  watch-slots>
          <variate-pane :splitpanes-size="50"></variate-pane>
          <watch-pane :splitpanes-size="50"></watch-pane>
        </splitpanes>
        <wrong-data :splitpanes-size="10" ref="wrongData"></wrong-data>
      </splitpanes>
      <splitpanes :splitpanes-size="35"  @resize="_updataOpPHeight" horizontal  watch-slots>
        <editor-pane :splitpanes-size="75" ></editor-pane>
        <output-pane :splitpanes-size="25" ref="outputPane"></output-pane>
      </splitpanes>
    </splitpanes>

    <splitpanes  :push-other-panes="true" watch-slots v-if="!debugStatus">
      <question-description :splitpanes-size="20"  @openList="showListPane=true" @getContent="_getQuestionContent"></question-description>
      <splitpanes  :push-other-panes="true" watch-slots horizontal :splitpanes-size="80" @resize="_updataOpPHeight">  
        <editor-pane :splitpanes-size="80" ></editor-pane>
        <output-pane :splitpanes-size="20" ref="outputPane"></output-pane>
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
import {getCache,setSessionCache,getSessionCache} from 'static/cache.js';
import {Question} from 'static/class'
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
        showListPane: true,
      }
    },
    methods: {
      _getQuestionContent(_question){
        let index = Number(_question.eid)
        let openQuestions = this.openQuestions
        let question = openQuestions.get(index)
        if(question){
          this.updateCurrentData({index,question})
        }else{
          fun.getQuestionContent(_question.eid).then((e) => {
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
      openQuestionList() {
        this.showListPane = true
      },
      _updataOpPHeight(e) {
        this.$refs.outputPane.updataOpPHeight(e)
      },
      _updataWdHeight(e) {
        this.$refs.wrongData.updataWdHeight(e)
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
        ...mapGetters([
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
  /*基本样式开始*/
html{
    height: 100%;
    /* overflow:hidden; */
}
body{
    height: 100%;
    margin: 0;
    padding: 0;
}
ul{
   white-space:nowrap;
   list-style: none;
   padding: 0;
   margin: 0;
}
li{
  display: inline-block;
  padding: 0 10px;
}
.code-pane{
    font: 500 16px/20px "Microsoft yahei";
    height: 100%;
    width: 100%;
  }
.splitpanes,.splitpanes__pane {
  background: white;
}

.splitpanes--vertical > .splitpanes__splitter {
  position: relative;
  min-width: 11px !important;
  background-color: #fff;
  cursor: ew-resize	;
}
.splitpanes--horizontal > .splitpanes__splitter {
  position: relative;
  min-height: 11px;
  background-color: #fff;
  cursor: ns-resize;
}
.splitpanes--vertical > .splitpanes__splitter::before {
  margin-left: -2px;
  transform: translateY(-50%);
  width: 1px;
  height: 30px;
}
.splitpanes--vertical > .splitpanes__splitter::after {
  margin-left: 1px;
  transform: translateY(-50%);
  width: 1px;
  height: 30px; 
}
.splitpanes--horizontal > .splitpanes__splitter::before {
  margin-top: -2px;
  transform: translateX(-50%);
  width: 30px;
  height: 1px;
}
.splitpanes--horizontal > .splitpanes__splitter::after {
  margin-top: 1px;
  transform: translateX(-50%);
  width: 30px;
  height: 1px;
}
.splitpanes__splitter::after,.splitpanes__splitter::before{
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: rgba(0,0,0,.15);
  -webkit-transition: background-color .3s;
  transition: background-color .3s;
}
  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar
{
	width: 10px;
	background-color: white;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
	background-color: rgba(0,0,0,0.4);
}
/*基本样式结束*/
</style>

<style lang="scss">
.el-drawer{
    height: 90%;
    padding: 15px;
    overflow: auto!important; 
}

/* 编码面板开始 */
 .el-tabs__header{
  margin-bottom: 0px;
  border-bottom: 1px solid transparent!important;
}
.el-tabs__item {
  padding: 0 10px;
  line-height: 30px;
  height: 30px;
}
canvas{
  position: absolute;
  left: -10px;
  z-index: 33;
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
/* 编码面板结束 */
</style>

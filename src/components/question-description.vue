<template>
  <div class="question-content" @scroll="fixButton">
    <div class="question-menu-top" ref="topMenu">
      <i class="iconfont icon-xuanzekemu" style="cursor:pointer" title="选择题库" @click="goToWork"></i>
      <i class="iconfont icon-gerenxinxi" style="margin-left:20px;cursor:pointer" title="个人中心" @click="goToPerCenter"></i>
      <i class="iconfont icon-liebiao" style="cursor:pointer" title="打开列表" @click="openList"></i>
    </div>
      <div class="question-desc" ><p>{{questionDescription}}</p></div>
      <div class="question-menu-bottom" ref="bottomMenu">
      <el-button type="primary" round style="margin-right:20px" @click="previousQuestion">上一题</el-button>
        <el-button type="primary" round style="margin-right:20px" @click="nextQuestion">下一题</el-button>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations} from 'vuex'
export default {
  methods: {
    goToWork() {
      this.goTo("work")
    },
    goToPerCenter() {
      this.goTo("personalCenter")
    },
    goTo(routeName) {
      this.$router.replace(routeName)
    },
    openList() {
      if(this.debugStatus){
        this.promptCloseDebug('请先关闭调试')
        return
      }
      this.setListOpen(true)
    },
    fixButton(event){
      this.$refs.topMenu.style.top=event.target.scrollTop+'px';
      this.$refs.bottomMenu.style.bottom=-event.target.scrollTop+'px';
    },
    previousQuestion() {
      if(this.debugStatus){
        this.promptCloseDebug('请先关闭调试')
        return
      }
      let newNumber = this.currentQuestion.number - 1
      this.changeQuestion(newNumber)
    },
    nextQuestion() {
      if(this.debugStatus){
        this.promptCloseDebug('请先关闭调试')
        return
      }
      let newNumber = this.currentQuestion.number+1
      this.changeQuestion(newNumber)
    },
    changeQuestion(newNumber) {
      //从已打开的题目列表中查找本道题目的上一道题目或者下一道题目
      const openQuestions = this.openQuestions
      let newIndex = -1
      openQuestions.forEach((item) => {
        if(newNumber == item.number)
          newIndex = item.id
      })
      let newQuestion  = openQuestions.get(newIndex)
      //如果不在已打开列表中，则在所有列表中查询新题目信息用以请求新题目，否则更新当前题目和索引
      if(!newQuestion){
        const list = this.questionList
        let question =  list.flat().find(item=>newNumber == item.number)
        question ? this.$emit("getContent",question) : " "
      }else{
        this.setCurrentIndex(newIndex)
        this.setCurrentQuestion(newQuestion)
      }
    },
    promptCloseDebug(message) {
        this.$alert(message, {
        confirmButtonText: '确定',
        center: true
      });
      },
    ...mapMutations({
      setListOpen: 'SET_LIST_OPEN',
      setCurrentIndex: "SET_CURRENT_INDEX",
      setCurrentQuestion: 'SET_CURRENT_QUESTION',
      setOpenQuestions: "SET_OPEN_QUESTIONS"
    })
  },
  computed: {
    openQuestions() {
      return new Map(this.openQuestionsArr)
    },
    debugStatus() {
      return this.currentQuestion.debugStatus
    },
    ...mapGetters([
      "listOpen",
      "questionList",
      "openQuestionsArr",
      "currentIndex",
      "currentQuestion",
      "questionDescription"
    ])
  }
}
</script>

<style lang="scss" scoped>
  /* 问题内容板块开始 */
  .question-content{
      position: relative;
      // height: 100%;
      flex: 1;
      overflow-y: scroll;
      overflow-x: hidden;
      transition: all 0.5s ease;
  }
  .question-desc{
    position: absolute;
    top: 8%;
    height: 0;
    width: 100%;
    height: 100%;
  }
  .question-desc p{
    border: #888888 1px solid; 
    margin: 10px;
    padding: 10px;
  }
  .question-menu-top,.question-menu-bottom{
    position: absolute;
    left: 0;
    width: 100%;
    height: 5%;
    background-color: white;
    transition: background-color 0.6s ease;
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 5;
  }
  .question-menu-top{
    top: 0;
    padding-top: 10px;
  }
  .question-menu-bottom{
    bottom: 0;
    padding-bottom: 10px;
  }
  .setting-menu{
    position: fixed;
    display: flex;
    flex-direction: column;
    z-index: 2011;
    margin: 5px 0.8px;
    border: 1px solid #EBEEF5;
    background-color: #FFF;
    color: #303133;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
  .setting-menu li{
    padding: 7px 30px;
    cursor: pointer;
  }
  .setting-menu li:hover{
      background-color: #f5f7fa;
      color: #409eff;
  }
  /* 问题内容板块结束 */
</style>
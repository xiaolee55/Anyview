<template>
    <div>
      <el-header class="work-header">
        <el-row type="flex" justify="space-around">
        <el-col :span="6" style="position:relative">
          <div>
            <img src="./images/Anyview.svg" alt="Anyview可视化编程平台" class="header-logo">
            <canvas id="canvas"></canvas>
          </div>
        </el-col>
        <el-col :span="6"><div><el-input placeholder="请输入内容"  prefix-icon="el-icon-search"></el-input></div></el-col>
        <el-col :span="6">
          <div>
            <el-dropdown trigger="hover" @command="clickItem">
              <span>
                <el-avatar  class="header-avatar"  
                            shape="square" 
                            :size="45" 
                            fit="fill" 
                            src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg">
                </el-avatar>
              <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command='perCenter'><i class="el-icon-menu"></i>个人中心</el-dropdown-item>
              <el-dropdown-item><i class="el-icon-bell"></i>我的消息</el-dropdown-item>
              <el-dropdown-item><i class="el-icon-star-off"></i>我的收藏</el-dropdown-item>
              <el-dropdown-item><i class="el-icon-tickets"></i>我的笔记</el-dropdown-item>
              <el-dropdown-item><i class="el-icon-time"></i>我的进度</el-dropdown-item>
              <el-dropdown-item command="logout"><i class="el-icon-warning"></i>退出账号</el-dropdown-item>
              </el-dropdown-menu>
              </span>
            </el-dropdown>
            <span class="user-name"><i>{{user.name}}</i></span>
          </div>
        </el-col>
      </el-row>
      </el-header>
      <el-main class="work-main w">
        <work-card :courseName="courseName"
                   :chapNum="chapNum"
                   :questionNum="totalNum"
                   :finishNum="finishNum"
                   :is_first="isFirst"
                   @goToCoding="goToCoding"></work-card>
        <work-card></work-card>
        <work-card></work-card>
      </el-main>
      <el-footer>
        <span>©</span>
        <span>广东工业大学</span>
        <span>可视化创新与系统工具研究工作室</span>
        <span><a href="">Anyview团队</a></span>
      </el-footer>
    </div>
</template>
<script>
 import canvas from 'common/js/canvas';
 import workCard from 'components/course-card.vue';
 import {getQuestionList,getLogout} from '@/api/work'
 import {setCache,getCache,removeCache,clearSessionCache} from 'common/js/cache';
 import * as types from '@/api/config'
 import {mapState,mapMutations,mapGetters} from 'vuex'

export default {
    mounted () {
      canvas(5,"#409EFF")   //执行canvas动画
      this._getQuestionList()
    },
    data () {
      return {
        isFirst: true,
        totalNum: 0
      }
    },
    methods: {
      _getQuestionList() {
        console.log(this.user)
        getQuestionList(this.user.id).then((e)=>{
          let content = e.content[0]
          this.totalNum = content.totalNum
          this.setCourseName(content.tableName)
          console.log("题目列表",content)
          this.setQuestionList(content.catalogs)
        })
      },
      clickItem(command) {
        switch(command){
          case 'perCenter' : this.goToPerCenter('personalCenter');break;
          case 'logout': this.logout();break;
        }
      },
      logout() {
        getLogout(this.user).then((e)=>{
          if(e.type === types.LOGOUT_SUCCESS_TYPE){
            this.changeRoute("login")
            removeCache("user")   //移除localStorage的缓存
            clearSessionCache()  //清空sessionStorage的缓存
            this.resetState()    //清空vuex
          }
        })
      },
      goToPerCenter(){
        this.changeRoute("personalCenter")
      },
      goToCoding() {
        if(!this.questionList[0].length)
          return
        this.openQuestionsArr.length?this.setListOpen(false):this.setListOpen(true)
        this.changeRoute("coding")
      },
      changeRoute(routeName){
        this.$router.replace(routeName)
      },
      ...mapMutations({
        setListOpen: 'SET_LIST_OPEN',
        setQuestionList: 'SET_QUESTION_LIST',
        setCourseName: 'SET_COURSE_NAME',
        resetState: 'RESET_STATE'
      }) 
    },
    computed: {
      user() {
        return JSON.parse(getCache("user"))
      },
      chapNum() {
        return this.questionList.length
      },
       ...mapGetters([
          'courseName',
          'questionList',
          'finishNum',
          "openQuestionsArr"
       ])
    },
    components: {
     workCard
    }
}
</script>

<style>
  @import "../../assets/css/base.css";
</style>
<style lang="scss" scoped>
    #canvas{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
   .w{
     width: 80%;
     margin: 0 auto;
   }
   .work-header{
     height: 20%!important;   //组件库由于有默认样式，加important覆盖
     margin-top: 30px;
     .header-logo{
       cursor: pointer;
       margin-top: -100px;
       height: 250px;
       width: 250px;
     }
     div{
       text-align: center;
     }
     .header-avatar{
       cursor: pointer;
     }
     .user-name{
      color: rgb(144, 164, 174);
      cursor: pointer;
      padding: 5px;
      font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
     }
   }
  .el-card{
     margin-bottom:100px;
  }
</style>
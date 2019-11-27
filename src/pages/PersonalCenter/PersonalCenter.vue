<template>
    <div>
        <el-row class="el-card box-card is-always-shadow per-header">
            <el-col :span="12" :offset="4" style="display:flex;justify-content: space-between;align-items:center">
                <h1 style="color: #409eff;margin:0">Anyview</h1>
                <span style="font-size:17px;">社区</span>
                <span style="font-size:17px;" @click= "changeRoute('work')">课程</span>
            </el-col>
            <el-col :span="6"></el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="4" :offset="4">
                <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <img src="./images/touxiang.jpg" alt="茶客" style="height:48px;width:48px;">
                    <span>{{user.name}}</span>
                     <el-button style="float: right; padding: 3px 0" type="text" @click="logout">退出账号</el-button>
                </div>
                <p>昵称：{{user.name}}</p>
                <p>邮箱：{{user.email}}</p>
                <p>学号：{{user.username}}</p>
                <p>学校：广东工业大学</p>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-tabs type="border-card">
                    <el-tab-pane label="做题动态">
                    <div class="solve-trends">
                        <calendarHeatmap 
                        :values="[{ date: '2018-9-22', count: 6}]"
                        :end-date="2018-9-22"
                        :range-color="['ebedf0', 'dae2ef', '#c0ddf9', '#73b3f3', '#3886e1', '#17459e']"
                        style="margin-bottom: 20px;"
                        />
                        <el-timeline>
                            <el-timeline-item :timestamp="item.time" placement="bottom" v-for="(item,index) in trends" :key="index">
                                <div>
                                    <span>{{user.name}}运行了</span>
                                    <span class="per-question-name" @click="goTo('Coding',item.name)">{{item.chapName+item.name}}</span>
                                    <span class="el-icon-check" style="color:#08bf91;">正确次数：{{item.rightNum}}</span>
                                    <span class="el-icon-close" style="color:#dc3545;">错误次数：{{item.errorNum}}</span>
                                </div>
                                    <el-button type="danger" round size="mini" v-if='item.errorNum!=0'>未通过</el-button>
                                    <el-button type="success" round size="mini" v-else>通过</el-button>
                            </el-timeline-item>
                        </el-timeline>                                              
                    </div>
                    </el-tab-pane>
                    <el-tab-pane label="修改信息"></el-tab-pane>
                    <el-tab-pane label="我的笔记"></el-tab-pane>
                    <el-tab-pane label="我的消息"></el-tab-pane>
                    <el-tab-pane label="信息统计"></el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6"></el-col>
            <el-col :span="18">
            </el-col>
        </el-row>
        
    </div>
</template>

<script>
 import { CalendarHeatmap } from 'vue-calendar-heatmap'
 import {getLogout} from '@/api/work'
 import {setCache,getCache,removeCache,clearSessionCache} from 'common/js/cache';
 import * as types from '@/api/config'
 import {mapMutations} from 'vuex'

export default {
    created(){
    },
    data() {
        return {
        }
    },
    methods: {
      changeRoute(routeName){
        this.$router.replace(routeName)
      },
      logout() {
        getLogout(this.user).then((e)=>{
          if(e.type === types.LOGOUT_SUCCESS_TYPE){
            console.log("退出账号",e)
            this.changeRoute("login")
            removeCache("user")
            clearSessionCache()
            this.resetState()    //清空vuex
          }
        })
      },
      ...mapMutations({
          resetState: 'RESET_STATE'
      })
    },
    computed: {
      user() {
        return JSON.parse(getCache("user"))
      },
      trends(){
        return this.$store.state.solveTrends
      }
    },

    components: {
        CalendarHeatmap
    }

}
</script>

<style lang="">
html{
    background-color:#f9f9f9;
    margin: 0;
}
body{
    background-color:#f9f9f9;
    margin: 0;
}
.el-row{
    margin-top: 20px;
}
a{font-size: 13px; text-decoration: none;}
a:link {color: rgb(69, 90, 100);}		/* 未访问的链接 */
a:visited {color: rgb(69, 90, 100);}	/* 已访问的链接 */
a:hover {color: rgb(69, 90, 100);text-decoration:underline;}	/* 鼠标移动到链接上 */
a:active {color: rgb(69, 90, 100)}	/* 选定的链接 */
.per-question-name{
    cursor: pointer;
    font-size: 13px;
    color: rgb(69, 90, 100);
}
.per-question-name:hover{
    text-decoration:underline;
}
.per-header{
    margin-top: 0;
    padding: 5px;
}
.per-header span{
    cursor: pointer;
}
.per-header span:hover{
    color:#409EFF;
}
.solve-trends{
    padding: 10px;
}
  .solve-trends span{
    padding: 0 10px;
  }
  .solve-trends .el-timeline-item__content{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
  }
  .solve-trends .is-round{
      padding: 4px!important;
  }
</style>
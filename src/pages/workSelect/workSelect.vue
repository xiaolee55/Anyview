<template>
    <div>
      <canvas id="canvas"></canvas>
        <div class="container">
          <div class="header w">
            <div class="logo">
              <h1 style="color: #409eff">Anyview</h1>
            </div>
            <div class="menu-bar">
                <el-input
                placeholder="请输入内容"
                prefix-icon="el-icon-search"
                size="small">
              </el-input>
            </div>
            <div class="per-info">
                <span style="margin-right: 10px">{{user.name}}</span>
                <el-dropdown trigger="click" >
                <span class="user-icon">
                </span>
                <el-dropdown-menu slot="dropdown" >
                  <el-dropdown-item><i class="el-icon-menu" ></i>个人中心</el-dropdown-item>
                  <el-dropdown-item><i class="el-icon-bell"></i>我的消息</el-dropdown-item>
                  <el-dropdown-item><i class="el-icon-star-off"></i>我的收藏</el-dropdown-item>
                  <el-dropdown-item><i class="el-icon-tickets"></i>我的笔记</el-dropdown-item>
                  <el-dropdown-item><i class="el-icon-time"></i>我的进度</el-dropdown-item>
                  <el-dropdown-item><i class="el-icon-warning"></i>退出账号</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="content w">
            <h1 style="margin-top: 30px">继续题目：</h1>
            <div class="latest-course">
              <course courseName="C语言程序设计"  cardType="上次做到" :questionId="50" :questionCount="200"  @goTo='goTo'></course>
              <course courseName="数据结构"  cardType="上次做到" :questionId="40" :questionCount="200"></course>
            </div>
            <h1>所有课程：</h1>
            <div class="all-course">
              <course courseName="C语言程序设计"  cardType="题目总数" @goTo='goTo'></course>
              <course courseName="Java语言程序设计"  cardType="题目总数" ></course>
              <course courseName="离散数学实践"  cardType="题目总数"></course>
              <course courseName="C#语言程序设计"  cardType="题目总数"></course>
              <course courseName="数据结构"  cardType="题目总数"></course>   
              <course courseName="操作系统"  cardType="题目总数"></course>   
            </div>
          </div>
          <div class="footer">
            <span>© 广东工业大学Anyview工作室</span>
            <span>地址：大学城校区工学一号馆620</span>
            <span>问题反馈：1084235321@qq.com</span>
          </div>
        </div>
    </div>
</template>
<script>
import course from '../../components/courseCard.vue';
export default {
    created () {
      this.user=JSON.parse(this.$route.query.user);
    },
    data () {
      return {
        user: {}
      }
    },
    methods: {
      goTo(){
          
          this.$router.push({ 
            name: 'Coding',
            query:{ 
                user: JSON.stringify(this.user)
            },
        })
      }
    },
    components: {
     course   
    }
}
</script>

<style>
  html{
      height: 100%;
  }
  body{
    margin: 0;
    height: 100%;
    background-color: #fff;
  }
  .w{
    width: 80%;
    margin: 0 auto;
  }
  #canvas{
    position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    z-index:-99;
    }
  .container{
    height: 100%;
  }
  /* header部分开始 */
  .header{
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #C0C4CC;
  }
  .menu-bar{
    display: flex;
    align-items:center;
  }
  .per-info{
    display: flex;
    align-items:center;   
  }
   .user-icon{
     float: right;
     border-radius: 50%;
     width: 30px;
     height: 30px;
     background: url(https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562660030075&di=f7004b3dd55e1ff805ab3064c26e9777&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F17%2F12%2F24%2Ffc5730de1eeeb97f99f6a8e429710efb.jpg);
     color: black;
     cursor: pointer;
 }
   /* header部分结束 */

   /* content部分开始 */
    .latest-course,.all-course{
      display: flex;
      flex-wrap:wrap;
    }
   /* content部分结束 */

   /* footer部分开始 */
   .footer{
     display: flex;
     justify-content: space-around;
     align-items: center;
     width: 100%;
     height: 30px;
     border-top: 1px solid  #DCDCDC;
     font-size: 12px;
     font-weight: 300;
     color: grey;
   }
   .footer span{
     margin-right: 30px;
   }
   /* footer部分结束 */
</style>
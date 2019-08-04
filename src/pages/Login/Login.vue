<template>
    <div>
       <canvas id="canvas"></canvas>
        <el-form ref="form"  label-width="80px">
            <h1 style="color: #409eff">Anyview</h1>
            <el-form-item class="role">
                <el-radio-group v-model="user.roleId">
                  <el-radio-button label="1">管理员</el-radio-button>
                  <el-radio-button label="2">教师</el-radio-button>
                  <el-radio-button label="3">学生</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="账号">
                <el-input v-model="user.username" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item label="密码">
            <el-input v-model="user.password" placeholder="请输入密码" show-password></el-input>
            </el-form-item>
            <el-form-item >
                <el-select v-model="user.schoolId" placeholder="请选择您的学校">
                  <el-option v-for="(school,index) in schoolList" :key="index" :value="school.id" :label="school.schoolName"></el-option>
                </el-select>
                <el-checkbox v-model="user.switch">记住密码</el-checkbox>
            </el-form-item>
            <transition name="login">
              <el-alert
                title="登录失败"
                type="error"
                :description="errDesc"
                show-icon
                v-if='!error'
                style="margin-bottom:22px">
              </el-alert>
             </transition>
            <el-form-item class="butt">
                <el-button type="primary" @click="submit">登录</el-button>
                <el-button type="danger">忘记密码</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import global from '@/store/global'
export default {
  data () {
    return {
      error: true,
      errDesc: '',
      user: {
        roleId: 3,
        username: '',
        password: '',
        schoolId: '',
        switch: true
      },
      schoolList: [],
      userInfo: ""
    }
  },
  mounted () {
      this.socket.sendSock({type: 6,content: '获取学校列表'},this.getSchool)
    },
  methods: {
      getSchool (e) {
          this.schoolList = e.content 
      },
      getUserInfo (e) {
          if(e.type==-12){  //账号不存在
            this.error=false
            this.errDesc='信息输入错误'
            return
          }
          else{
            global.setIsLogin(true) //将全局变量glob_isLogin设为true
            this.$message({
              showClose: true,
              message: '欢迎您,'+e.content.name,
              type: 'success'
            });
            this.userInfo = e.content
            this.$router.push({   // 路由跳转并传递信息
              name: 'workSelect',
              query:{ 
                  user: JSON.stringify(this.userInfo)
              },
          })
        }
      },
      submit () {       
        for(let item in this.user){   //检查输入信息是否为空
          if(this.user[item]===''){
            switch(item){
              case 'username': this.errDesc='账号输入为空';break;
              case 'password': this.errDesc='密码输入为空';break;
              case 'schoolId': this.errDesc='未选择学校';break;
            }
            this.error=false
            return
          }
        }
        this.socket.sendSock({type: 0, content: this.user}, this.getUserInfo)
      }

  }
}
</script>

<style type="text/css">
html{
    height: 100%;
    }
        body{margin: 0;height: 100%;
            background: #fff;overflow: hidden;}
            h1{
              text-align: center;
            }
            #canvas{display: block;width: 100%;height: 100%;}
            form{
                position: absolute;
                top: 50%;
                left: 50%;
                width: 30%;
                padding: 50px;
                transform: translate(-50%,-50%); /*使元素本身向左移动宽度的一半*/
                background-color: rgba(255,255,255,0.5);
                border-radius: 8%;
                box-shadow: 0 0 12px 1px grey;
                transition: height .5s .5s;
}
/* 过渡效果开始 */
.login-enter-active, .login-leave-active {
  transition: opacity .5s;
}
.login-enter, .login-leave-to /* .fail_login-leave-active below version 2.1.8 */ {
  opacity: 0;
}
/* 过渡效果结束 */

/* 让选择栏和按钮居中 */
.role .el-form-item__content{
  margin-left: 0!important;
  text-align: center;
}
.butt .el-form-item__content{
  margin-left: 0!important;
  text-align: center;
}
</style>
<template>
    <div id="login">
       <canvas id="canvas"></canvas>
        <el-form ref="form"  label-width="80px">
            <h1 style="color: #409eff;text-align: center">Anyview</h1>
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
                  <el-option v-for="(school,index) in this.$store.state.schoolList" :key="index" :value="school.id" :label="school.schoolName"></el-option>
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
 import canvas from '../../../static/canvas.js';
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
      }    
    }
  },
  mounted () {
      canvas(60)   //执行canvas动画
      this.$store.dispatch('sendSchoolListReq')   //发送获取学校列表请求
    },
  methods: {
      checkInfo(){  //检查输入信息是否为空
        for(let item in this.user){  
          if(this.user[item]===''){
            switch(item){
              case 'username': this.errDesc='账号输入为空';break;
              case 'password': this.errDesc='密码输入为空';break;
              case 'schoolId': this.errDesc='未选择学校';break;
            }
            this.error=false
            return false
          }
        }
        return true
      },
      submit () {
        if(this.checkInfo())
          this.$store.dispatch('sendLoginReq',this.user)   //发送登录请求
          setTimeout(()=>{
            if(!localStorage.getItem('isLogin')){  //账号不存在
              this.error=false
              this.errDesc='信息输入错误'
              return
            }
            else{
              this.$router.push({   // 路由跳转
                name: 'work'
            })
          }
          },500)
      }

  }
}
</script>

<style type="text/css">
html{
    height: 100%;
    font-size: 16px;
    }
        body{margin: 0;height: 100%;}
            #canvas{display: block;width: 100%;height: 100%;}
            form{
                position: absolute;
                top: 50%;
                left: 50%;
                width: 500px;
                padding: 50px;
                transform: translate(-50%,-50%); /*使元素本身向左移动宽度的一半*/
                background-color: rgba(255,255,255,0.5);
                border-radius: 2rem;
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
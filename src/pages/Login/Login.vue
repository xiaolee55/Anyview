<template>
    <div>
       <canvas id="canvas"></canvas>
        <el-form ref="form"  label-width="80px">
            <h1 style="color: #409eff">Anyview</h1>
            <el-form-item>
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
                <el-select v-model="user.schoolId" placeholder="请选择您的学校" >
                <el-option v-for="(school,index) in schoolList" :key="index" :value="school.id">{{school.schoolName}}</el-option>
                </el-select>
                <el-checkbox v-model="user.switch">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click.once="submit">登录</el-button>
                <el-button type="danger">忘记密码</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
  data () {
    return {
      form: {},
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
      console.log(this.socket.sendSock({type: 6,content: '获取学校列表'},this.getSchool));
    },
  methods: {
      getSchool (schoolList) {
          this.schoolList = schoolList.content 
      },
      getUserInfo (userInfo) {
          //拿到学生信息
          this.userInfo = userInfo.content
          //路由跳转并传递信息
          this.$router.push({ 
            name: 'workSelect',
           query:{ 
                user: JSON.stringify(this.userInfo)
            },
        })
      },
      submit () {
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
            canvas{display: block;width: 100%;height: 100%;}
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
}
</style>
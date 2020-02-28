/* @Lee */

// 登录模块的接口

import axios from '../protocol/http'
import base from '../base'

const Login = {    
  // 登录 
  login (user) {        
      return axios.post(`${base.PROD_HTTP}/studentlogin/login`,user)
  },    
  // 退出登录
  logout () {        
      return axios.get(`${base.PROD_HTTP}/studentlogin/logout`);    
  },
  modifyPwd() {
      return axios.get(`${base.PROD_HTTP}/studentlogin/modifyPassword`);    
  },
  getSchoolList() {
      return axios.get(`${base.PROD_HTTP}/studentlogin/getSchool`);   
  }
}

export default Login;
/* @Lee */

// 作业模块的接口

import axios from '../protocol/http'
import base from '../base'

const Work = {    
  // 拿作业计划   
  getScheme (id) {        
      return axios.get(`${base.PROD_HTTP}/getschemes/getSchemes`,{
        params:{
          id
      }})
  },    
  // 拿答案 
  getExercise (exerciseId) {        
      return axios.get(`${base.PROD_HTTP}/getschemes/getExercise`,{
        params:{
          exerciseId
        }
      });    
  }
}

export default Work;
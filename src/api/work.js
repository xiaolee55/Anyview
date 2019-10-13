import {sendMsg,getMsg} from '@/api/socket'
import * as types from '@/api/config'

export function getQuestionList(content){
  sendMsg({type: types.QUESTION_LIST_TYPE,content:content})
  return getMsg()
}

export function getLogout(content){
  sendMsg({type: types.LOGOUT_TYPE,content:content})
  return getMsg()
}
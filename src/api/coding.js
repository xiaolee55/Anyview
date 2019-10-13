import {sendMsg,getMsg} from '@/api/socket'
import * as types from '@/api/config'

export function getQuestionContent(content){
  sendMsg({type: types.QUESTION_CONTENT_TYPE,content:content})
  return getMsg()
}

export function getSaveAnswerMsg(content){
  sendMsg({type: types.SAVE_ANSWER_TYPE,content:content})
  return getMsg()
}

export function getCompileMsg(content){
  sendMsg({type: types.COMPILE_TYPE,content:content})
  return getMsg()
}

export function getRunGroupMsg(content){
  sendMsg({type: types.RUN_GROUP_TYPE,content:content})
  return getMsg()
}

export function getStartDebugMsg(content){
  sendMsg({type: types.START_DEBUG_TYPE,content:content})
  return getMsg()
}

export function getStepOverMsg(content){
  sendMsg({type: types.STEP_OVER_TYPE,content:content})
  return getMsg()
}

export function getStepIntoMsg(content){
  sendMsg({type: types.STEP_INTO_TYPE,content:content})
  return getMsg()
}

export function getRepeatDebugMsg(content){
  sendMsg({type: types.REPEAT_DEBUG_TYPE,content:content})
  return getMsg()
}

export function getContinueDebugMsg(content){
  sendMsg({type: types.CONTINUE_DEBUG_TYPE,content:content})
  return getMsg()
}

export function getQuitDebugMsg(content){
  sendMsg({type: types.QUIT_DEBUG_TYPE,content:content})
  return getMsg()
}

export function getWatchPointMsg(content){
  sendMsg({type: types.SET_WATCH_POINT_TYPE,content:content})
  return getMsg()
}

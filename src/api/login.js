  
import {sendMsg,getMsg} from '@/api/socket'
import * as types from '@/api/config'

export function getSchoolMsg(content){
    sendMsg({type: types.SCHOOL_TYPE,content:content})
    return getMsg()
}

export function getLoginMsg(content){
    sendMsg({type:types.LOGIN_TYPE,content:content})
    return getMsg()
}
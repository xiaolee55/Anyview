import * as types from './mutation-types'
import Vue from 'vue'
import { stat } from 'fs'

const mutations = {
    [types.RESET_STATE](state) {
        const initialState= {
            questionList: [],        //请求下来的所有题目的集合
            courseName: "",
            currentQuestion: null,
            currentIndex: 0,
            openQuestions: new Map(),
            studentAnswer: "",
            outputData: {},
            debugData: {},
            listOpen: true,
            animation: true,
            clearOutputAuto: false,
            errorTestData: {},
            currentTestOrder: -1
        }
        Object.assign(state, initialState)
    },
    [types.SET_QUESTION_LIST](state, questionList) {
        state.questionList = questionList
    },
    [types.SET_COURSE_NAME](state, courseName) {
        state.courseName = courseName
    },
    [types.SET_LIST_OPEN](state,status) {
        state.listOpen = status
    },
    [types.SET_CURRENT_QUESTION](state,currentQuestion) {          //控制当前视口所在题目的数据
        state.currentQuestion = currentQuestion
    },
    [types.SET_CURRENT_INDEX](state,currentIndex) {          //控制当前视口所在题目的标记
        state.currentIndex = currentIndex
    },
    [types.SET_OPEN_QUESTIONS](state,openQuestions) {       //控制当前打开的所有题目的数据
        state.openQuestions = openQuestions
    },
    [types.SET_STUDENT_ANSWER](state,studentAnswer) {
        state.studentAnswer = studentAnswer
    },
    [types.SET_OUTPUT_DATA](state,{index,content,isRemove}) {        //控制输出窗口的数据
        //用解构赋值，函数调用方一定要传值，否则会报index is undefined这类错误
        if(isRemove||state.clearOutputAuto){
            Vue.delete(state.outputData,index) 
        }
        if(isRemove)
            return
        const arr = state.outputData[index] ? state.outputData[index] : []
        content ? arr.push(content) : arr.pop()
        Vue.set(state.outputData,index,arr)
    },
    [types.SET_DEBUG_DATA](state,{index,_obj}) {            //控制当前调试的数据
        // const obj = state.debugData[index] ?  state.debugData[index] : {}
        // Vue.set(obj,name,val)
        if(!_obj){
            _obj={bp:state.debugData[index].bp}
            Vue.delete(state.debugData,index)
        }
        const stateObj = state.debugData[index] ? state.debugData[index] : {}
        for(var i in _obj) {
            Vue.set(stateObj,i,_obj[i])
       }
        Vue.set(state.debugData,index,stateObj)
    },
    [types.SET_CLEAR_OUTPUT_AUTO](state,val) {
        state.clearOutputAuto = val
    },
    [types.SET_ERROR_TEST_DATA](state,{data,id,action="add"}) {   //对象中嵌套了对象则都要用set或者delete
        let stateObj={}
        if(!data)
          return
        if(action=="add"){  //一个个添加错误数据
            Object.entries(data).forEach((item)=>{
                if(item[1].slice(2))
                    Vue.set(stateObj,item[0],item[1])
            })
        }else{  //删除指定的数据
            stateObj = state.errorTestData[id]
            Vue.delete(stateObj,data)
        }
        Vue.set(state.errorTestData,id,stateObj)
    },
    [types.SET_CURRENT_TEST_ORDER](state,val) {
        state.currentTestOrder = val
    },
    [types.SET_INIT_TEST_DATA_LENGTH](state,val) {
        state.initTestDataLength = val
    },
    [types.SET_CHANGE_VARS_ARR](state,val) {
        val?state.changeVarsArr.push(val):state.changeVarsArr=[]
    },
    [types.SET_QUESTION_STATUS](state,obj) {
        const stateObj = state.questionStatus[obj.id] ?state.questionStatus[obj.id]: {}
        Object.keys(obj).forEach(index=>{
            if(typeof obj[index] != "undefined")
                Vue.set(stateObj,index,obj[index])
        })
        Vue.set(state.questionStatus,obj.id,stateObj)
    },
    [types.SET_QUESTION_DETAIL_OPEN](state,val){
        state.questionDetailOpen = val
    }
}

export default mutations
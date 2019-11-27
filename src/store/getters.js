export const questionList = (state) => {
  
  if(Array.isArray(state.questionList[0]))
    return state.questionList

  // 将获取到的一维数组格式化为二维数组，分章节，章节里面分题目
  let list=new Array()
  let tempArr= new Array()
  let temp=state.questionList[0]
  state.questionList.forEach((item,index)=>{           
    item.name=`第${index+1}题`
    item.number= index
    if(item.chapName != temp.chapName){
      list.push(tempArr)
      tempArr=new Array()
    }
    tempArr.push(item)
    temp=item
    })        
    list.push(tempArr)
    console.log(state.questionList)
    return list
} 

export const courseName = state => state.courseName

export const currentQuestion = state => state.currentQuestion ? state.currentQuestion : {}

export const openQuestionsArr = state => Array.from(state.openQuestions)

export const currentIndex = state => state.currentIndex

export const questionDescription = state => state.currentQuestion ? state.currentQuestion.description : ""

export const studentAnswer = state => state.currentQuestion ? state.currentQuestion.answer : ""

export const outputData = state => state.currentQuestion? state.outputData : ""

export const currentOutput = state => state.outputData[state.currentIndex]

export const currentDebug = state =>  state.debugData[state.currentIndex] ? state.debugData[state.currentIndex] : {}

export const listOpen = state => state.listOpen

export const varAnimation = state => state.animation

export const finishNum = state => {
  let num = 0
  state.questionList.forEach((item,index)=>{           
    if(item.firstPastTime)
      num++
  }) 
  return num
}

export const clearOutputAuto = state => currentQuestion.debugStatus? false : state.clearOutputAuto

export const errorTestData = state => state.errorTestData

export const currentErrorData = state => state.errorTestData[state.currentIndex]

export const currentTestOrder = state => state.currentTestOrder

export const initTestDataLength = state => state.initTestDataLength
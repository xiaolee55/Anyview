import * as types from './mutation-types'

const actions = {
  setStatus({commit,state},{type,status,content=null}) {
    const currentIndex = state.currentIndex
    const currentQuestion = state.currentQuestion
    const openQuestions = state.openQuestions
    if(content)
      currentQuestion.newAnswer = content
    currentQuestion[type]= status
    openQuestions.set(currentIndex,currentQuestion)
    commit(types.SET_CURRENT_QUESTION,currentQuestion)
    commit(types.SET_OPEN_QUESTIONS,openQuestions)
  },
  setOutput({commit,state},{style, label, _content=""}) {
    const index = state.currentIndex
    const date = `${new Date().getHours().toString().padStart(2,"0")}:
                  ${new Date().getMinutes().toString().padStart(2,"0")}:
                  ${new Date().getSeconds().toString().padStart(2,"0")}`
    const dataClass = label? (label.includes("失败") ? "fail-data" : "success-data") : ""    
    
    // 如果没有label，可能是调试下一步的数据，不需要label，如果没有_content，(下组数据已经增加label提示，前面句话作废)
    // 可能是单独的提示，比如编译成功，两者都没则是想要删除过渡标签
    const content = (label||_content)
                    ? `<span>
                          <span data-v-47761e58="" class="el-tag el-tag--${style} el-tag--dark">${label}</span>
                          <span class="show-time">${date}</span>
                        </span>
                        <br>
                        <span class=${dataClass}>${_content}</span>` 
                    : ""
    commit(types.SET_OUTPUT_DATA,{index,content})
  },
  clearAllCurrentData({commit,state}, index) {
    // this.
  }
}

export default actions
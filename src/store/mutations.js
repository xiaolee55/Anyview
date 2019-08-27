import { stat } from "fs";

// 只能执行同步事件
export default {
    getSchoolListRes(state,e){
        state.schoolList = e.content 
    },
    getLoginRes(state,e){
        if(e.type==-1){
           state.user=e.content
           state.isLogin=true
           window.localStorage.setItem('isLogin', true);
           window.localStorage.setItem('user', JSON.stringify(e.content));
        }
        else{
            state.isLogin=false
        }
    },
    getQuestionListRes(state,e){
        state.totalNum=e.content[0].totalNum
        state.continue_tableName=e.content[0].tableName
        let questionList=e.content[0].catalogs

        //将获取到的一维数组格式化为二维数组，分章节，章节里面分题目
        state.questionList=new Array()
        let tempArr= new Array()
        let temp=questionList[0]
        questionList.forEach(function(item,index){           
          item.name="第"+(index+1)+"题"
          if(item.chapName==temp.chapName){
            tempArr.push(item)
          }
          else{
            state.questionList.push(tempArr)
            tempArr=new Array()
            tempArr.push(item)
          }
          temp=item
          })        
          state.questionList.push(tempArr)
          // 默認打開的題目
         this.dispatch('sendQuestionContentReq',{id: state.questionList[0][0].eid, name: state.questionList[0][0].name})
    },
    getQuestionContentRes(state,e){
        this.commit('updatedQuestDesc',e.content.questionContent.questionDescription)
        //这里直接修改presentQuestion的话watch无法监听到，只能通过commit修改
        this.commit('updatePresQues',{name:state.presentQuestion.name,content:e.content})
        state.activeQuestion.push({name:state.presentQuestion.name,content:e.content}) //题目打开成功后将其存入数组，防止下次获取再次发送请求
    },
    saveAnswer(state,answer){
        state.presentQuestion.content.questionContent.studentAnswer=answer
    },
    updatePresQues(state,presentQuestion){
        state.presentQuestion=presentQuestion
    },
    updatedActiveQues (state,list) {
        state.activeQuestion=list
    },
    updatedQuestDesc (state,desc) {
        state.questionDesc=desc
    }

}
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
        state.schemeId=e.content[0].id
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
         this.dispatch('sendQuestionContentReq',{
             id: state.questionList[0][0].eid,
             name: state.questionList[0][0].name,
             pid:state.questionList[0][0].pid
            })
    },
    getQuestionContentRes(state,e){
        console.log(e);   
        //此处传入updatePresQuestion和传入updatedActiveQues的对象不能相同，否则会导致两者之间的修改互相影响
        //主要原因还未知？？？
        let name=state.presentQuestion.name
        let id=state.presentQuestion.id
        let content=e.content
        let pre={name,id,content}
        let act=JSON.parse(JSON.stringify(pre));    //深拷贝解决问题
        this.commit('updatedQuestDesc',e.content.questionContent.questionDescription)
        //这里直接修改presentQuestion的话watch无法监听到，只能通过commit修改（？？？）
        this.commit('updatePresQues',pre)
        this.commit('updatedActiveQues',act) //题目打开成功后将其存入数组，防止下次获取再次发送请求
    },
    updateAnswer(state,answer){
        // console.log(answer);
        state.presentQuestion.content.questionContent.studentAnswer=answer
    },
    updatePresQues(state,presentQuestion){
        state.presentQuestion=presentQuestion
    },
    updatedActiveQues (state,question) {
        state.activeQuestion.push(question)
    },
    updatedQuestDesc (state,desc) {
        state.questionDesc=desc
    },
    updateQuestionList(state,list){
        state.questionList=list
    }

}
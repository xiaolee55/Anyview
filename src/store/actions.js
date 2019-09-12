/*
通过mutation间接更新state的多个方法的对象，主要是执行异步函数
*/
export default{
    sendSchoolListReq(){
        this._vm.socket.sendSock({type: 6,content: '获取学校列表'}, this._mutations.getSchoolListRes[0])
    },
    sendLoginReq(store,user){
        this._vm.socket.sendSock({type: 0, content: user}, this._mutations.getLoginRes[0])
    },
    sendLogoutReq(store,user){
        this._vm.socket.sendSock({type: 5, content: user}, this._mutations.getLogoutRes[0])
    },
    sendQuestionListReq(store){
        let id=JSON.parse(localStorage.getItem('user')).id
        this._vm.socket.sendSock({type: 3, content: id}, this._mutations.getQuestionListRes[0])
    },
    sendQuestionContentReq(store,{id,name,pid}){
        //此处不能直接将id和name存进presentQuestion
        store.state.presName=name
        store.state.presId=id
        this._vm.socket.sendSock({type: 4, content: id}, this._mutations.getQuestionContentRes[0])
    }
}

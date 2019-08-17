// 只能执行同步事件
import * as socket from '@/api/websocket'
export default {
    setIsLogin(state,isLogin){
        window.localStorage.setItem('isLogin', true);
        state.isLogin=isLogin
    },
    setUser(state,user){
        window.localStorage.setItem('user', user);
        state.user=JSON.parse(user)
    },
    sendQuestListReq(state){
        // socket.sendSock({type: 3, content: state.user.id}, this.getQuestList)
    },
    getQuestList(e){
        console.log(e)
    }
}
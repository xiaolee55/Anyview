import { resolve } from "url";
import { rejects } from "assert";

let websocket = null;
const IP = '139.159.186.173'  
// 101.132.148.120
let port = '8889';	//webSocket连接端口
let close=false
let backData = true
function initWebSocket(){ //初始化websocket
    var url = `ws://${IP}:${port}/anyview`;
    websocket = new WebSocket(url);
    websocket.onclose = function(e){
        close=true
        const ifReload = window.confirm("与服务器的连接已断开，是否刷新重连?");
        ifReload? window.location.reload(): ''
        console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
    }
    websocket.onopen = function () {
	    console.log("连接成功");
	}
	websocket.onerror = function () {
		console.log("WebSocket连接发生错误");
    }
}

//发送消息
function sendMsg(data){
    // if(backData==false)
    //     return
    // console.log(data)
    if (websocket.readyState === websocket.OPEN) {
        //若是ws开启状态
        // backData=false   //如果发送了消息但是还没有返回，则不能再发送其他消息
        console.log("send",data)
        websocket.send(JSON.stringify(data),data)
    }else {
        // 若未开启 ，则等待1s后重新调用
        if(!close)
        setTimeout(()=>{
            sendMsg(data)
        }, 1000);
    }
}

//接收消息
function getMsg(){
    return new Promise((resolve,reject)=>{
        websocket.onmessage=(e)=>{
            backData=true
            resolve(JSON.parse(e.data))
        }
    })
}
 
initWebSocket();
 
export{sendMsg,getMsg}
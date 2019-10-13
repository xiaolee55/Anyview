import { resolve } from "url";
import { rejects } from "assert";

let websocket = null;
let serverPort = '5000';	//webSocket连接端口
let close=false
function initWebSocket(){ //初始化websocket
    var url = 'ws://101.132.120.137:8889/anyview';
    websocket = new WebSocket(url);
    websocket.onclose = function(e){
        close=true
    	console.log("connection closed (" + e.code + ")")
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
    // console.log(data)
    if (websocket.readyState === websocket.OPEN) {
        //若是ws开启状态
        websocket.send(JSON.stringify(data))
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
            resolve(JSON.parse(e.data))
        }
    })
}
 
initWebSocket();
 
export{sendMsg,getMsg}
// var websocket = null;
// var global_callback = null;
// var serverPort = '5000';	//webSocket连接端口
 
 
// function getWebIP(){
// 	var curIP = window.location.hostname;
// 	return curIP;
// }
 
// function initWebSocket(){ //初始化websocket
//     //ws地址101.132.120.137   2019081105
//     var url = 'ws://101.132.120.137:8889/anyview';
//     websocket = new WebSocket(url);
//     websocket.onmessage = function(e){
//     	socketOnmessage(e);
//     } 
//     websocket.onclose = function(e){
//     	socketOnclose(e);
//     }
//     websocket.onopen = function () {
// 	    socketOnopen();
// 	}
// 	websocket.onerror = function () {
// 		console.log("WebSocket连接发生错误");
// 	}
// }
 
// // 实际调用的方法
// function sendSock(agentData,callback){
//     global_callback = callback;
//     if (websocket.readyState === websocket.OPEN) {
//     	//若是ws开启状态
//         socketSend(agentData)
//     }else if (websocket.readyState === websocket.CONNECTING) {
//     	// 若是 正在开启状态，则等待1s后重新调用
//         setTimeout(function () {
//         	sendSock(agentData,callback);
//         }, 1000);
//     }else {
//     	// 若未开启 ，则等待1s后重新调用
//         setTimeout(function () {
//             sendSock(agentData,callback);
//         }, 1000);
//     }
// }
 
// //数据接收
// function socketOnmessage(e){
//     global_callback(JSON.parse(e.data));
// }
 
// //数据发送
// function socketSend(agentData){
//     websocket.send(JSON.stringify(agentData));
// }
 
// //关闭
// function socketOnclose(e){  
//     console.log("connection closed (" + e.code + ")");
// }
 
// function socketOnopen(e){
// 	console.log("连接成功");
// }
 
// initWebSocket();
 
// export{sendSock,socketOnclose}
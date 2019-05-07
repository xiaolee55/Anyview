var topicTitle=document.getElementById("topicTitle");
var topicContent=document.getElementById("topicContent");
var e1=document.getElementById("e1");
var e2=document.getElementById("e2");
var show=document.getElementById("show");
var editor=document.getElementById("editor");
var edHead=document.getElementById("edHead");
var edMain=document.getElementById("edMain");
var edHead_child=edHead.getElementsByTagName('div');
var nowTitle=edHead_child[0];
var stack=document.getElementById("stack");
var visual=document.getElementById("visual");
var openList=document.getElementById("openList");
var title=topicTitle.getElementsByTagName("a");
var toolBar=document.getElementById("toolBar");
var toolBarList=document.getElementById("toolBarList");
var handleBar=document.getElementById("handleBar");
var k=4;

//操作栏长度自适应
handleBar.style.length=topicContent.offsetWidth+"px";

//拉伸工具栏
toolBar.onclick=function(){
    if(toolBar.style.right==0||toolBar.style.right==0+"px"){
        toolBar.style.right="120"+"px";
        toolBarList.style.right=0;
    }
    else{
        toolBar.style.right=0;
        toolBarList.style.right="-120"+"px";
    }
    console.log(toolBar.style.right);
    
}

//使用切换类名的方式更改题目状态,有已完成，未完成，未开始三种状态
for(let i=0;i<title.length;i++){
    if(i%4==0)
        title[i].classList.add("correct");
    else if(i%5==0)
        title[i].classList.add("error");
}

//点击题目栏的题目，更改内容区以及已打开题目区
topicTitle.onclick=function(){
    if(edHead.childNodes.length>14)
        return;
    console.log(edHead.childNodes.length);
    
   var newDiv=document.createElement("div");
   var newSpan=document.createElement("span");
   var newI=document.createElement("i");
   newDiv.id="t"+k++;
   for(var i=0;i<edHead.childNodes.length;i++){
       if( edHead.childNodes[i].className=="thisTitle"){       
         edHead.childNodes[i].className="";
        }
   }
   newDiv.className="thisTitle";
   newSpan.className="editor-span";
   newSpan.innerText=event.target.innerText;
   newI.className="editor-i";
   newI.innerText="X";
   newDiv.appendChild(newSpan);
   newDiv.appendChild(newI);
   edHead.appendChild(newDiv); 
}


//管理所有打开题目的状态
edHead.onclick=function(){
    if(event.target.tagName=="DIV")
     return;
    //点击X时删除当前题目
    if(event.target.className=="editor-i"){       
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      return;
    }
    //切换题目
    if(event.target.parentNode.id!=nowTitle.id){
        event.target.parentNode.className="thisTitle";
        nowTitle.className="";
        nowTitle=event.target.parentNode;
         console.log(111);
         
    }
}
// var vue=new Vue({
//     el : '#edMain',
//     data : {
//         msg:  content
//         }
// })
//控制题目列表伸缩
openList.onclick=function(){
    if(topicTitle.offsetLeft==0){
        topicTitle.style.left=-topicTitle.offsetWidth+"px"; 
        e1.style.backgroundColor='#F5F5F5';
        e2.style.backgroundColor='#F5F5F5';
        topicContent.style.backgroundColor='rgba(255,255,255,1)';

    } 
    else{
        topicTitle.style.left=0;
        e1.style.backgroundColor='rgba(0,0,0,0)';
        e2.style.backgroundColor='rgba(0,0,0,0)';
        topicContent.style.backgroundColor='rgba(0,0,0,0.5)'  
    }
}

//嵌入ACE编辑器
var editor = ace.edit("edMain");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

//分割平面
Split(['#topicContent','#show'], {
    sizes: [20,80],
    minSize: 10,
    cursor: "w-resize"
});  
Split(['.editor', '.stack', '.visual'], {
    sizes: [80,10,10],
    minSize: 0,
    snapOffset: 20,
    gutterSize: 5,
    cursor: "w-resize"
});  
Split(['.head','.out-in'], {
    direction: 'vertical',
    sizes: [95,5],
    cursor: "s-resize"
});  
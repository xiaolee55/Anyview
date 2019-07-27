<template>
  <div class="father">
      <!-- <div class="cycle"></div> -->
        <div class="question-list" ref="questList">
          <h3>{{questListName}}</h3>
          <button @click="common('input')">3</button>
          <button @click="test">测试</button>
          <el-collapse>
            <el-collapse-item :title="`第${index+1}章`" v-for="(chap,index) in questions" :key="index" class="collapse-font">
              <div v-for="(question,i) in chap" :key="i" class="question-name" @click="sendQuestContentReq(question.eid,question.name)">
                <el-checkbox v-model="checked" style="margin-right: 3px"></el-checkbox>
                <span>{{question.name}}</span>
              </div>
            </el-collapse-item>
          </el-collapse>    
          <div class="close-btn"><el-button @click="hideQuestList" >关闭</el-button></div>
        </div>
    <splitpanes class="default-theme"  :push-other-panes="true" watch-slots>
      <div splitpanes-size="20" class="question-content">
        <div class="question-menu-top">
          <i class="iconfont icon-zidingyi"></i>
          <i class="iconfont icon-geren13" style="margin-left:20px;cursor:pointer" ></i>
          <i class="iconfont icon-list_icon" style="cursor:pointer" @click="showQuestList"></i>
        </div>
         <div class="question-desc"><p>{{questDesc}}</p></div>
         <div class="question-menu-bottom">
          <el-button type="primary" round style="margin-right:20px">上一题</el-button>
           <el-button type="primary" round style="margin-right:20px">下一题</el-button>
        </div>
      </div>
      <splitpanes horizontal :push-other-panes="true" splitpanes-size="60" watch-slots>
        <el-tabs v-model="editableTabsValue" type="card" closable splitpanes-size="85" class="code-pane" @tab-remove="removeTab">
            <el-tab-pane
              v-for="item in editableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            >
               <ace v-model="msg.questionContent.studentAnswer" ref="ace" @createBP="createBP">
               </ace>
              <div class="funMenu"  @mousedown="mouseEvent('down')" @mouseup="mouseEvent('up')">
                  <ul class="horizontal-list">
                    <li v-for="item in horFunIcon" :key="item.name"><i :class="item.class" :title="item.title"  @click="common(item.name)"></i></li>
                  </ul>
                  <transition name="verList">
                   <transition-group tag="ul" class="vertical-list" v-if="showVerList">
                    <li v-for="item in verFunIcon" :key="item.name"><i :class="item.class" :title="item.title" @click="common(item.name)"></i></li>
                   </transition-group>
                </transition>             
              </div> 
            </el-tab-pane>
        </el-tabs> 
        <div splitpanes-size="15">
           执行状态：<span class="showStyle success">{{compileRes}}</span><br><br>
           {{runRes}}
           <span class="showStyle success">{{debugRes}}</span>
        </div>
      </splitpanes>
        <div splitpanes-size="10"><el-tree :data="data" :props="defaultProps"></el-tree></div>
        <div splitpanes-size="10"></div>
    </splitpanes>
  </div>
</template>

<script>
import Splitpanes from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import ace from '../../components/aceEditor.vue'
let ace_layer=document.querySelector(".ace_layer");
export default {
    created () {
      this.user=JSON.parse(this.$route.query.user)
      this.sendQuestListReq()
    },
    data () {
      return {
        horFunIcon:[
          {name:'compile',class:'iconfont icon-bianyi',title:'编译'},
          {name:'runGroup',class:'iconfont icon-polygon',title:'运行'},
          {name:'startDebug',class:'iconfont icon-tiaoshi',title:'调试'},
          {name:'stepInto',class:'iconfont icon-xiayibu',title:'下一步(进入函数)'},
          {name:'more',class:'iconfont icon-gengduo',title:'更多'},
        ],
        verFunIcon:[
          {name:'runSiginal',class:'iconfont icon-danzuyunxing',title:'单组运行'},
          {name:'quitDebug',class:'iconfont icon-tingzhi',title:'停止调试'},
          {name:'continueDebug',class:'iconfont icon-jixu',title:'继续调试'},
          {name:'stepOver',class:'iconfont icon-down',title:'下一步(不进入函数)'},
          {name:'repeatDebug',class:'iconfont icon-zhongfujianli',title:'重复调试'},
          {name:'fillScreen',class:'iconfont icon-quanping',title:'全屏'},
        ],
        showVerList: false,
        data: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        bpRow: '',
        activeIcon:{
          compile: 1,
          run: 1,
          debug: 1,
          nextStep: 1,
          more: 1
        },
        editableTabsValue: '1',
        editableTabs: [],
        tabIndex: 0 ,
        questListName: '',
        user: {},
        questions: [],
        checked: true,
        msg:{
          questionFullName: '',
          config: '',
          questionContent: '',
          questionHeaderFiles: ''
        },
        questDesc: '',
        studentAnswer: '',
        fileName: '',
        compileRes: '...',
        runRes: '...',
        debugRes: '...'
      }
    },
    methods: {
      test(){
        let quesC=document.getElementsByClassName("question-content")[0]
        console.log(quesC);    
      quesC.addEventListener('scroll', this.handleScroll)  
      },
      handleScroll(){
        console.log(quesC.scrollTop);  
      },
      common(flag){  //所有按钮的总入口
        let sendMsg=''
        let fun=''
        switch(flag){
          case 'compile':
            sendMsg={
              type: 10,
              content: this.msg 
            }
            fun=this.getCompileRes
            break;

          case 'runGroup':
            sendMsg={
              type: 161,
              content: {
                questionFullName: this.msg.questionFullName
              }
            }
            fun=this.getRunGroupRes
            break;

          case 'runSiginal':
            sendMsg={
              type: 11,
              content:{
                questionFullName: this.msg.questionFullName
              }
            }
            fun=this.getRunSiginalRes
            break;

          case 'startDebug':
            sendMsg={
              type: 1,
              content: {
                bp: this.bpRow.substring(1),
                questionFullName: this.msg.questionFullName
              } 
            }
            fun=this.getStartDebugRes
            break;
            
          case 'stepInto':
            sendMsg={
              type: 2,
              content: {
                bp: this.bpRow.substring(1),
                questionFullName: this.msg.questionFullName
              } 
            }
            fun=this.getStepIntoRes
            break;

          case 'stepOver':
            sendMsg={
              type: 121,
              content: {
                bp: this.bpRow.substring(1),
                questionFullName: this.msg.questionFullName
              } 
            }
            fun=this.getStepOverRes
            break;

          case 'quitDebug':
            sendMsg={
              type: 141,
              content: {
                bp: this.bpRow.substring(1),
                questionFullName: this.msg.questionFullName
              } 
            }
            fun=this.getQuitDebugRes
            break; 

          case 'continueDebug':
            sendMsg={
              type: 191,
              content: {
                bp: this.bpRow.substring(1),
                questionFullName: this.msg.questionFullName
              } 
            }
            fun=this.getContinueDebugRes
            break;

            case 'input':
              sendMsg={
                type: 181,
                content: {
                  inputString:'3'
                  }
              }
              fun=this.getInputRes
              break;
          case 'repeatDebug':
            break;
          case 'fillScreen':
            break; 
          case 'more':
            this.showVerList=!this.showVerList
            break;
        }
        this.sendReq(sendMsg,fun)
      },
      sendReq(sendMsg,fun){
        if(sendMsg===''&&fun==='')
        return
        console.log(sendMsg);
         this.socket.sendSock(sendMsg,fun)
      },
      getCompileRes(e){
        this.compileRes=e.content
      },
      getRunGroupRes(){

      },
      getRunSiginalRes(e){
        // console.log(e);
        
      },
      getStartDebugRes(){

      },
      getStepOverRes(){

      },
      getStepIntoRes(){

      },
      getQuitDebugRes(e){
        // console.log("停止调试"+e);
      },
      getContinueDebugRes(){

      },
      getInputRes(e){
        // console.log(e);
      },
      createBP(){   //添加或者移除断点（用了lowB的DOM操作）
        if(event.target.tagName==="CANVAS")
          event.target.parentNode.removeChild(event.target)
        if(event.target.classList.contains("ace_gutter-cell")){
            this.bpRow+=`,${event.target.innerText}`    //获取行号
            let canvas=document.createElement("canvas")
            // canvas.id='cv'+(this.bpRow+1)
            canvas.width='49'
            canvas.height='17'
            event.target.appendChild(canvas);
            let bp=canvas.getContext("2d");
            bp.fillStyle="#FF0000";
            bp.beginPath();
            bp.arc(25,8,5,0,Math.PI*2,true);
            bp.closePath();
            bp.fill();
            // bp.clearRect(0,0,canvas.width,canvas.height);
        }
      },
      mouseEvent(flag){   //设置图标被点击时的样式改变
        if(event.srcElement.tagName==="I"){
            switch(event.srcElement.title){
              case "编译": (flag==="down")?this.activeIcon.compile=0.5:this.activeIcon.compile=1;break;
              case "运行": (flag==="down")?this.activeIcon.run=0.5:this.activeIcon.run=1;break;
              case "调试": (flag==="down")?this.activeIcon.debug=0.5:this.activeIcon.debug=1;break;
              case "下一步": (flag==="down")?this.activeIcon.nextStep=0.5:this.activeIcon.nextStep=1;break;
              case "更多": (flag==="down")?this.activeIcon.more=0.5:this.activeIcon.more=1;break;
            }
        }
      },
      getQuestList: function(e){   //拿到题目列表并进行格式化
        this.questListName=e.content[0].tableName
        //将获取到的一维数组格式化为二维数组，分章节，章节里面分题目
        let that=this
        that.questions=new Array()
        let tempArr= new Array()
        let temp=e.content[0].catalogs[0]
        e.content[0].catalogs.forEach(function(item,index){           
          item.name="第"+(index+1)+"题"
          if(item.chapName==temp.chapName){
            tempArr.push(item)
          }
          else{
            that.questions.push(tempArr)
            tempArr=new Array()
            tempArr.push(item)
          }
          temp=item
          // console.log(item.chapName.match(/\d+/g)[0]-1);
          })
          this.questions.push(tempArr)
          // 默認打開的題目
         this.sendQuestContentReq(this.questions[3][0].eid,this.questions[3][0].name)
      },
      sendQuestListReq: function() {  //发送题目列表请求
        this.socket.sendSock({type: 3, content: this.user.id}, this.getQuestList)
      },
      getQuestContent(e){  //获取题目内容
        this.msg.questionContent=e.content.questionContent
        this.msg.questionHeaderFiles=e.content.questionHeaderFiles
        this.msg.questionFullName=e.content.questionFullName
        this.msg.config=e.content.config
        this.fileName=e.content.questionContent.mainFileName
        this.questDesc=e.content.questionContent.questionDescription
        this.studentAnswer=e.content.questionContent.studentAnswer
        this.$refs.ace[this.tabIndex-1].aceEditor.setValue(this.studentAnswer,1) /*将头文件写入编辑器中*/
      },
      sendQuestContentReq(questionId,questionName) {   //发送题目内容请求
        this.socket.sendSock({type: 4, content: questionId}, this.getQuestContent)
        this.addTab(questionName)
      },
      handleChange(val) {
      },
      showQuestList(){
          this.$refs.questList.style.left='0'
      },
      hideQuestList(){
          this.$refs.questList.style.left='-20%'
      },
      addTab(targetName) {      //增加标签
        let flag = this.editableTabs.every((item)=>{  //是否点击了重复标签
          if(item.title===targetName)
            return false
          else
            return true
        })
        if(flag){         
          let newTabName = ++this.tabIndex + '';
          let newTab = { 
            title: targetName,
            name: newTabName,
          }
          this.editableTabsValue = newTabName;
          this.editableTabs.push(newTab);         
        }else{
            for(let i=0;i<this.editableTabs.length;i++){
              if(this.editableTabs[i].title==targetName){
                  this.editableTabsValue = this.editableTabs[i].name
                  break
              }
          }
        }
      },
      removeTab(targetIndex) {    //关闭标签
          let activeName=this.editableTabsValue;
          let tabs=this.editableTabs;
          if(tabs.length==1)
            return;
          if (activeName === targetIndex) {
            tabs.forEach((tab, index) => {
              if (tab.name === targetIndex) {
                let nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                  activeName = nextTab.name;
                }
              }
            });
        }
        this.editableTabsValue = activeName;
        this.editableTabs = tabs.filter(tab => tab.name !== targetIndex);
        this.tabIndex--;
      }
    },
   components: {
      Splitpanes,
      ace
   },
   watch: {
   }
}
</script>

<style>
/*基本样式开始*/
  html{
    height: 100%;
    /* overflow:hidden; */
}
body{
    height: 100%;
    font: 500 16px/25px "Microsoft yahei";
    margin: 0;
    padding: 0;
}
ul{
   white-space:nowrap;
   list-style: none;
   padding: 0;
}
  .father{
    height: 100%;
    width: 100%;
  }
.splitpanes.default-theme .splitpanes__pane{
    background-color: white;
  }
/*基本样式结束*/

/* 问题内容板块开始 */
.question-content{
     position: relative;
     height: 100%;
     overflow-y: scroll;
     overflow-x: hidden;
}
.assist{
  position: fixed;
  height: 100%;
}
.question-desc{
  position: absolute;
  top: 5%;
  height: 0;
  width: 100%;
  height: 100%;
}
.question-desc p{
 border: #888888 1px solid; 
 margin: 10px;
 padding: 10px;
}
.question-menu-top,.question-menu-bottom{
  position: absolute;
  /* position: fixed; */
  left: 0;
  width: 100%;
  height: 5%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.question-menu-top{
  top: 0;
  padding-top: 10px;
}
.question-menu-bottom{
  bottom: 0;
  padding-bottom: 10px;
}
/* 问题内容板块结束 */

/* 问题列表开始 */
.question-list{
     position: fixed;
     height: 95%;
     width: 13%;
     left: -20%;
     padding: 30px;
     transition: all 0.8s;
     background-color: white;
     box-shadow: 5px 5px 5px #888888;
     overflow: auto;
     z-index: 999;
}
.question-name{
  padding: 5px 5px; 
  cursor: pointer;
}
.question-name:hover{
    background-color: #f5f7fa;
    color: #409eff;
}
.el-collapse-item__header{
  font-size: 18px;
}
.close-btn{
  position: absolute;
  top: 1%;
  right: 4%;
}
/* 问题列表结束 */

/* 编码面板开始 */
canvas{
  position: absolute;
  left: -10px;
  z-index: 33;
}
.cycle{
  position: fixed;
  background-color: #a94442;
  border-radius: 50%;
  height: 15px;
  width: 15px;
  top: 500px;
  left: 500px;
}
.code-pane{
  position: relative;
  /* height: 100%; */
}
.funMenu{
  position: absolute;
  width: 100%;
  height: 25px;
  top: 0;
}
.funMenu i:hover{
  background-color: rgba(255,255,255,0.5)
}
.horizontal-list{
  height: 30px;
  margin: 0;
  margin-right: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end

}
.horizontal-list li{
  float: right;
}
.vertical-list{
  width: 14px;
  float: right;
  margin: 0;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}
.vertical-list i{
  margin: 0;
}
.el-tabs__header{
  margin-bottom: 3px;
}
/* .el-tabs__content,.el-tab-pane{
      height: 100%;
} */
.showStyle{
  padding: 5px 20px;
  margin: 5px;
   white-space: pre-wrap;
}
.fail{
  background-color: #f2dede;
  color: #a94442;
}
.success{
  color: #67C23A;
}
.ace_gutter-cell,#breakPoint{
  cursor: pointer;
}

/* 过渡效果开始 */
.verList-enter,.verList-leave-to{
   transform: translateY(0);
   opacity: 1;
}
.verList-enter-active, .verList-leave-active {
  transition: all .5s;
}
.verList-enter, .verList-leave-to {
   transform:translateY(-30px);
   opacity: 0;
}
/* 过渡效果结束 */

/* 编码面板结束 */
</style>

<template>
  <!-- 此处{{content}}不要换行，否则会给编辑区自动加上换行符 -->
  <div class="ace-container" ref="ace">{{content}}
  <div class="debug-highlighted" ref="dbhl"></div>
  </div>
</template>


<script>
  import ace from 'ace-builds'
  import 'ace-builds/webpack-resolver' // 在 webpack 环境中使用必须要导入
  import 'ace-builds/src-noconflict/theme-monokai' // 默认设置的主题
  import 'ace-builds/src-noconflict/mode-javascript' // 默认设置的语言模式
  import 'ace-builds/src-noconflict/ext-language_tools.js'

  export default {
    mounted () {
      //基本设置
      this.aceEditor = ace.edit(this.$refs.ace, {
        fontSize: this.fontSize, 
        theme: `ace/theme/${this.theme}`, 
        mode: `ace/mode/${this.mode}`, 
        tabSize: 2,
        enableBasicAutocompletion: true,
				enableSnippets: true,
        enableLiveAutocompletion: true
      })
      let editor = this.aceEditor
      let _this  = this
      //监听断点事件
      this.aceEditor.on("guttermousedown", function(e){
          const target = e.domEvent.target; 
          const row = e.getDocumentPosition().row 
          //如果不是点击边栏或者点击到箭头，则不执行下面
          if(!target.className.includes("ace_gutter-cell")||target.className.includes("icon-kongxinjiantou")) 
            return
          else if(target.className.includes("icon-duandian")){  //如果是重复点击红色点，则清除该断点
            _this._clearBreakpoint(row)  
            e.stop()
            return  
          }else{            //添加断点
            if (e.clientX > 45 + target.getBoundingClientRect().left) 
              return;
            _this._setBreakpoint(row,"iconfont icon-duandian")
            e.stop()
          }
          //更新断点数据
            _this.updataBPData(e.editor.session.getBreakpoints())
      }) 
      //监听编辑器的改变,修改断点位置
      this.aceEditor.on("change",(e)=>{
        if(e.lines.length<=1)
          return
        let changeVal
        if(e.action == "insert"){
          changeVal = e.lines.length-1
        }else if(e.action == "remove"){
          changeVal = -e.lines.length+1
        }
        this._changeBreakPoint(changeVal,e.start.row)
        if(this.debugStatus){ //如果是调试开启状态，则也要修改高亮行位置
         this._changeMarkLine(this.beforeLine+changeVal)
        }
      })
      //监听输入
      this.aceEditor.on('input', () => {    //将change换成input则原来的bug就没有了，原来题目切换的时候也会出现圆点
        this.beforeContent = this.aceEditor.getValue()
        this.$emit('changeContent', this.aceEditor.getValue())
      })
      //绑定键位
      const bindKey=(name,winKey,macKey,callBack)=> {
        const obj={}
        obj.name=name
        obj.bindKey={}
        obj.bindKey.win = winKey
        obj.bindKey.mac = macKey
        obj.exec = callBack
        this.aceEditor.commands.addCommand(obj)
      }
      bindKey("save","Ctrl-S","Command-S",this.save)
      bindKey("compile","F5","F5",this.compile)
      bindKey("runGroup","F7","F7",this.runGroup)
      bindKey("debug","F8","F8",this.debug)
      
      this.lineHeight=this.aceEditor.renderer.lineHeight
    },
    data () {
      return {
      }
    },
    props: {
      theme: {
        type: String,
        default: "katzenmilch"
      },
      fontSize:{
        type: Number,
        default: 15
      },
      mode:{
        type: String,
        default: "c_cpp"
      },
      content: {
        type: String,
        default: ""
      },
      debugLine: {
        type: Number,
        default: -1
      },
      debugStatus: {
        type: Boolean,
        default: false
      }
      
    },
    methods: {
      _setBreakpoint(row,style) {
        this.aceEditor.session.setBreakpoint(row,style)
      },
      _clearBreakpoint(row) {
         row
         ?this.aceEditor.session.clearBreakpoint(row)
         :this.aceEditor.session.clearBreakpoints()
      },
      _changeBreakPoint(changeVal,startRow){
        //把原断点清空，再重新添加断点
        const session = this.aceEditor.session
        let breakPoints = Object.keys(session.getBreakpoints())   //获取断点的键
        let pointStyle = Object.values(session.getBreakpoints())  //获取断点的样式
        let newbreakPoints = breakPoints.map((item)=>{    //更新各个断点的行号并存入一个数组
          let _item = Number(item)
          if(_item>startRow)
            return _item+changeVal 
          else
            return _item
        })
        this._clearBreakpoint()     //清除旧断点
        newbreakPoints.forEach((item,i)=>{    //设置新断点
          this._setBreakpoint(item,pointStyle[i])
        })
        this.updataBPData(session.getBreakpoints())   //更新断点数据
      },
      _setMarkLine(row, style) {
        return this.aceEditor.session.addMarker(new ace.Range(row, 0, row, 2000),style,"fullLine", false);
      },
      _removeMarkLine(mark) {
        this.aceEditor.getSession().removeMarker(mark)
      },
      _changeMarkLine(line) {
        let startPointLine
        let points = this.aceEditor.session.getBreakpoints()
        points.forEach((item,i)=>{  //删除跟随高亮行的箭头，防止删除红色断点
          if(i==this.beforeLine&&item.includes('icon-kongxinjiantou'))
            this._clearBreakpoint(this.beforeLine)
          if(i==line&&item.includes('icon-duandian'))    //如果跟随高亮行的箭头和断点重合，则保留断点显示
            startPointLine = i
        })
        this._removeMarkLine(this.mark)
        if(line-1>0){
          this.beforeLine = line      //保留当前高亮行所在行号用以移动行号
          this.mark = this._setMarkLine(line,"debug-line")  //保留高亮标记用以下次删除         
          if(!startPointLine)
            this._setBreakpoint(line,"iconfont icon-kongxinjiantou")
        } 
      },
      updataBPData(bpRows){
        this.bpRows = bpRows
        if(!bpRows)
          return
        let arr=[]  
          bpRows.forEach((_,index)=>{
            arr.push(index+1)
          })
          this.$emit("setBP",arr)
      },
      save() {
        this.$emit('save', this.aceEditor.getValue())
      },
      compile() {
        this.$emit('compile')
      },
      runGroup() {
        this.$emit('runGroup')
      },
      debug() {
        this.$emit('debug')
      }

    },
    watch: {
      content(value) {
        if (this.beforeContent !== value) {   //还未开始输入代码时这里会执行，即刚打开题目时执行
          this.aceEditor.setValue(value,1)
        }
      },
      fontSize(val){
        if(val)
          this.aceEditor.setFontSize(val)
      },
      theme(val){
        if(val)
          this.aceEditor.setTheme(`ace/theme/${val}`)        
      },
      debugLine(val) {
        this.aceEditor.gotoLine(val-1)
        this._changeMarkLine(val-1)
      },
      debugStatus(val) {
        if(!val){
          this.beforeLine = -1
          this.mark = ''
        }
      }
    },
    computed: {
      lineHeight:{
        get() {
          return this.aceEditor.renderer.lineHeight
        },
        set() {
          console.log();
        }
      }
    },
  }
</script>

<style>
.ace-container {
  width: 100%;
}
.debug-line {   /*高亮行*/
  background:  rgb(252,215,207);
  position: absolute;
  z-index: 50;
}
.ace_gutter-cell.icon-duandian:before,
.icon-kongxinyuan:before,
.icon-kongxinjiantou:before{ /*断点*/
  font-size: 14px;
  position: absolute;
  left: 3px;
  top: 2px;
}
</style>
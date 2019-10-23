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
        console.log(e)
          const target = e.domEvent.target; 
          const row = e.getDocumentPosition().row 
          if(!target.className.includes("ace_gutter-cell"))
            return
          else if(target.className.includes("iconfont")){
            e.editor.session.clearBreakpoint(row)
            e.stop()
            return  
          }else{
            if (e.clientX > 45 + target.getBoundingClientRect().left) 
              return; 
            e.editor.session.setBreakpoint(row,"iconfont icon-duandian")
            e.stop()
          }
            _this.updataBP(e.editor.session.getBreakpoints())
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
      }
      
    },
    methods: {
      updataBP(bpRows){
        if(!bpRows)
          return
        let arr=[]  
        console.log(bpRows)
          bpRows.forEach((_,index)=>{
            arr.push(index+1)
          })
          this.$emit("setBP",arr)
      },
      save() {
        console.log(this.aceEditor.getValue())
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
        this.aceEditor.gotoLine(val-1);
        this.aceEditor.getSession().removeMarker(this.mark)
        if(val>0){
           this.mark = this.aceEditor.session.addMarker(new ace.Range(val-1, 0, val-1, 2000),"debug-line","fullLine", false);
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
.ace_gutter-cell.icon-duandian:before{ /*断点*/
  font-size: 14px;
  position: absolute;
  left: 3px;
  top: 2px;
}
</style>
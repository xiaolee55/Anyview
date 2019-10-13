<template>
  <div class="ace-container" ref="ace" @click="updataBP">
    {{content}}
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
        enableLiveAutocompletion: true,
      })
      //取消默认事件
      this.aceEditor.on("guttermousedown", function(e) {e.stop()},true);    //禁止gutter上的mousedown事件
      //监听输入
      this.aceEditor.on('input', () => {    //将change换成input则原来的bug就没有了，原来题目切换的时候也会出现圆点
        this.beforeContent = this.aceEditor.getValue()
        this.$emit('changeContent', this.aceEditor.getValue())
      })
      //绑定键位
      this.aceEditor.commands.addCommand({
        name: "save",
        bindKey:{
          win: 
          'Ctrl-S', 
          mac: 
          'Command-S' 
        },
        exec: this.getVal
        })
        this.lineHeight=this.aceEditor.renderer.lineHeight

    },
    data () {
      return {
        bpRow: []
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
      updataBP(){  //添加或者移除断点（用了lowB的DOM操作
        const target = event.target
        if(target.tagName==="CANVAS"){
          this.bpRow = this.bpRow.filter((item,index)=>item!=target.parentNode.innerText)  
          target.parentNode.removeChild(event.target)
          this.$emit("setBP",this.bpRow)
        }
        if(target.classList.contains("ace_gutter-cell")){
            this.bpRow.push(event.target.innerText)    //获取行号
            const canvas=document.createElement("canvas")
            // canvas.id='cv'+(this.bpRow+1)
            canvas.width=49
            canvas.height=this.lineHeight
            target.appendChild(canvas);
            let bp=canvas.getContext("2d");
            bp.fillStyle="#FF0000";
            bp.beginPath();
            bp.arc(25,8,5,0,Math.PI*2,true);
            bp.closePath();
            bp.fill();
            // bp.clearRect(0,0,canvas.width,canvas.height);
          this.$emit("setBP",this.bpRow)
        }
      },
        getVal() {
          this.$emit('getVal', this.aceEditor.getValue())
        },
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
  .ace_editor{
    width: 100%;
    height: 100%;
  }
  .debug-line {
    background:  rgba(255,10,10,0.5);
    position: absolute;
    z-index: 1000;
  }
</style>
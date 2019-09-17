
<template>
  <div class="ace-container" ref="ace" @click="setBP" >
    <!-- 官方文档中使用 id，这里禁止使用，在后期打包后容易出现问题，使用 ref 或者 DOM 就行 -->
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
      this.aceEditor = ace.edit(this.$refs.ace, {
        autoScrollEditorIntoView: false,
        fontSize: this.fontSize, 
        theme: `ace/theme/${this.theme}`, 
        mode: `ace/mode/${this.mode}`, 
        tabSize: 4,
        enableBasicAutocompletion: true,
				enableSnippets: true,
        enableLiveAutocompletion: true,
      })
      this.aceEditor.on("guttermousedown", function(e) {e.stop()},true);    //禁止gutter上的mousedown事件
      this.aceEditor.on('change', () => {
        this.beforeContent = this.aceEditor.getValue()
        this.$emit('changeContent', this.aceEditor.getValue())
      })
      this.lineHeight=this.aceEditor.renderer.lineHeight
    },
    data () {
      return {
        aceEditor: null,
        themePath: 'ace/theme/katzenmilch', // 不导入 webpack-resolver，该模块路径会报错
        modePath: 'ace/mode/c_cpp' ,// 同上,
        lineHeight: ''
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
      }
      
    },
    methods: {
        setBP(){
          this.$emit('createBP');
        }
    },
    watch: {
      content(value) {
        if (this.beforeContent !== value) {
          this.aceEditor.setValue(value, 1)
        }
    }
    },
  }
</script>

<style>
.ace-container{
  height: 300%!important;
}
</style>
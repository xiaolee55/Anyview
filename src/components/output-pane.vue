<template>
  <div class="output-pane" :style="{height: initHeight}" ref="outputPane" style="display:flex;flex-direction: column;">
    <el-tag type="info" effect="dark" class="output-pane-title">输出窗口</el-tag>
    <div class="output-container" ref="outputContainer">
      <span v-for="(item, index) in currentOutput" :key="index" v-html="item" class="output-data">
      </span>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations} from 'vuex'

export default {
  created () {
     this.initHeight = `${document.documentElement.clientHeight*0.25}px`  //初始化输出框的高度
  },
  data () {
    return {
      initHeight: 0
    }
  },
  methods: {
    updataOpPHeight(e) {
      //这个地方通过修改vue中的data再绑定到style不行，会导致拉伸条不能动，只能通过ref的方式直接操作DOM，原因未知，猜测是拉伸库的源码做了限制
      this.initHeight=e[1].width*document.documentElement.clientHeight/100+'px'
    },
    ...mapMutations({
      setOutputData :"SET_OUTPUT_DATA"
    })
  },
  watch: {
    currentOutput() {
      this.$nextTick(() => {
        const container = this.$refs.outputContainer
        const height=container.scrollHeight
        const top=container.scrollTop         
        for(let i=0;i<height-top;i++){   //使用定时器让滚动条慢慢滚到底部,此处循环次数待定
          setTimeout(function(){
            container.scrollTop++;
          },0.8*i)
        }
      })
    }
  },
  computed: {
    ...mapGetters([
      "currentOutput"
      ])
  },
}
</script>

<style lang="scss" scoped>
  .output-pane-title {
    width: 100%;
    text-align: center;
    height: 20px;
    line-height: 15px;
  }
  .output-pane /deep/{
    .el-tag{
      height: 18px;
      line-height: 16px;
    }
    .show-time {
      float: right;
      font-size: 12px;
      color: #909399;
      margin-right: 10px;
    }
    .fail-data {
      // display: block;
      background-color: #f2dede;
      color: #a94442;
      // margin-bottom: 5px;
    }
    .icon-bianyi {
      color: #909399!important;
    }
  }
  .output-container{
    flex: 1;
    margin-top: 5px;
    overflow: auto;
  }
  .output-data{
    color:#606266;
    margin-bottom: 5px;
    display: block;
  }
</style>
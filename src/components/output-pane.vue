<template>
  <div class="output-pane" ref="outputPane">
    <el-tag type="info" effect="dark" class="output-pane-title">
      <span>输出窗口</span>
      <i class="iconfont icon-qingkong output-clear" title="清空输出窗口" @click="clearOutput"></i>
    </el-tag>
    <div class="output-container" ref="outputContainer">
      <span v-for="(item, index) in currentOutput" :key="index" v-html="item" class="output-data">
      </span>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations} from 'vuex'

export default {
  data () {
    return {
      scrollTopMap: {}
    }
  },
  methods: {
    clearOutput() {
      const index = this.currentIndex
      const content = ""
      const isRemove = true
      this.setOutputData({index,content,isRemove})
    },
    updataHeight(e) {
      //这个地方通过修改vue中的data再绑定到style不行，会导致拉伸条不能动，只能通过ref的方式直接操作DOM，原因未知，猜测是拉伸库的源码做了限制
      // this.initHeight=e[1].width*document.documentElement.clientHeight/100+'px'
    },
    ...mapMutations({
      setOutputData :"SET_OUTPUT_DATA"
    })
  },
  watch: {
    currentOutput() {
      this.$nextTick(() => {
        let _this = this
        let scrollTop = this.scrollTopMap[this.currentIndex]
        const container = this.$refs.outputContainer
        const height=container.scrollHeight
        const top= scrollTop ? scrollTop : container.scrollTop
        const clientHeight = this.$refs.outputContainer.clientHeight
        if(top+clientHeight==height){   //使用一个对象来保存每道题的滚动条的位置，防止每次数据改变滚动条就滚动
          container.scrollTop = top
          return
        }
        for(let i=0;i<height-top;i++){   //使用定时器让滚动条慢慢滚到底部,此处循环次数待定
          container.scrollTop = top  //关闭调试滚动条会从0开始，所以这里应该使用Map记录下来的值
          setTimeout(function(){
            container.scrollTop++
            _this.scrollTopMap[_this.currentIndex] = container.scrollTop 
          },1*i)
        }
      })
    }
  },
  computed: {
    ...mapGetters([
      "currentOutput",
      "currentIndex"
      ])
  },
}
</script>

<style lang="scss" scoped>
  .output-pane-title {
    width: 100%;
    text-align: center;
    height: 23px!important;
    line-height: 23px!important;
  }
  .output-pane /deep/{
    height: 100%;
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
      background-color: #f2dede;
      color: #a94442;
    }
    .icon-bianyi {
      color: #909399!important;
    }
  }
  .output-container{
    height: 90%;
    margin-top: 5px;
    overflow: auto;
  }
  .output-data{
    color:#606266;
    margin-bottom: 5px;
    display: block;
  }
  .output-clear {
    position: absolute;
    right: 20px;
    font-size: 13px;
    line-height: 23px;
    cursor: pointer;
  }
</style>
<template>
  <div class="question-list">
    <div class="list-title">
      <h3 >{{title}}</h3>
      <span><el-switch
              v-model="showDetail"
              title="显示题号详细信息"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch></span>
    </div>
    <el-collapse>
      <el-collapse-item
      :title="chap[0] ? chap[0].chapName: ''"
      v-for="(chap,index) in list" 
      :key="index" 
      class="collapse-font">
        <div 
        v-for="(question,index) in chap" 
        :key="index" 
        class="question-name"
        @click="getContent(question)">
          <span>
          <i class='iconfont icon-yitongguo' v-if="questionStatus[question.eid].passStatus||question.firstPastTime"></i>
          <i class='iconfont icon-weikaishi' v-else></i>
            {{showDetail?question.pName:question.name}}
          </span>
          <span class="quest-situation">
            <i class='iconfont icon-bianyi' title="编译成功次数">{{questionStatus[question.eid].cmpRightCount}}</i>
            <i class='iconfont icon-bianyishibai' title="编译失败次数">{{questionStatus[question.eid].cmpErrorCount}}</i>
            <i class='iconfont icon-chengzuyunxing' title="运行成功次数">{{questionStatus[question.eid].runRightCount}}</i>
            <i class='iconfont icon-yunxingshibai' title="运行失败次数">{{questionStatus[question.eid].runErrorCount}}</i>
          </span>
        </div>
      </el-collapse-item>
    </el-collapse>    
</div>
</template>

<script>
export default {
  data() {
    return {
      showDetail: true
    }
  },
  props: {
    title: {
      type: String,
      default: '暂无数据'
    },
    list: {
      type: Array,
      default: () => []
    },
    questionStatus: {
      type: Object,
      default: ()=> {}
    }
  },
  methods: {
    getContent(question) {
      this.$emit("getContent",question)
    }
  }
}
</script>

<style lang="scss" scoped>
/* 问题列表开始 */
  .question-list /deep/{
    .el-collapse-item__header{
      font-size: 18px;
    }
  }
  .list-title{
    // display: flex;
    // justify-content: space-around;
    color: #606266
  }
  .question-name{
    font-size: 14px;
    padding: 5px 5px; 
    cursor: pointer;
  }
  .question-name span{
    display: block;
  }
  .quest-situation i{
    padding: 1px;
    font-size: 12px;
  }
  .question-name:hover{
      background-color: #f5f7fa;
      color: #409eff;
  }
  .close-btn{
    position: absolute;
    top: 1%;
    right: 4%;
  }
/* 问题列表结束 */
</style>
<template>
  <div class="container">
    <h1 style="color:#303133">数据结构</h1>
    <el-card class="box-card card">
    <div slot="header" class="header">
      <span style="color:#409EFF">上次做到</span>
    </div>
    <div>
      <span
        v-for="(question,idx) in []" 
        :key="idx" >
        <el-popover
          placement="top-start"
          title="标题"
          width="200"
          trigger="hover"
          content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
          <el-button plain 
            :type="idx==1?'info':idx%2==0?'success':'danger'"
            class="question">{{question.name}}</el-button>
        </el-popover>
      </span>
    </div>
   </el-card>
    <el-card class="box-card card" v-for="(chap,index) in list" :key="index+1">
    <div slot="header" class="header">
      <span>{{`第${chap[0]?chap[0].chapName:''}章`}}</span>
      <span>
        <el-tag  effect="plain">链表</el-tag>
        <el-tag  effect="plain">数组</el-tag>
      </span>
    </div>
    <div>
      <span 
        v-for="(question,idx) in chap" 
        :key="idx" >
        <el-popover
          :open-delay="0"
          :close-delay="0"
          placement="bottom-start"
          width="200"
          trigger="hover">
          <p>编译成功次数: {{question.cmpErrorCount||0}}</p>
          <p>编译失败次数: {{question.cmpRightCount||0}}</p>
          <p>运行失败次数: {{question.runErrCount||0}}</p>
          <p v-if="question.firstPastTime">通过时间: {{formatDate(question.firstPastTime)}}</p>
          <el-button plain 
            :type="currentStatus(question)"
            class="question"
            slot="reference"
            @click="getContent(question)">{{question.name}}</el-button>
        </el-popover>
      </span>
    </div>
   </el-card>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: ()=>[]
    }
  },
  methods: {
    formatDate(now) {
      now = new Date(now)
      var year=now.getFullYear();  //取得4位数的年份
      var month=now.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
      var date=now.getDate();      //返回日期月份中的天数（1到31）
      var hour=now.getHours();     //返回日期中的小时数（0到23）
      var minute=now.getMinutes(); //返回日期中的分钟数（0到59）
      var second=now.getSeconds(); //返回日期中的秒数（0到59）
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },
    getContent(question) {
      this.$emit("getContent",question)
    },
  },
  computed: {
    currentStatus(){
      return function (question) {
        return question.firstPastTime?'success':question.runErrCount?'danger': 'info'
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .container{
    display: flex;
    flex-direction: column;
    width: 63%;
    margin: 0 auto;
  }
  .card{
    margin: 30px;
  }
  .header {
    display: flex;
    justify-content: space-between;
  }
  .question{
    margin-right: 30px;
    margin-bottom: 30px;
  }
</style>
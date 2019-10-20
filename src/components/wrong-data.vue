<template>
    <div ref="wrongData" class="wrd-pane">
      <el-tag type="warning" effect="dark" class="wrong-data-title"><b>未通过测试数据</b></el-tag>
      <div  class="wrong-data-container">
        <div  class="wrong-data-item" v-for="(item,index) in wrongData" :key= "index">
            <p  :class= "banIndex.includes(index)? 'ban-data': ''" class="wrong-data-show"  @dblclick= "banData(index)" v-html= "item"></p>
            <span class="wrong-data-icon">
                <i class="iconfont icon-kaisuo" title="禁用本组数据" v-if= "!banIndex.includes(index)" @click= "banData(index)"></i>
                <i class="iconfont icon-guansuo" title="启用本组数据" v-if= "banIndex.includes(index)" @click= "applyData(index)"></i>
                <i class="el-icon-close" title="移除本组数据" @click= "removeData(index)"></i>
            </span>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  data () {
      return {
         banIndex : [],
         wrongData: [`Fibonacci(k, m): <br>Fibonacci(k, m): <br>F(0,6)=ERROR F(1,4)=ERROR1`,
                    `Fibonacci(k, m): <br>Fibonacci(k, m): <br>F(0,6)=ERROR F(1,4)=ERROR2`,
                    `Fibonacci(k, m): <br>Fibonacci(k, m): <br>F(0,6)=ERROR F(1,4)=ERROR3`,
                    `Fibonacci(k, m): <br>Fibonacci(k, m): <br>F(0,6)=ERROR F(1,4)=ERROR4`]   
      }
  },
  computed: {
  },
  methods: {
    banData(index) {
      this.banIndex.push(index)
    },
    applyData(index) {
        let arr = this.banIndex
        this.banIndex = arr.filter(item => item!=index)
    },
    removeData(_index) {
        let data = this.wrongData
        this.wrongData = data.filter((item,index)=> index != _index)
    }
  }
}
</script>

<style lang="scss" scoped>
    .wrd-pane {
        height: 100%;
    }
    .wrong-data-title {
        width: 100%;
        text-align: center;
        height: 20px;
        line-height: 15px;
    }
    .wrong-data-container {
        height: calc(100% - 20px);
        margin-top: 5px;
        overflow: auto;
    }
    .wrong-data-item {
        position: relative;
        cursor: pointer;
        background-color: #fef0f0;
        border-color: #fde2e2;
        margin-bottom: 5px;
        color: #f56c6c;
        .wrong-data-icon {
            position: absolute;
            top: 5px;
            right: 5px;
            i {
                padding: 5px;
            }
        }
        .wrong-data-show {
            padding: 10px;
            margin: 0;
        }
    }
    .wrong-data-item:hover {
        color: #409eff;
        background-color: #ecf5ff;
    }
    .ban-data {
        background-color: #f4f4f5;
        border-color: #e9e9eb;
        color: #909399;
    }
</style>
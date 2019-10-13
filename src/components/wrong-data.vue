<template>
    <div :style="{height: initHeight}" ref="wrongData" style="display:flex;flex-direction: column;">
      <el-tag type="danger" effect="dark" class="wrong-data-title">错误数据集</el-tag>
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
  created () {
     this.initHeight = `${document.documentElement.clientHeight*0.10}px`  //初始化输出框的高度
  },  
  data () {
      return {
         initHeight: 0,
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
    updataWdHeight(e) {
      //这个地方通过修改vue中的data再绑定到style不行，会导致拉伸条不能动，只能通过ref的方式直接操作DOM，原因未知，猜测是拉伸库的源码做了限制
      this.initHeight=e[2].width*document.documentElement.clientHeight/100+'px'
    },
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
    .wrong-data-title {
        width: 100%;
        text-align: center;
        height: 20px;
        line-height: 15px;
    }
    .wrong-data-container {
        flex: 1;
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
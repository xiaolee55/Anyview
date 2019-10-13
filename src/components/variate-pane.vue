<template>
  <div class="variate-pane" ref="test">
    <el-tag type="info" effect="dark" class="variate-title">变量与堆栈面板</el-tag>
    <div class="variate-container">
      <transition-group name="list">
      <div class="variate-item" v-for="stack in backTrace" :key="stack">
          <el-tag type="info" class="variate-fun" effect="plain" :class="{'active-fun': stack==trace}">
            <span>{{ stack }}</span>
          </el-tag>
          <el-tree :data="renderVar" 
                   :props="defaultProps" 
                   :highlight-current="true"
                   @node-click="handleNodeClick"
                   v-if="trace==stack"
                   default-expand-all>
          </el-tree>
      </div>
       </transition-group>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'

export default {
   data() {
      return {
        trace: "",
        defaultProps: {
          children: 'varChild',
          label: 'varInfo'
        }
      };
    },
    methods: {
      handleNodeClick(data) {
        console.log(data);
      }
    },
    computed: {
      backTrace() {
        const backTrace = this.currentDebug.backTrace
        if(!backTrace)
          return
        this.trace =backTrace[0]
        return this.currentDebug.backTrace
      },
      renderVar() {   //格式化变量数据
        let variate = this.currentDebug.variate
        let render =  variate ? format(variate) : []
        function format(variate) {
          variate = Array.isArray(variate) ? variate : [variate]
          let tempArr = []
          variate.forEach((item,index)=>{
            let obj = {}
            obj.varInfo = `${item.name}: ${item.value}`
            if(item.innerObj)
              obj.varChild = format(item.innerObj)
            tempArr.push(obj)
          })
          return tempArr
        }
        return render;
      },
      ...mapGetters([
        "currentIndex",
        "currentQuestion",
        "currentDebug",
        "openQuestionsArr"
      ]),
    }



}
</script>

<style lang="scss" scoped>
  .variate-pane /deep/{
    .el-tree{
      // max-height: 0;
      transition: all 1s ease;
    }

  } 
  .variate-title {
    width:100%;
    text-align:center;
  }
  .variate-container {
    margin-top: 5px;
  }
  .variate-item {
    width: 100%;
    cursor: pointer;
    overflow: hidden;
    transition: all 1s;
    margin: 0 -5px 5px 5px;
  }
  .variate-fun{
    font-size: 14px;
    width: 100%;
    transition: all 1s linear;
  }
  .active-fun {
    background-color: #67C23A;
    color: white;
  }
.list-enter-active, .list-leave-active {
    max-height: 200px;
    transition: all 1s linear;
}
.list-enter, .list-leave-to {
  // opacity: 0;
  max-height: 0;
}
.list-move {
  transition: transform 1s;
}

</style>
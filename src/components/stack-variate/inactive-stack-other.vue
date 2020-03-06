<template>
<!-- 非活跃函数栈的其他部分 -->
    <el-tree :data= "inStackOther"
              empty-text = "" 
              :props= "defaultProps">
      <span class="custom-tree-node" slot-scope="{ node}" :id="node.level==1?`stackName${node.id}`:''">
        <span v-for= "(item,index) in node.label" :key="item">
          <span :class= "stackClass({index,item,node},'notTop')">{{item}}</span>
        </span>
      </span>
    </el-tree>
</template>

<script>
import minxin from './mixin'

export default {
  mixins: [minxin],
   props: {
    inStackOther:{
      type: Array,
      default: ()=>[]
    }
  }
}
</script>
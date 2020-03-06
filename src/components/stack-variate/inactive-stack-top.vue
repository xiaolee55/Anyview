<template>
<!-- 栈顶函数的下一个函数 -->
  <transition 
    @before-leave= "notTopBeforeLeave" 
    @leave= "notTopLeave">
    <el-tree :data= "inStackTop"
              empty-text = "" 
              :props= "defaultProps">
      <span class="custom-tree-node" slot-scope="{ node}" :id="node.level==1?`stackName${node.id}`:''">
        <span v-for= "(item,index) in node.label" :key="item">
          <span :class= "stackClass({index,item,node},'notTop')">{{item}}</span>
        </span>
      </span>
    </el-tree>
  </transition>
</template>

<script>
import minxin from './mixin'

export default {
  mixins: [minxin],
  props: {
    inStackTop:{
      type: Array,
      default: ()=>[]
    }
  },
  methods: {
    notTopBeforeLeave(el){   //非栈顶函数入栈前
    },
    notTopLeave(el,done){    //有函数出栈时，非栈顶元素的最上面的函数向上移动成为新栈顶
      const stackHeight = 26
      const bottom = document.getElementsByClassName("stacks-container")[0].clientHeight - (this.oldStacks.length-1)*stackHeight-30 
      Velocity(el, 'stop');
      el.velocity({marginBottom:bottom}, { duration: 700,complete: done})
    },
  },
}
</script>
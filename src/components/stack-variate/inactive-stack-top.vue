<template>
<!-- 栈顶函数的下一个函数 -->
  <transition 
    @before-leave= "notTopBeforeLeave" 
    @leave= "notTopLeave">
    <el-tree :data= "inStackTop"
              empty-text = "" 
              :props= "defaultProps"
              v-if= "showNotTop">
      <span class="custom-tree-node" 
            slot-scope="{ node}" 
            :id="node.level==1?`stackName${node.id}`:''">
        <span v-for= "(item,index) in node.label" 
              :key="item">
          <span 
            :class= "stackClass({index,item,node})">{{item}}</span>
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
    },
    showNotTop:{   //触发动画的变量
      type: Boolean,
      default: true
    },
    oldLen: {
      type: Number,
      default: 0
    }
  },
  methods: {
    notTopBeforeLeave(el){   //非栈顶函数入栈前
    },
    notTopLeave(el,done){    //有函数出栈时，非栈顶元素的最上面的函数向上移动成为新栈顶
      const stackHeight = 26
      const bottom = document.getElementsByClassName("stacks-container")[0].clientHeight - (this.oldLen-1)*stackHeight-30 
      Velocity(el, 'stop');
      el.velocity({marginBottom:bottom}, { duration: 700,complete: done})
    },

    stackClass({index,item,node}) {  //设置样式
      const {level,id} = node
      this.$nextTick(()=>{
        const el = document.querySelector(`#stackName${id}`)?document.querySelector(`#stackName${id}`).parentNode: null
        el&&el.classList.add("fun-base")    
      })
      if(level == 1&&index%2!=0) {   //函数名里面的变量
        return "fun-var-name"
      }else if(level!=1&&index==0){  //变量名
        return "var-name"
      }else if(item.slice(0,2)=="0x") { //指针类型变量
        return "point-val"
      }
    },
  }
}
</script>

<style>
  .fun-base{
    background-color: #dcdcdc;
    color: #0089BD;
    font-size: 17px;
  }
  .fun-var-name {
    color: #0089BD
  }
  .var-name {
    transition: color 1s ease;
    color: rgb(112,48,160);
  }
  .point-val {
    transition: color 1s ease;
    color: rgb(127, 127, 127)
  }  
</style>
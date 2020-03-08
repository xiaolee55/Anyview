<template>
<!-- 非活跃函数栈的其他部分 -->
    <el-tree :data= "inStackOther"
              empty-text = "" 
              :props= "defaultProps">
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
  },
  methods: {
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
    color: #909399;
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
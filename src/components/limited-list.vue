<template>
<div class="father">
  <div class="show-msg">
      <el-alert
      v-for="(item,i) in count"
      :key="i"
      ref="item"
    :title="`数据值为${item}`"
    type="success"
    effect="dark">
  </el-alert>
  </div>
  <div class="icon-father">
    <i class="el-icon-arrow-up icon" @click="showUp"></i>
    <i class="el-icon-arrow-down icon" @click="showDown"></i>
  </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      changeVal: 0,
      count: [1,2,3,4,5]
    }
  },
  methods: {
    showUp() {
      console.log(this.$refs.item)
      this.$refs.item.forEach(item=>{
        item.$el.style.transition = "all 0.8s ease "
        item.$el.style.transform = "translateY(-30px)"
      })
      if(this.changeVal>0)
        this.changeVal--
    },
    showDown() {
      if(this.changeVal<this.count.length-3)
        this.changeVal++
    },

  },
  computed: {
    newCount() {
      console.log(this.changeVal)
      return this.count.slice(this.changeVal,this.changeVal+3)
    }
  },
}
</script>

<style lang="scss" scoped>
 .father {
   width: 100%;
   display: flex;
 }
 .icon-father{
   display: flex;
   flex-direction: column;
  justify-content: space-between;
 }
  .icon{
    cursor: pointer;
    color: #67C23A;
    font-size: 30px;
  }
  .icon:active{
    color: #409EFF;
  }
  .show-msg{
    height: 120px;
    overflow: hidden;
  }
</style>
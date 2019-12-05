<template>
  <el-tag :type="bgColor" effect="dark" class="tag">
    <span></span>
    <span style="text-align: center"><b>{{title}}</b></span>
    <span style="text-align: right">
      <slot></slot>
    </span>
  </el-tag>
</template>

<script>
export default {
  props:{
    title: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: 'info'
    }
  },
}
</script>

<style lang="scss" scoped>
  .tag{
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 25px;
    line-height: 25px;
  }
  .tag>span{
    flex: 1;
    cursor: pointer;
  }
</style>
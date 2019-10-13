<template>
  <div>
    <button @click="next">下一步</button>
    <div id="container" style="width:1000px;height:600px"></div>
  </div>
</template>

<script>
import {TreeVisualization} from 'static/boundle'
import {dataTree} from 'static/data'
import {newDataTree} from 'static/data_new'

export default {
  mounted() {
    this.main = new TreeVisualization(document.getElementById("container"),1000,600)
    this.main.init(dataTree)
  },
  data () {
    return {
      main:{}  
    }
  },
  methods: {
    next() {
      this.main.next(newDataTree)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
<template>
  <div>
    <button @click="next">下一步</button>
    <!-- <div id="container" style="width:1000px;height:600px">
    </div> -->
  </div>
</template>

<script>
import {TreeVisualization} from 'static/boundleTest'
import {dataTree} from 'common/js/data'
import {newDataTree} from 'common/js/data_new'
export default {
  mounted() {
    // this.main = new TreeVisualization(document.getElementById("container"),1000,600)
    // this.main.init(dataTree)
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
  },
  components: {
  }
}
</script>

<style lang="scss" scoped>
</style>
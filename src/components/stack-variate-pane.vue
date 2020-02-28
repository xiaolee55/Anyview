<template>
  <div>
    <pane-header title="变量与堆栈"/>

  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import paneHeader from 'components/pane-header'

export default {
  watch: {
    'currentDebug.backTrace': {
      immediate: true,  
      deep: true,   
      handler(backTrace){ 
        const currentDebug = this.currentDebug
        const variates =  currentDebug.variate
        const output = currentDebug.output
      }
    }
  },  
  computed: {
    ...mapGetters([
      "currentDebug",
    ]),
  },
  components: {
    paneHeader
  }
}
</script>
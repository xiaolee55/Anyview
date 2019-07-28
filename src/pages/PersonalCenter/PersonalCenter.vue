<template>
<div>
<splitpanes class="default-theme" horizontal :push-other-panes="false" style="height:400px">
  <span>1</span>
  <splitpanes :push-other-panes="false">
    <span>2</span>
    <span>3</span>
    <span>4</span>
  </splitpanes>
  <span>5</span>
</splitpanes>
<div id="a" style="background-color:green; width:100px;height:100px" ref="a"></div>
</div>
</template>
<script>
import Splitpanes from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
  export default {
    data() {
      return {
        a:100
      }
    },
  components: {
      Splitpanes,
   },
    methods: {
      test(e){
        this.$refs.a.style.width=e[0].width*document.documentElement.clientWidth/100+'px';
        console.log(e);
        
      }
    }
  }
</script>

<style>

</style>

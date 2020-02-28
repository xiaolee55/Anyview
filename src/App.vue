<template>
    <div id="app">
        <router-view id='router'></router-view>
    </div>
</template>

<script>
export default {
     provide () {     
        return {        
          app: this      
        }    
     }, 
     watch: {
      // 检测哪个路由过来
      '$route' (to, from){
        if(from.name=="login"&&to.name=="work") {
          this.$message({
            showClose: true,
            message: '欢迎您,'+JSON.parse(localStorage.getItem("user")).name,
            type: 'success',
            duration: 1500
          });
        }else if(from.name&&to.name=="login"){
            this.$message({
              showClose: true,
              message: '已退出当前账号',
              type: 'warn',
              duration: 1500
            });
        }
      }
    },
}
</script>

<style>
#app {
    height: 100%;
}
#router {
    height: 100%;
}
</style>

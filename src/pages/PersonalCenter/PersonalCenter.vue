<template>
  <div>
  <el-select v-model="test" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.val">
    </el-option>
  </el-select>
  </div>
</template>

<script>
  export default {
    data() {
     return {
       test:'',
        options: [{
          val: '选项1',
          label: '黄金糕'
        }, {
          val: '选项2',
          label: '双皮奶'
        }, {
          val: '选项3',
          label: '蚵仔煎'
        }, {
          val: '选项4',
          label: '龙须面'
        }, {
          val: '选项5',
          label: '北京烤鸭'
        }],
        value: ''
      }
    },
    methods: {
      handleChange(value) {
        console.log(value);
      }
    }
  };
</script>
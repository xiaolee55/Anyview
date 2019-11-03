
<template>
  <el-cascader
    class="setting-fun"
    v-model="value"
    :options="options"
    @change="handleChange">
  </el-cascader>
</template>

<script>
  export default {
    data() {
      return {
        value: [],
        options: [{
          value: 'theme',
          label: '编辑器主题',
          children: [{
            value: 'github',
            label: 'github'
          },{
            value: 'monokai',
            label: 'monokai'
          },{
            value: 'eclipse',
            label: 'eclipse'
          },{
            value: 'chrome',
            label: 'chrome'
          },{
            value: 'xcode',
            label: 'xcode'
          },{
            value: 'twilight',
            label: 'twilight'
          },{
            value: 'katzenmilch',
            label: 'katzenmilch'
          },]
        },{
          value: 'fontSize',
          label: '字体尺寸',
          children: [{
            value: '12',
            label: '12px'
          },{
            value: '13',
            label: '13px'
          },{
            value: '14',
            label: '14px'
          },{
            value: '15',
            label: '15px'
          },{
            value: '16',
            label: '16px'
          },{
            value: '17',
            label: '17px'
          },{
            value: '18',
            label: '18px'
          },]
        },{
          value: 'hotKey',
          label: '快捷键绑定'
        },{
          value: 'setPane',
          label: '自定义面板分割'
        },{
          value: 'help',
          label: '帮助'
        }]
      };
    },
    methods: {
      handleChange(value) {
        console.log(value);
      }
    }
  };
</script>

<style>
  .el-cascader__dropdown {
    top: 41px!important;
    left: 10px!important;
  }
</style>
<style lang="scss" scoped>
  .setting-fun /deep/{
    .el-input__inner{
     display: none;
    }
    .el-icon-arrow-down:before {
      content: "\E6CA";
      color: #7EA6FF;
      font-size: 31px;
    }
    .is-reverse { 
      transform: rotateZ(0deg)!important;
    }
    .el-input {
      position: absolute;
      top: -20px;
    }
  }
</style>
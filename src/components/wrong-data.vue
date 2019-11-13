<template>
    <div ref="wrongData" class="wrd-pane">
      <el-tag type="warning" effect="dark" class="wrong-data-title"><b>未通过测试数据</b></el-tag>
      <div  class="wrong-data-container">
        <div  class= "wrong-data-item" v-for="(item,index) in currentErrorData" :key= "index">
            <p  :class= "wrongDataClass(item,index,banIndex)" class="wrong-data-show"  @dblclick= "banData(index)" v-html= "item.slice(2)"></p>
            <span class="wrong-data-icon">
                <i class="iconfont icon-kaisuo" title="禁用本组数据" v-if= "!banIndex.includes(index)" @click= "banData(index)"></i>
                <i class="iconfont icon-guansuo" title="启用本组数据" v-if= "banIndex.includes(index)" @click= "applyData(index)"></i>
                <i class="el-icon-close" title="移除本组数据" @click= "removeData(index)"></i>
            </span>
        </div>
      </div>
    </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import * as fun from '@/api/coding'
import * as types from '@/api/config'

export default {
  data () {
      return {
         banIndex : [],
      }
  },
  methods: {
    banData(index) {
        this._updateErrorDataMsg("disable",index,()=>{this.banIndex.push(index)})
    },
    applyData(index) {
        this._updateErrorDataMsg("enable",index,()=>{this.banIndex = this.banIndex.filter(item=>item!=index)})
    },
    removeData(index) {
        console.log(index)
        this._updateErrorDataMsg("remove",index,(e)=>{this.setErrorTestData({data:index,id:this.currentIndex,action:'remove'})})
    },
    _updateErrorDataMsg(action,index,callBack){
        const content = {
          action : action,
          order : index,
          eID : this.currentIndex
        }
      fun.updateErrorDataMsg(content).then((e)=>{
          if(e.type == types.UPDATE_ERROR_DATA_SUCCESS_TYPE){
              console.log('错误数据',e)
            if(e.content.includes("success"))
                callBack.call(this,e.content)
            }
      })
    },
    ...mapMutations({
        setErrorTestData: "SET_ERROR_TEST_DATA"
    })
  },
  computed: {
    wrongDataClass() {
        return function(item,index,banIndex) {
            if(item.charAt(0)==1)
               return "pass-data"
            else if(item.charAt(0)==0&&item.charAt(1)==1||banIndex.includes(index))
               return "ban-data"
            else 
               return "not-pass-data"
        }
    },
    ...mapGetters([
        "currentIndex",
        "currentErrorData"
    ]),
  },
}
</script>

<style lang="scss" scoped>
    .wrd-pane {
        height: 100%;
    }
    .wrong-data-title {
        width: 100%;
        text-align: center;
        height: 20px;
        line-height: 15px;
    }
    .wrong-data-container {
        height: calc(100% - 20px);
        margin-top: 5px;
        overflow: auto;
    }
    .wrong-data-item {
        position: relative;
        cursor: pointer;
        margin-bottom: 5px;
        .wrong-data-icon {
            position: absolute;
            top: 5px;
            right: 5px;
            i {
                padding: 5px;
            }
        }
        .wrong-data-show {
            padding: 10px;
            margin: 0;
        }
    }
    .wrong-data-item:hover {
        color: #409eff;
        background-color: #ecf5ff;
    }
    .not-pass-data{
        background-color: #fef0f0;
        border-color: #fde2e2;
        color: #f56c6c;
    }
    .ban-data {
        background-color: #f4f4f5;
        border-color: #e9e9eb;
        color: #909399;
    }
    .pass-data {
        background-color: rgba(103,194,58,.1);
        border-color: rgba(103,194,58,.2);
        color: #67c23a;   
    }
</style>
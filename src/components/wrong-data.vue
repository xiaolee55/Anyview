<template>
    <div ref="wrongData" class="wrd-pane">
      <el-tag type="warning" effect="dark" class="wrong-data-title"><b>未通过测试数据</b></el-tag>
      <div  class="wrong-data-container">
        <div  class= "wrong-data-item" v-for="(item,index) in currentErrorData" :key= "index">
            <p  :class= "wrongDataClass(item,index)" class="wrong-data-show"  @dblclick= "banData(index)" v-html= "item.slice(2)"></p>
            <span class="wrong-data-icon">
                <el-tag type="" effect="dark" v-if= "index==currentTestOrder">测试中</el-tag>
                <el-tag type="success" effect="dark" v-if= "item.charAt(0)==1">测试通过</el-tag>
                <el-tag type="info" effect="dark" v-if= "banIndex.includes(index)">禁用</el-tag>
                <i class="iconfont icon-kaisuo" title="禁用本组数据" v-if= "lockData(item,index)" @click= "banData(index)"></i>
                <i class="iconfont icon-guansuo" title="启用本组数据" v-else @click= "applyData(index)"></i>
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
    setBanIndex(index,action='add') {
        if(!this.banIndex.find(item=>item==index)&&action=='add')
            this.banIndex.push(index)
        if(action=='remove')
            this.banIndex = this.banIndex.filter(item=>item!=index)
    },  
    banData(index) {
        if(index==this.currentTestOrder)
            return
        this._updateErrorDataMsg("disable",index,()=>{this.setBanIndex(index)})
    },
    applyData(index) {
        this._updateErrorDataMsg("enable",index,()=>{this.setBanIndex(index,'remove')})
    },
    removeData(index) {
        this._updateErrorDataMsg("remove",index,(e)=>{
            this.setBanIndex(index,'remove')
            this.setErrorTestData({data:index,id:this.currentIndex,action:'remove'})
        })
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
  watch: {      
    currentErrorData: {            //监听当前的错误数据，取出被禁用的数据
        handler(data) {
            if(!data) return
            Object.entries(data).forEach((item)=>{
                if(item[1].charAt(0)==0&&item[1].charAt(1)==1)
                    this.setBanIndex(item[0])
            })
        },
        immediate: true
    },
  },
  computed: {
    lockData(item,index) {              //看数据是否已锁，依赖于this.banIndex，每当这个改变时都会发生改变
        return function (item,index) {
            if(this.banIndex.includes(index))
               return false
            return true
        }
    },  
    wrongDataClass() {
        return function(item,index) {
            let extraClass=''
            if(index==this.currentTestOrder)
                extraClass = 'current-data'
            
            if(item.charAt(0)==1)
               return `pass-data ${extraClass}`
            else if(this.banIndex.includes(index)){
               return `ban-data ${extraClass}`
            }
            else 
               return `not-pass-data ${extraClass}`
        }
    },
    ...mapGetters([
        "currentIndex",
        "currentErrorData",
        "currentTestOrder"
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
        border-color: #d9ecff;
        background-color: #ecf5ff;
        color: #409eff;
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
    .current-data {
        font-weight: bolder;
    }
</style>
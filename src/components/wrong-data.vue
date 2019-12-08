<template>
    <div ref="wrongData" class="wrd-pane">
      <pane-header title="未通过测试错误数据"  bgColor="warning">
          <i class="el-icon-question abr"></i>
      </pane-header>
      <div  class="wrong-data-container">
        <swiper :options="swiperOption" style="height: 100%">
        <swiper-slide  class= "wrong-data-item" v-for="(item,index) in currentErrorData" :key= "index">
            <p  :class="wrongDataClass(item,index)" class="wrong-data-show"  @dblclick= "banData(index)" v-html= "item.slice(2)"></p>
            <span class="wrong-data-icon">
                <span  v-if="isCurrentOrder(index)">
                    <el-tag type="" effect="dark">测试中</el-tag>
                    <i class="el-icon-stopwatch" style="color:#409eff" title="本组数据测试中"></i>
                </span>
                <span v-else-if="isPassData(index)">
                    <el-tag type="success" effect="dark">测试通过</el-tag>
                    <i class="el-icon-success" style="color:#67c23a" title="本组数据已通过"></i>
                </span>
                <span v-else-if="isBanData(index)">
                    <el-tag type="info" effect="dark" >禁用</el-tag>
                    <i class="iconfont icon-guansuo" title="启用本组数据"  @click="applyData(index)"></i>
                </span>
                <span v-else>
                    <el-tag type="warning" effect="dark" >未测试</el-tag>
                    <i class="iconfont icon-kaisuo" title="禁用本组数据" @click="banData(index)"></i>
                </span>
                <i class="el-icon-close" title="移除本组数据" @click="removeData(index)"></i>
            </span>
        </swiper-slide>
        <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
      </div>
    </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'
import * as fun from '@/api/coding'
import * as types from '@/api/config'
import paneHeader from 'components/pane-header'

export default {
  data () {
      return {
         banIndex : [],
        swiperOption: {
          direction: 'vertical',
          mousewheel: true,
        //   autoHeight: true, //enable auto height
          spaceBetween: 10,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          }
        }
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
    isPassData(index) {
        return this.currentErrorData[index][0] == 1
    },
    isCurrentOrder(index){
        return index==this.currentTestOrder
    },
    isBanData(index){
        return this.banIndex.includes(index)
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
           return !(this.banIndex.includes(index))
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
  components: {
    paneHeader
  }
}
</script>

<style lang="scss" scoped>
    .wrd-pane {
        height: 100%;
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
    // .wrong-data-item:hover {
    //     color: #409eff;
    //     background-color: #ecf5ff;
    // }
    .not-pass-data{  
        border:  1px solid#e6a23c;;
    }
    .ban-data {
        border: 1px solid #909399;
        color: #909399;
    }
    .pass-data {
        border:  1px solid#67c23a;
        color: #67c23a;   
    }
    .current-data {
        border:  1px solid#409eff;
        font-weight: bolder;
        color: #409eff;
    }
</style>
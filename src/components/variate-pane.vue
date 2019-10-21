<template>
  <div class="variate-pane" ref="varPane">
    <el-tag type="info" effect="dark" class="variate-title" ref="varTitle">变量与堆栈</el-tag>
    <div class="variate-container" ref="variateContainer">
      <transition-group name="varr" tag="div" appear
        @before-Enter = "beforeEnter"
        @enter = "enter"
        @after-enter= "afterEnter"
        @before-leave= "beforeLeave"
        @leave="leave"
        @after-leave= "afterLeave"
        style="height:100%">
        <div class="variate-item" v-for="(strs,index) in backTrace" 
             :key= "formatItem(strs)" 
             :ref = "(strs[0]).replace(/\s/g,'')" 
             :id= "(strs[0]).replace(/\s/g,'')">
            <el-tag type="info" class="variate-fun"  :class="{'active-fun': index==trace}" ref="fun">
              <i class="el-icon-caret-right" v-if="isExpand!=index" @click="expandVars(strs,index)"></i>
              <i class="el-icon-caret-bottom" v-if="isExpand==index" @click="collapseVars(strs,index)"></i>
              <span v-for="(str,i) in strs" :key="str" :class="funClass(i,index,trace)">{{ str }}</span>
            </el-tag>
            <el-tree :data= "renderVar" 
                    :props= "defaultProps" 
                    :highlight-current= "true"
                    v-if= "trace== index"
                    default-expand-all>
              <span class="custom-tree-node" slot-scope="{ node }">
                <span v-for="(item,index) in node.label" :key="item">
                  <span :class="varClass(index,item)">{{item}}</span>
                </span>
              </span>
            </el-tree>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import {mapGetters,mapMutations,mapActions} from 'vuex'

export default {
   data() {
      return {
        isExpand: "",
        trace: "",
        defaultProps: {
          children: 'varChild',
          label: 'varInfo'
        },
        saveVariateArr: {},
        itemIdArr: [],
        oldVariate: "",
        transformArr:[]
      };
    },
    methods: {
      beforeEnter(el) {
        //当前函数高度初始值为0，透明度为0
          el.style.opacity = 0  
          el.style.transform = `translateY(0)`
      },
      enter(el,done) {
          setTimeout(()=>{  //不加延时则初始高度值会出问题，原因待探索
            const containerHeight = this.$refs.variateContainer.offsetHeight - 1
            const funHeight = this.$refs.fun[0].$el.offsetHeight
            el.offsetWidth;
            let arr = this.itemIdArr
            for (let i = 0; i < arr.length; i++) {
              this.$refs[arr[i]][0].style.transition = "all 1s"
              if(i!=0){
                this.$refs[arr[i]][0].style.transform = `translateY(${containerHeight-(arr.length-i)*funHeight}px)`
                this.transformArr[i] = containerHeight-(arr.length-i)*funHeight
              }else{
                  this.$refs[arr[i]][0].style.transform = `translateY(0)`
                  this.transformArr[i] = containerHeight-(arr.length-i)*funHeight  //存储栈的transform初始值，已被拉伸框时使用
              }
              this.$refs[arr[i]][0].style.opacity = 1
            }
            done()
          },200)
      },
      afterEnter(el) {
        // el.style.transition = ""
      },
      beforeLeave(el) {
        el.style.opacity = 1
        el.style.transition = "all 1s"
      },
      leave(el,done) {
        el.style.opacity = 0
        if(this.$refs[this.itemIdArr[0]][0]){
          this.$refs[this.itemIdArr[0]][0].style.transition =  "all 0.5s 0.5s"
          this.$refs[this.itemIdArr[0]][0].style.transform = `translateY(0)`
        }
        setTimeout(()=>{
          done()  //这个开启则不会出现离开动画
        },1000)
      },
      afterLeave(el) {
        el.transition = ""
      },
      fixedFun(changeVal) {   //精度丢失问题
        let arr = this.itemIdArr
        for (let i = 0; i < arr.length; i++) {
          this.$refs[arr[i]][0].style.transition = "all 1s"
          if(i!=0){
            const newVal = this.transformArr[i] + changeVal
            this.$refs[arr[i]][0].style.transition = ""
            this.$refs[arr[i]][0].style.transform = `translateY(${newVal}px)`
          }
        }
      },
      expandVars(name,index) {
        this.isExpand = index
        this.$nextTick(()=>{
          this.$refs[name][0].style.maxHeight = 666+'px'
        })
      },
      collapseVars(name, index) {
        this.isExpand = -1
        this.$nextTick(()=>{
          this.$refs[name][0].style.maxHeight = 35+'px'
        })
      },
      varClass(index,item) {
       return index==0 ? 'var-name': item.charAt(0)==0&&item[1]=="x" ? 'point-val' : ''
      },
      funClass(i,index,trace) {
        return (i%2==0)? '': (index==trace) ? 'active-var' : 'not-active-var'
      },
      formatFun(backTrace) {
        if(!backTrace)
          return
        let newBackTrace = []
        let oldBackTrace = []
        let finalBackTrace = []
        for (let i = 0; i < backTrace.length; i++) {
          newBackTrace.push(backTrace[i].match(/\(s*\w*=|,\s*\w*=/g))
          oldBackTrace.push(backTrace[i].split(/\(s*\w*=|,\s*\w*=/g))
        }
        for (let i = 0; i < newBackTrace.length; i++) {
          for (let j = 0; j < newBackTrace[i].length; j++) {
            newBackTrace[i][j] = newBackTrace[i][j].replace(/\(|,|=|\s/g,"") 
          }
        }
        for (let i = 0; i <oldBackTrace.length; i++) {
          for (let j = 0; j < oldBackTrace[i].length; j++) {
            if(j==0)
              oldBackTrace[i][j] = `${oldBackTrace[i][j]} (`
            else if(j!=oldBackTrace[i].length-1)
              oldBackTrace[i][j] = `= ${oldBackTrace[i][j]}, `
            else
              oldBackTrace[i][j] = `= ${oldBackTrace[i][j]}`
          }
        }
        for (let i = 0; i < oldBackTrace.length; i++) {
          finalBackTrace[i] = []
          for (let j = 0; j < oldBackTrace[i].length; j++) {
            finalBackTrace[i].push(oldBackTrace[i][j])
            if(j!=oldBackTrace[i].length-1)
              finalBackTrace[i].push(newBackTrace[i][j])
          }
        }
        return finalBackTrace;
      },
      formatItem(obj) {
        return obj.join().replace(/\s/g,'')
      }
    },
    computed: {
      backTrace() {
        const backTrace = this.currentDebug.backTrace
        const variate = this.currentDebug.variate
        if(!backTrace)
          return
        this.trace = 0
        const finalBackTrace = this.formatFun(backTrace)
        this.itemIdArr = []
        finalBackTrace.forEach(item=>{
          this.itemIdArr.push(item[0].replace(/\s/g,''))
        })
        return backTrace ? finalBackTrace: [] 
      },
      renderVar() {   //格式化变量数据
        const sign = this.currentDebug.backTrace[0]
        let format = (variate,oldVariate)=> {
          variate = Array.isArray(variate) ? variate : [variate]
          oldVariate = Array.isArray(oldVariate ) ? oldVariate  : [oldVariate ]
          let tempArr = []
          variate.forEach((item,index)=>{
            let obj = {}
            if(oldVariate[index] &&item.value != oldVariate[index].value)
              console.log()
            else{
               oldVariate[index] = {}
               oldVariate[index].innerObj = {}
            }
            let formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
            obj.varInfo = [formatName,": ",item.value]
            obj.sign = sign
            if(item.innerObj) 
              obj.varChild = format(item.innerObj,oldVariate[index].innerObj)
            tempArr.push(obj)
          })
          return tempArr
        }
        let variate = this.currentDebug.variate
        if(this.oldVariate == "")
          this.oldVariate = variate
        let render =  variate ? format(variate,this.oldVariate) : []
        this.oldVariate = variate
        this.saveVariateArr[sign]=render
        return this.saveVariateArr[sign];
      },
      ...mapGetters([
        "currentIndex",
        "currentQuestion",
        "currentDebug",
        "openQuestionsArr",
        "varAnimation"
      ]),
    }



}
</script>

<style lang="scss" scoped>
  .variate-pane /deep/{
    height: 100%;
    position: relative;
    font-family: "Courier New";
    .el-tree{
      height: calc(100% - 32px);
      overflow: auto;
      font-family: "Cambria Math";
    }
    .el-tree-node{
      background-color: rgb(248,248,248);
    }
  } 
  .variate-title {
    width:100%;
    text-align:center;
  }
  .variate-container {
    height: calc(100% - 32px);
    margin-top: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
  }
  .variate-item {
    position: absolute;
    width: 100%;
    height: calc(100% - 32px);
    cursor: pointer;
    margin: 0 -5px 5px 5px;
  }
  .variate-fun{
    font-size: 16px;
    width: 100%;
    background-color: #DCDCDC;
  }
  .active-fun {
    background-color: rgb(51,153,102);
    color: white;
  }
  .active-var {
    color: rgb(255,255,0)
  }
  .not-active-var {
    color: #0089BD
  }
  .var-name {
    color: rgb(112,48,160);
  }
  .point-val {
    color: rgb(127, 127, 127)
  }
  // .varr-move {
  //   transition: all 1s;
  // }

</style>
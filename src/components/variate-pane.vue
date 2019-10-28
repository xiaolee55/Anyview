<template>
  <div class="variate-pane" ref="varPane">
    <el-tag type="info" effect="dark" class="variate-title" ref="varTitle">变量与堆栈</el-tag>
     <span style="opacity:0;display:none">{{renderVar}}</span>
    <div class="variate-container" ref="variateContainer">
      <transition-group name="varr" tag="div" appear
        @before-Enter = "beforeEnter"
        @enter = "enter"
        @after-enter= "afterEnter"
        @before-leave= "beforeLeave"
        @leave="leave"
        @after-leave= "afterLeave"
        style="height:100%">
        <div class="variate-item" v-for="(strs,index) in saveVariateArr" 
             :key= "strs.name" 
             :ref = "strs.name" 
             :id= "strs.name">
            <el-tag type="info" class="variate-fun"  :class="{'active-fun': strs.name==trace}" ref="fun">
              <i class="el-icon-minus" v-if= "isExpand.includes(strs.name)" @click= "collapseVars(strs.name,strs.tree)"></i>
              <i class="el-icon-plus" v-else @click= "expandVars(strs.name,strs.tree)"></i>
              <span v-for="(str,i) in strs.finalBackTrace" :key="str" :class="funClass(strs.name,i,trace)">{{ str }}</span>
            </el-tag>
            <el-tree :data= "strs.tree" 
                    :props= "defaultProps" 
                    :highlight-current= "true"
                    node-key = "sign"
                    @node-expand= "nodeExpand"
                    @node-collapse= "nodeCollapse"
                    :default-expanded-keys= "expandedNodeList">
              <span class="custom-tree-node" slot-scope="{ node }">
                <span v-for= "(item,index) in node.label" :key="item">
                  <span :class= "varClass(index,item)">{{item}}</span>
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
        isExpand: [],
        trace: "",
        defaultProps: {
          children: 'varChild',
          label: 'varInfo'
        },
        saveVariateArr: [],
        itemIdArr: [],
        oldVariate: "",
        expandedNodeList: [],
        transformArr:[],
        initTransformArr: []
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
            const containerHeight = this.$refs.variateContainer.offsetHeight - 5
            const funHeight = this.$refs.fun[0].$el.offsetHeight
            el.offsetWidth;   //强制刷新动画
            let arr = this.itemIdArr
            for (let i = 0; i < arr.length; i++) {
              this.$refs[arr[i]][0].style.transition = "all 1s"
              if(i!=0){ //非栈顶函数
                this.isExpand = this.isExpand.filter(item=>item!=arr[i])  //收下去时把-号变+号
                this.$refs[arr[i]][0].style.transform = `translateY(${containerHeight-(arr.length-i)*funHeight}px)`
                this.$refs[arr[i]][0].style.height = `${funHeight}px`
                this.$refs[arr[i]][0].style.zIndex= i
                this.transformArr[i] = containerHeight-(arr.length-i)*funHeight
              }else{  //栈顶函数
                  this.$refs[arr[i]][0].style.transform = `translateY(0)`
                  this.$refs[arr[i]][0].style.height = `${containerHeight-(arr.length-i)*funHeight}px`
                   this.$refs[arr[i]][0].style.zIndex= i
                  this.transformArr[i] = containerHeight-(arr.length-i)*funHeight  //存储栈的transform实时值，已被拉伸框时使用
              }
              this.$refs[arr[i]][0].style.opacity = 1
              this.initTransformArr = this.transformArr  //存储栈的transform实时值，已被拉伸框时使用
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
        const containerHeight = this.$refs.variateContainer.offsetHeight - 1
        const funHeight = this.$refs.fun[0].$el.offsetHeight
        const arr = this.itemIdArr
        el.style.opacity = 0
        const index =  this.itemIdArr[0]
        //数据换组不需要动画，因为走到这里时上一组数据的最后一个函数已被删除
        if(this.$refs[index]&&this.$refs[index][0]){
          this.$refs[index][0].style.height = `${containerHeight-arr.length*funHeight}px`
          this.$refs[index][0].style.transition =  "all 0.5s 0.5s"
          this.$refs[index][0].style.transform = `translateY(0)`
        }
        this.transformArr.shift()   //有函数退栈时把他得transform值从数组移除，防止影响其他元素
        setTimeout(()=>{
          done()  //这个开启则不会出现离开动画
        },1000)
      },
      afterLeave(el) {
        el.transition = ""
      },
      nodeExpand(data,node,component) {
        this.expandedNodeList.push(data.sign); // 在节点展开是添加到默认展开数组
      },
      nodeCollapse(data) {
        this.expandedNodeList=this.expandedNodeList.filter(item=>item!=data.sign) // 收起时删除数组里对应选项
        if(data.varChild){
          data.varChild.forEach((item,index)=>{
            this.nodeCollapse(data.varChild[index])
          })   
        }
      },
      fixedFun(changeVal) {   //精度丢失问题
        let arr = this.itemIdArr
        console.log(changeVal)
        for (let i = 0; i < arr.length; i++) {
          this.$refs[arr[i]][0].style.transition = "all 1s"
          if(i!=0){
            const newVal = this.transformArr[i] + changeVal
            this.$refs[arr[i]][0].style.transition = ""
            this.$refs[arr[i]][0].style.transform = `translateY(${newVal}px)`
          }
        }
      },
      expandVars(name,tree) {
        const funHeight = this.$refs.fun[0].$el.offsetHeight
        const varsHeight = tree.length*26  //26是一行变量的高度
        const arr = this.itemIdArr
        const index = arr.findIndex((item,i)=>item==name)
        this.isExpand.push(name)
        arr.forEach((item,i)=>{
          if(item!=this.trace){
            if(i<=index){
              this.transformArr[i] = this.transformArr[i]-varsHeight
              this.$refs[item][0].style.transition = "all 1s"
              this.$refs[item][0].style.transform = `translateY(${this.transformArr[i]}px)`  //被点击元素及其上面的元素都向上移动相对的位置
            }
          }
        })
        this.$refs[name][0].style.height = `${funHeight+varsHeight}px`  //被点击的元素高度变为函数高度+所有变量闭合时的高度
      },
      collapseVars(name,tree) {
        const funHeight = this.$refs.fun[0].$el.offsetHeight
        const varsHeight = tree.length*26  //26是一行变量的高度
        const arr = this.itemIdArr
        const index = arr.findIndex((item,i)=>item==name)
        this.isExpand = this.isExpand.filter(item=>item!=name)
        arr.forEach((item,i)=>{
          if(item!=this.trace){
            if(i<=index){
              this.transformArr[i] = this.transformArr[i]+varsHeight
              this.$refs[item][0].style.transition = "all 1s"
              this.$refs[item][0].style.transform = `translateY(${this.transformArr[i]}px)`  //被点击元素及其上面的元素都向上移动相对的位置
            }
          }
        })
        this.$refs[name][0].style.height = `${funHeight}px`  //被点击的元素高度变为函数高度+所有变量闭合时的高度
      },
      changeExpandNodeList(flag,name) {
        if(flag)
          this.expandedNodeList = []
      },
      varClass(index,item) {
        if(item)
          return index==0 ? 'var-name': item.charAt(0)==0&&item[1]=="x" ? 'point-val' : ''
        else
          return ''
      },
      funClass(strs,i,trace) {
        return (i%2==0)? '': (strs==trace) ? 'active-var' : 'not-active-var'
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
    watch: {
      trace(val) {
        console.log(val)
        this.isExpand.push(val)
      }
    },
    computed: {
      renderVar() {   //格式化变量数据
        //判断本次调试的数据是否是一组全新数据
        const output = this.currentDebug.output
        const isNewData = output.includes("<br>========RIGHT========<br>")||output.includes("<br>========ERROR========<br>")
        console.log()
        //函数堆栈的原始数据，用formatFun函数格式化成数组再给不同高亮
        const backTrace = Array.isArray(this.currentDebug.backTrace)?this.currentDebug.backTrace:[this.currentDebug.backTrace]
        const finalBackTrace = this.formatFun(backTrace)
        
        //存放函数名的全局数组，用以在一些地方做标识和判断
        this.itemIdArr =backTrace  //只有一个函数时后端返回的是一个字符串，因此需要做处理
        const sign = backTrace[0]
        this.trace = sign

          //如果是新一组数据，则删除其原来的展开状态
         this.changeExpandNodeList(isNewData,sign)
        //格式化变量数据为树形数据的算法
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
            let formatName 
            if(item.name)
              formatName = item.name.slice(item.name.lastIndexOf("->")==-1?0:item.name.lastIndexOf("->")).replace(/\)|-|>/g,"")
            obj.varInfo = [formatName,": ",item.value]
            obj.sign = item.name
            if(item.innerObj) 
              obj.varChild = format(item.innerObj,oldVariate[index].innerObj)
            tempArr.push(obj)
          })
          return tempArr
        }
        //拿到原始数据并格式化
        let variate = this.currentDebug.variate
        if(this.oldVariate == "")
          this.oldVariate = variate
        let render =  variate ? format(variate,this.oldVariate) : []
        this.oldVariate = variate

        //分情况判断不同的函数堆栈切换情况，维护一个包含所有信息的数组saveVariateArr
        let tempArr = this.saveVariateArr
        //三种情况，当返回函数栈数量比维护的saveVariateArr长度相等时，只用更新当前活跃函数栈，前者大时要往维护数组中添加一个数据，前者小时要删除对应数据
        if(tempArr.length==backTrace.length){
          if(isNewData){   
            tempArr = []
            backTrace.forEach((item,index)=>{
              let _render = []
              if(item == sign)
                _render = render
                tempArr.push({name:item,tree:_render,finalBackTrace:finalBackTrace[index]})
            })  
          }
          tempArr.forEach((item,index)=>{
            if(item.name==backTrace[0]){
              tempArr[index].tree = render
            }
          })
        }else if(tempArr.length<backTrace.length){
          if(isNewData) //如果是新一组调试数据，则把上次余留的函数数据清空
            tempArr = []
          backTrace.forEach((item,index)=>{
            let flag = tempArr.find(obj=>obj.name==item)
            let _render = []
            if(item == sign)
              _render = render
            if(!flag)
              tempArr.push({name:item,tree:_render,finalBackTrace:finalBackTrace[index]})
          })
        }else{
          if(isNewData){      //新函数栈的数量比保留的函数栈大且是新一组数据时，清空上次的数组，重新添加
            tempArr = []
            backTrace.forEach((item,index)=>{
              let _render = []
              if(item == sign)
                _render = render
                tempArr.push({name:item,tree:_render,finalBackTrace:finalBackTrace[index]})
            })  
          }else{
            tempArr = tempArr.map(item=>{
              if(item.name==sign){
                item.tree = render
              }
              return item
            })
            tempArr = tempArr.filter(item=>backTrace.includes(item.name))
          }
        }
        this.saveVariateArr = tempArr
        return [];
      },
      ...mapGetters([
        "currentIndex",
        "currentQuestion",
        "currentDebug",
        "openQuestionsArr",
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
    // max-height: 666px;
    // height: calc(100% - 32px);
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
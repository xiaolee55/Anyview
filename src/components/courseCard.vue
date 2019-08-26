<template>
    <div class="course-card" @click="clickCard">
        <!-- <div class="gradient">这里</div> -->
        <h2>{{courseName}}</h2>
        <el-progress type="circle" :percentage="questionId/questionCount*100" :width="100"></el-progress>
        <div class="work-info">
            <h3>{{totalNum}}</h3>
            <h3>{{questionId}}</h3>
        </div>
        <div class="work-text">
            <span>总章节</span>
            <span>{{cardType}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        courseName: String,
        cardType: String,
        questionId: {
            type: Number,
            default: 0
        },
        questionCount: {
            type: Number,
            default: 200
        },
        totalNum: {
            type: Number,
            default: 0
        }
    },
    methods: {
        clickCard(){
             this.$emit('goTo');
        }
    }
}
</script>

<style>
    .course-card{
      position: relative;
      width: 250px;
      height: 250px;
      margin: 20px;
      border-radius: 10%;
      color: white;
      background-image: url(./images/img.jpg);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gradient{
        position: absolute;
        top: 0;
        left: 0;
        width: 250px;
        height: 250px;
        border-radius: 10%;
        transition: all 0.2s ease;
        background-color: #DCDCDC;
    }
    .course-card:hover{
       box-shadow: 0px 0px 7px 7px  #DCDCDC;
     }
    .work-info,.work-text{
      display: flex;
      justify-content: space-around;
    }
    .work-text span{
      margin-top: -10px;
      font-size: 12px;
      color: grey;
    }
</style>

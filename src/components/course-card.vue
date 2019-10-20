<template>
    <el-card class="course-card">
        <div>
            <img src="./images/carbon.svg" class="card-img">
        </div>
        <div>
             <h1 class="course-name">{{courseName}}</h1>
             <div>
                <span>完成进度</span>
                <el-progress :text-inside="true" :stroke-width="24" :percentage="finishProgress" status="success"></el-progress>
                <span>总章节</span>
                <el-tag  :label="chapNum"  effect="dark" style="display:block">{{chapNum}}</el-tag>
                <span>总题目数</span>
                <el-tag  :label="questionNum" type="info" effect="dark" style="display:block">{{questionNum}}</el-tag> 
            </div>
        </div>
        <div>
            <h2 style="color:#E6A23C">上次打开的题目</h2>
            <el-carousel height="150px"   direction="vertical">
            <el-carousel-item v-for="(item,index) in openQuestions" :key="index">
                <h3 v-if="openQuestions.name">{{openQuestions.name}}</h3>
                <h3 v-else>{{"无"}}</h3>
            </el-carousel-item>
            </el-carousel>
        </div>
        <div class="open-coding" @click="openCoding">
            <h3 class="status-title">{{status}}</h3>
            <el-progress type="circle" 
                         :percentage="finishProgress" 
                         status="success"
                         title="开始或者继续你的作业">
                <i class="el-icon-caret-right"></i>
            </el-progress>
            <div style="text-align: center"><i class="el-icon-warning-outline" style="font-size:12px;color:#909399">{{message}}</i></div>
        </div>
    </el-card>
</template>

<script>
 

export default {
    props: {
        imgUrl: {
            type: String,
            default: ''
        },
        courseName: {
            type: String,
            default: "暂未开放"
        },
        chapNum: {
            type: Number,
            default: 0
        },
        questionNum: {
            type: Number,
            default: 0
        },
        finishNum: {
            type: Number,
            default: 0 
        },
        is_first: {
            type: Boolean,
            default: true
        },
        openQuestions: {
            type: Array,
            default: () => [1]
        }
    },
    methods: {
        openCoding() {
            this.$emit("goToCoding")
        }
    },
    computed: {
        finishProgress() {
            return this.questionNum==0 ? 0 : Number((this.finishNum/this.questionNum*100).toFixed(1))
        },
        status() {
            return this.is_first ? "开始" : "继续"
        },
        message() {
            return this.is_first ? "开始做题" : "继续你未完成的题目"
        }
    }
}
</script>

<style lang="scss" scoped>

    .course-card /deep/{
        min-width: 700px;
        position: relative;
        .el-card__body {
            display: flex!important;
            justify-content: space-between;
        }
        .course-name{
            margin-top: 0;
            color: #606266;
            cursor: pointer;
        }
        .course-name:hover{
            text-decoration: underline;
        }
        h3 {
            text-align: center;
        }
        .open-coding{
            cursor: pointer;
        }

        .status-title{
            color:#13ce66
        }
        .status-title:hover{
             text-decoration: underline;
        }

        .el-icon-check {
            font-size: 30px;
        }
        .el-icon-check::before{
            content: "\e791";
        }
        .el-carousel__item h3 {
            color: #475669;
            font-size: 14px;
            opacity: 0.75;
            line-height: 150px;
            margin: 0;
        }
        .el-carousel__item:nth-child(2n) {
            background-color: #99a9bf;
        }
        
        .el-carousel__item:nth-child(2n+1) {
            background-color: #d3dce6;
        }
    }
    .card-img{
       height: 250px;
       width: 250px;
    }
</style>

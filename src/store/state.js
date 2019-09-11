/*
状态对象,即包含所有数据源
*/
export default {
    isLogin: false,          //是否登录标志
    user: {},                //用户信息
    schoolList: [],          //所有学校的集合
    questionList: [],        //请求下来的所有题目的集合
    continue_tableName: '',  //上次打开的作业表的名字
    totalNum: 0,             //题目总数
    questionDesc: '',        //题目内容
    presentQuestion: {},     //当前所在题目
    activeQuestion:[],       //目前已打开题目的集合，关闭题目后从中移除
    solveTrends: [],         //做题动态
    schemeId: ''             //作业表ID
}
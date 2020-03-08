/*
状态对象,即包含所有数据源
*/
export default {
    questionList: [],        //请求下来的所有题目的集合
    courseName: "",
    currentQuestion: null,
    currentIndex: 0,
    openQuestions: new Map(),
    
    studentAnswer: "",
    outputData: {},
    debugData: {},
    listOpen: true,
    animation: true,
    clearOutputAuto: false,
    errorTestData: {},
    currentTestOrder: 0,
    initTestDataLength: 0,
    changeVarsArr: [],
    questionStatus: {},
    questionDetailOpen: false
}
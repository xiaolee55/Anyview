<template>
    <div>
        <span class="tool-bar" id="toolBar">工具栏</span>
        <div class="tool-bar-list" id="toolBarList">
                <li>
                    <a href="">笔记</a>
                    <a href="">代码截图</a>
                    <a href="">分享解法</a>
                    <a href="">定义样式</a>
                    <a href="">倒计时</a>
                </li>
        </div>
    </div>
</template>

<script>
export default {
}
</script>

<style>
.tool-bar{
    position: fixed;
    width: 20px;
    height: 60px;
    right: 0;
    top: 100px;
    color: white;
    cursor: pointer;
    text-align: center;
    transition: all 0.4s ease;
    font: 500 13px/20px "Microsoft yahei";
    background-color: rgba(0,0,0,0.5);
    z-index: 99;
}
.tool-bar-list{
    position: fixed;
    top: 0;
    right: -120px;
    width: 120px;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
    z-index: 99;
    transition: all 0.4s ease;
}
.tool-bar-list a{
    color: white;
    padding: 5px;
    display: block;
    text-align: center;
}
.tool-bar-list a:hover{
    background-color: rgba(0,0,0,0.8);
}
</style>

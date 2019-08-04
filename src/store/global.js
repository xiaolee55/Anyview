//标识当前用户的登录状态
let glob_isLogin=false

export default{
    glob_isLogin: false,

    setIsLogin(isLogin){
        this.glob_isLogin=isLogin
    }
}
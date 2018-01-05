//app.js
let fv = require('/utils/util.js');
let setting = require('/config/settings.js')

App({
    onLaunch: function () {
        // 展示本地存储能力
        let logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        let spout = fv.login()
            .then((res) => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                this.globalData.code = res.code
                return fv.getSetting()
            })
        // 获取用户信息
        spout.then((res) => {
                if(res.authSetting['scope.userInfo']){
                    return fv.getUserInfo()
                }else{
                    return Promise.reject()
                }
            })
            .then((res)=>{
                this.globalData.userInfo = res.userInfo
                return fv.requestTemplet({
                    url: setting.rootUrl + "api/check",
                    method: "GET",
                    data: {
                        code: this.globalData.code,
                        encryptedData: res.encryptedData,
                        rawData: res.rawData,
                        iv: res.iv,
                        signature: res.signature
                    }
                })
            })
            .then((res)=>{
                this.globalData.userInfo.bookNumber = res.data.book_count
                this.globalData.userInfo.followeeNumber = res.data.followee_count
                this.globalData.userInfo.likeNumber = res.data.like_count
                //如果userInfoReadyCallback未被定义，说明page还没有load，见pages/index/index的逻辑
                if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(this.globalData.userInfo)
                }
            })
            .catch(fv.exception)
        spout.then((res)=>{
            if (res.authSetting['scope.userLocation']) return fv.getLocation
            else return Promise.reject()
        })
            .then((res) => {
                this.globalData.geoInfo = res
                if (this.geoInfoReadyCallback) {
                    this.geoInfoReadyCallback(this.globalData.userInfo)
                }
            })
            .catch(fv.exception)
    },
    globalData: {
        userInfo: null
    }
})
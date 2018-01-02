//app.js
let fv = require('/utils/request.js');
App({
    onLaunch: function () {
        // 展示本地存储能力
        let logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                this.globalData.code = res.code
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo
                            fv.request({
                                url: "https://favormylikes.com/bookborrow/api/check",
                                method: "GET",
                                data: {
                                    code: this.globalData.code,
                                    encryptedData: res.encryptedData,
                                    rawData: res.rawData,
                                    iv: res.iv,
                                    signature: res.signature
                                },
                                success: res => {
                                    this.globalData.userInfo.bookNumber=res.data.book_count
                                    this.globalData.userInfo.followeeNumber=res.data.followee_count
                                    this.globalData.userInfo.likeNumber=res.data.like_count
                                },
                                fail: err => {

                                }
                            })
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
                if (res.authSetting['scope.userLocation']) {
                    wx.getLocation({
                        type: 'wgs84',
                        success: res => {
                            this.globalData.geoInfo = res
                        }
                    })
                }
            }
        })
    },
    globalData: {
        userInfo: null
    }
})
//index.js
let fv = require('../../utils/request.js');
//获取应用实例
const app = getApp()
//app.globalData.colors = ['palegoldenrod', 'beige', 'lightgoldenrodyellow']
app.globalData.isbn = ''
Page({
    data: {
        motto: 'Hello World',
        name: '',
        author: '',
        translator: '',
        publisher: '',
        img: '',
        own_it: 'hide',
        own_it_too: 'hide',
        owners: [],
        owners_class: 'hide',
        message_class: 'hide',
        message: '',
        userInfo: app.globalData.userInfo || {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        let that = this;
        setTimeout(function(){
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        },1000)
        // if (app.globalData.userInfo) {
        //
        // } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            // wx.getUserInfo({
            //     success: res => {
            //         app.globalData.userInfo = res.userInfo
            //         fv.request({
            //             url: "https://favormylikes.com/bookborrow/api/check",
            //             method: "GET",
            //             data: {
            //                 code: app.globalData.code,
            //                 encryptedData: res.encryptedData,
            //                 rawData: res.rawData,
            //                 iv: res.iv,
            //                 signature: res.signature
            //             },
            //             success: res => {
            //                 app.globalData.userInfo.bookNumber=res.data.book_count
            //                 app.globalData.userInfo.followeeNumber=res.data.followee_count
            //                 app.globalData.userInfo.likeNumber=res.data.like_count
            //                 this.setData({
            //                     userInfo: app.globalData.userInfo,
            //                     hasUserInfo: true
            //                 })
            //             },
            //             fail: err => {
            //
            //             }
            //         })
            //     }
            // })
        // }
        if (!app.globalData.geoInfo) {
            wx.getLocation({
                type: 'wgs84',
                success: res => {
                    app.globalData.geoInfo = res
                }
            })
        }
    },
    scan: function (e) {
        console.log(e)
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                let config = {};
                config.message_class = 'hide'
                config.owners = []
                console.log(res)
                if (res.scanType === "QR_CODE") {
                    config.message_class = "show"
                    config.message = "不要扫二维码啊小伙子，去扫条形码！"
                    this.setData(config)
                    return
                }
                app.globalData.isbn = res.result
                console.log(app.globalData.isbn)
                fv.request({
                    url: "https://favormylikes.com/bookborrow/api/search/?isbn=" + app.globalData.isbn + "&user=" + this.data.userInfo.nickName,
                    success: (res) => {
                        console.log(res)
                        config.name = res.data.title + "," + res.data.rate + "★"
                        config.author = res.data.author
                        config.translator = res.data.translator
                        config.publisher = res.data.publisher
                        config.img = res.data.img
                        config.owners_class = 'hide'
                        config.own_it = 'hide'
                        config.own_it_too = 'hide'
                        if (res.data.title === "没找到") {
                            console.log(config)
                        }
                        else if (res.data.users.length === 0) {
                            config.own_it = 'show'
                        } else {
                            let index = -1;
                            let users = [];
                            for (let n = 0; n < res.data.users.length; n += 1) {
                                let user = {
                                    name: res.data.users[n].nickName,
                                    avatarUrl: res.data.users[n].avatarUrl
                                    //color: app.globalData.colors[Math.floor(Math.random() * app.globalData.colors.length)]
                                };
                                if (user.name === app.globalData.userInfo.nickName) index = n
                                users.push(user)
                            }
                            if (index === -1) {
                                config.own_it_too = 'show'
                            } else {
                                config.owners_class = 'show'
                            }
                            config.owners = users
                        }
                        this.setData(config)
                    },
                    fail: (err) => {
                        console.log(err)
                    }
                })
            }
        })
    },
    add: function (e) {
        let userinfo = app.globalData.userInfo;
        let geoinfo = app.globalData.geoInfo;
        fv.request({
            url: "https://favormylikes.com/bookborrow/api/add",
            method: "GET",
            data: {
                isbn: app.globalData.isbn,
                accuracy: geoinfo.accuracy,
                latitude: geoinfo.latitude,
                longitude: geoinfo.longitude,
                altitude: geoinfo.altitude === undefined ? -1 : geoinfo.altitude,
                vertical_accuracy: geoinfo.verticalAccuracy,
                horizontal_accuracy: geoinfo.horizontalAccuracy
            },
            success: (res) => {
                console.log(res)
                let config = {};
                config.own_it = 'hide'
                config.own_it_too = 'hide'
                config.owners_class = 'show'
                config.owners = []
                let name = {
                    name: userinfo.nickName,
                    color: app.globalData.colors[Math.floor(Math.random() * app.globalData.colors.length)]
                };
                if (res.data.success === 1) {
                    config.owners = this.data.owners
                }
                config.owners.push(name)
                this.setData(config)
            },
            fail: (err) => {
                console.log(err)
            }
        })
    },
    test: function (e) {
        wx.login({
            success: res => {
                let code = res.code; // 复制给变量就可以打印了，醉了
                if (res.code) {
                    wx.getUserInfo({
                        success: function (res) {
                            // userInfo 只存储个人的基础数据
                            wx.setStorageSync('userInfo', res.userInfo);

                            // 只获取openid的话，自己就可以
                            that.getOpenid(code);
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        })
        wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
                console.log(res)
            }
        })
    }
})

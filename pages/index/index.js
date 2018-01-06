//index.js
let fv = require('../../utils/util.js');
let settings = require('../../config/settings.js')
//获取应用实例
const app = getApp()
//app.globalData.colors = ['palegoldenrod', 'beige', 'lightgoldenrodyellow']
app.globalData.isbn = ''
Page({
    data: {
        book: {},
        own_it: 'hide',
        own_it_too: 'hide',
        owners: [],
        owners_class: 'hide',
        message_class: 'hide',
        message: '',
        userInfo: app.globalData.userInfo || {nickName: "用户"},
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
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else {
            app.userInfoReadyCallback = (res) => {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true
                })
            }
        }
    },
    scan: function (e) {
        console.log(e)
        fv.scanCode({
            onlyFromCamera: true
        })
            .then((res) => {
                if (res.scanType === "QR_CODE") {
                    let config = {}
                    config.message_class = "show"
                    config.message = "不要扫二维码啊小伙子，去扫条形码！"
                    this.setData(config)
                    return Promise.reject()
                } else {
                    app.globalData.isbn = res.result
                    return fv.requestTemplet({
                        url: settings.rootUrl + "api/search/",
                        data: {
                            isbn: app.globalData.isbn,
                            user: this.data.userInfo.nickName
                        },
                        method: "GET"
                    })
                }
            })//扫描回调
            .then((res) => {
                let config = {}
                config.book = {}
                config.book.name = res.data.title + "," + res.data.rate + "★"
                config.book.author = res.data.author
                config.book.translator = res.data.translator ? res.data.translator : undefined
                config.book.publisher = res.data.publisher
                config.book.image = res.data.img
                config.owners_class = 'hide'
                config.own_it = 'hide'
                config.own_it_too = 'hide'
                if (res.data.title === "没找到") {
                    //如果没找到书的话，什么都不做
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
            })//查询回调
            .catch(fv.exception)
    },
    add: function (e) {
        let userinfo = app.globalData.userInfo;
        let geoinfo = app.globalData.geoInfo;
        fv.requestTemplet({
            url: settings.rootUrl + "api/add",
            data: {
                isbn: app.globalData.isbn,
                accuracy: geoinfo.accuracy,
                latitude: geoinfo.latitude,
                longitude: geoinfo.longitude,
                altitude: geoinfo.altitude === undefined ? -1 : geoinfo.altitude,
                vertical_accuracy: geoinfo.verticalAccuracy,
                horizontal_accuracy: geoinfo.horizontalAccuracy
            },
            method: "GET",
        })//添加书籍
            .then((res) => {
                let config = {};
                config.own_it = 'hide'
                config.own_it_too = 'hide'
                config.owners_class = 'show'
                config.owners = []
                let name = {
                    name: userinfo.nickName,
                    avatarUrl: userinfo.avatarUrl
                }
                if (res.data.success === 1) {
                    config.owners = this.data.owners
                }
                config.owners.push(name)
                this.setData(config)
            })
            .catch(fv.exception)
    },
    test: function (e) {
        fv.login()
            .then((res) => {
                let code = res.code; // 复制给变量就可以打印了，醉了
                if (res.code) {
                    return fv.getUserInfo()
                } else {
                    return Promise.reject("获取用户登录态失败！" + res.errMsg)
                }
            })
            .then((res) => {
                // userInfo 只存储个人的基础数据
                wx.setStorageSync('userInfo', res.userInfo);
                // 只获取openid的话，自己就可以
                that.getOpenid(code);
            })
            .catch(fv.exception)
        wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
                console.log(res)
            }
        })
    }
})

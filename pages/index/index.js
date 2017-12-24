//index.js
//获取应用实例
const app = getApp()
app.globalData.colors = ['palegoldenrod', 'beige', 'lightgoldenrodyellow']
app.globalData.isbn=''
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
    userInfo: {},
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
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  scan: function (e) {
    console.log(e)
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        var config = {}
        config.message_class = 'hide'
        config.owners = []
        console.log(res)
        if(res.scanType=="QR_CODE"){
          config.message_class = "show"
          config.message = "不要扫二维码啊小伙子，去扫条形码！"
          this.setData(config)
          return
        }
        app.globalData.isbn = res.result
        console.log(app.globalData.isbn)
        wx.request({
          url: "https://favormylikes.com/bookborrow/api/search/?isbn=" + app.globalData.isbn + "&user=" + this.data.userInfo.nickName,
          success: (res) => {
            console.log(res)
            config.name = res.data.title + "," + res.data.rate +"★"
            config.author = res.data.author
            config.translator = res.data.translator 
            config.publisher = res.data.publisher
            config.img = res.data.img
            config.owners_class = 'hide'
            config.own_it = 'hide'
            config.own_it_too = 'hide'
            if (res.data.title == "没找到"){console.log(config)}
            else if (res.data.nick_name.length == 0) {
              config.own_it = 'show'
            } else {
              console.log(this.data.userInfo.nickName)
              console.log(res.data.nick_name)
              var index = res.data.nick_name.indexOf(this.data.userInfo.nickName)
              var names = []
              for (var n in res.data.nick_name) {
                var name = {
                  name: res.data.nick_name[n],
                  color: app.globalData.colors[Math.floor(Math.random() * app.globalData.colors.length)]
                }
                names.push(name)
              }
              if (index == -1) {
                config.own_it_too = 'show'
                if (!app.globalData.geoInfo) {
                  wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                      app.globalData.geoInfo = res
                      console.log(res)
                    }
                  })
                }
              } else { config.owners_class = 'show' }
              config.owners = names
              console.log(names)
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
  add:function(e){
    var userinfo = app.globalData.userInfo
    var geoinfo = app.globalData.geoInfo
    wx.request({
      url: "https://favormylikes.com/bookborrow/api/add",
      method: "GET",
      data:{
        isbn: app.globalData.isbn,
        nick_name: userinfo.nickName,
        avatar_url: userinfo.avatarUrl,
        gender: userinfo.gender,
        language: userinfo.language,
        country: userinfo.country,
        province: userinfo.province,
        city: userinfo.city,
        latitude: geoinfo.latitude,
        longitude: geoinfo.longitude,
        altitude: geoinfo.altitude === undefined ? -1 : geoinfo.altitude,
        vertical_accuracy: geoinfo.verticalAccuracy,
        horizontal_accuracy: geoinfo.horizontalAccuracy
      },
      success: (res) => {
        console.log(res)
        var config = {}
        config.own_it='hide'
        config.own_it_too = 'hide'
        config.owners_class='show'
        var name = {
          name: userinfo.nickName,
          color: app.globalData.colors[Math.floor(Math.random() * app.globalData.colors.length)]
        }
        if(res.data.success==1){
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
      success: res =>{
      var code = res.code; // 复制给变量就可以打印了，醉了
      if(res.code) {
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
      success:(res)=>{
        console.log(res)
      }
    })
  }
})

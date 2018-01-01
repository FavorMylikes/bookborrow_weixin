//用来实现cookies的存储，以完成session功能
function request(obj) {
    wx.request({
        url: obj.url,
        data: obj.data,
        method: obj.method,
        header: {
            cookie: wx.getStorageSync('cookie')
        },
        success: function (res) {
            if (res.header['Set-Cookie'])
                wx.setStorageSync('cookie', res.header['Set-Cookie'])
            obj.success(res)
        },
        fail: function (res) {
            obj.fail(res)
        }
    })
}

module.exports = {
    request: request
}


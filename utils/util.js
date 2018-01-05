const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function promisify(fn = (obj)=>{}, before = (obj) => {}, after = (res) => {}) {
    return function (obj = {}) {
        return new Promise((resolve = (res) => {console.log(res)}, reject = (err)=>{console.log(err)}) => {
            obj.success = (res) => {
                console.log(res)
                after(res)
                resolve(res)
            }
            obj.fail = reject
            before(obj)
            fn(obj)
        })
    }
}

//用来实现cookies的存储，以完成session功能
//requestTemplet(obj)返回一个请求模板涵数，再次调用才是真正的请求，同时返回一个Promise对象
let requestTemplet = promisify(wx.request,
    (obj) => {
        obj.header = {
            cookie: wx.getStorageSync('cookie')
        }
    },
    (res) => {
        if (res.header['Set-Cookie'])
            wx.setStorageSync('cookie', res.header['Set-Cookie'])
    })

let getLocationTemplet = promisify(wx.getLocation)
let getLocation = getLocationTemplet({
    type: 'wgs84',
})

let scanCode = promisify(wx.scanCode)
let getUserInfo = promisify(wx.getUserInfo)
let getSetting = promisify(wx.getSetting)
let login = promisify(wx.login)
let exception = (err) => {console.log(err)}
module.exports = {
    formatTime: formatTime,
    requestTemplet: requestTemplet,
    getUserInfo: getUserInfo,
    getSetting: getSetting,
    getLocation: getLocation,
    login: login,
    scanCode: scanCode,
    exception: exception,
    promisify: promisify
}

const VERSION = '20231111-AD'

if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

function showVersion() {
    console.log('当前版本：' + VERSION)
    console.log('https://github.com/monsternone/tmall-miao')
    toast('当前版本：' + VERSION)
}

function getSetting() {
    let indices = []
    autoOpen && indices.push(0)
    autoMute && indices.push(1)
    autoJoin && indices.push(2)
    indices.push(3)

    let settings = dialogs.multiChoice('任务设置', ['自动打开京东进入活动。多开或任务列表无法自动打开时取消勾选', '自动调整媒体音量为0。以免直播任务发出声音，首次选择需要修改系统设置权限', '自动完成入会任务。京东将授权手机号给商家，日后可能会收到推广短信', '此选项用于保证选择的处理，勿动！'], indices)

    if (settings.length == 0) {
        toast('取消选择，任务停止')
        exit()
    }

    if (settings.indexOf(0) != -1) {
        storage.put('autoOpen', true)
        autoOpen = true
    } else {
        storage.put('autoOpen', false)
        autoOpen = false
    }
    if (settings.indexOf(1) != -1) {
        storage.put('autoMute', true)
        autoMute = true
    } else {
        storage.put('autoMute', false)
        autoMute = false
    }
    if (settings.indexOf(2) != -1) {
        storage.put('autoJoin', true)
        autoJoin = true
    } else {
        storage.put('autoJoin', false)
        autoJoin = false
    }
}

// 自定义取消亮屏的退出方法
function quit() {
    device.cancelKeepingAwake()
    exit()
}

// 监听音量下键
function registerKey() {
    try {
        events.observeKey()
    } catch (err) {
        console.log('监听音量键停止失败，应该是无障碍权限出错，请关闭软件后台任务重新运行。')
        console.log('如果还是不行可以重启手机尝试。')
        quit()
    }
    events.onKeyDown('volume_down', function (event) {
        console.log('京东任务脚本停止了')
        console.log('请手动切换回主页面')
        quit()
    })
}

// 自定义一个findTextDescMatchesTimeout
function findTextDescMatchesTimeout(reg, timeout) {
    let c = 0
    while (c < timeout / 500) {
        let result = textMatches(reg).findOnce() || descMatches(reg).findOnce()
        if (result) return result
        sleep(500)
        c++
    }
    return null
}

// 自定义一个findTimeout，find_f是原本的查询器 text('sss').find()
function findTimeout(findF, timeout) {
    let c = 0
    while (c < timeout / 50) {
        let result = findF.find()
        if (result.nonEmpty()) return result
        sleep(50)
        c++
    }
    return null
}

// 打开京东进入活动
function openAndInto() {
    console.log('正在打开京东App...')
    if (!launch('com.jingdong.app.mall')) {
        console.log('可能未安装京东App')
    } else {
        console.log('等待京东打开')
        for (let i = 0; i < 20; i++) {
            if (currentPackage() == 'com.jingdong.app.mall') break
            sleep(400)
        }
        if (currentPackage() != 'com.jingdong.app.mall') {
            console.log('程序检测京东app打开失败，请注意')
        }
    }

    sleep(2000)
    console.log('进入活动页面')

    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/0b7ymyB","M_sourceFrom":"mxz","msf_type":"auto"}'
    })
}

// 打开任务列表
function openTaskList() {
    let anchor = textMatches(/(活动时间：|今日机会)[\s\S]*/).findOne(10000)
    if (!anchor) {
        console.log('无法找到弹窗标识1，退出')
        quit()
    }
    if (anchor.text().match(/活动时间：[\s\S]*/)) {
        console.log('点击打开任务列表1')
        let tmp = anchor.parent().parent()
        tmp.child(tmp.childCount() - 1).click()
    }

    anchor = textMatches(/立即领取|查看进度/).findOne(10000)
    if (!anchor) {
        console.log('无法找到弹窗标识2，退出')
        quit()
    }
    console.log('点击打开任务列表2')
    anchor.click()

    anchor = textContains('打卡领').findOne(10000)
    if (!anchor) {
        console.log('无法找到任务列表，退出')
        quit()
    }
}

function backToList() {
    sleep(500)
    const listFlag = textContains('打卡领')
    if (listFlag.findOnce()) {
        console.log('已经处于上级页面')
        return
    }
    back()
    for (let i = 0; i < 5; i++) { // 尝试返回3次
        if (!listFlag.findOne(2000)) {
            console.log('返回失败，重试返回')
            sleep(2000)
            back()
            continue
        } else {
            break
        }
    }
    sleep(3000)
}

function reopenTaskList() {
    console.log('关闭任务列表')
    let anchor = textContains('邀请好友领额外').findOne(5000)
    if (!anchor) {
        console.log('无法找到邀请标识，退出')
        quit()
    }
    anchor = anchor.parent().parent()
    console.log('关闭任务列表')
    anchor.child(1).click()
    sleep(1000)

    gesture(5000, [500, device.height - 200], [300, device.height - 500], [500, device.height - 200], [300, device.height - 500], [500, device.height - 500], [300, device.height - 200], [500, device.height - 500], [300, device.height - 200])

    console.log('重新打开任务列表')
    anchor = text('去领取').findOne(5000)
    console.log('点击打开任务列表')
    anchor.click()

    if (!textContains('打卡领').findOne(5000)) {
        console.log('重新打开任务列表失败，退出')
        quit()
    }
    sleep(1000)
}

// --------------------------------------------
// 开始
// --------------------------------------------

console.show()
showVersion()

threads.start(registerKey)

let storage = storages.create("jd_hb");
let autoOpen = storage.get('autoOpen', true)
let autoMute = storage.get('autoMute', true)
let autoJoin = storage.get('autoJoin', true)
getSetting()

if (autoMute) {
    try {
        device.setMusicVolume(0)
        toast('成功设置媒体音量为0')
    } catch (err) {
        alert('首先需要开启修复音量权限，请开启后再次运行脚本')
        exit()
    }
}

console.log('开始完成京东任务...')
console.log('按音量下键停止')

device.keepScreenDim(30 * 60 * 1000) // 防止息屏30分钟

const indexFlag = textMatches(/活动时间[\s\S]*|今日机会[\s\S]*/)

// 全局try catch，应对无法显示报错
try {
    if (autoOpen) {
        openAndInto()
        console.log('等待活动页面加载')
        if (!indexFlag.findOne(20000)) {
            console.log('未能进入活动，请重新运行！')
            quit()
        }
        console.log('成功进入活动')
    } else {
        alert('请关闭弹窗后立刻手动打开京东App进入活动页面', '搜索“抢福袋969”直达，限时30秒')
        console.log('请手动打开京东App进入活动页面')
        if (!indexFlag.findOne(30000)) {
            console.log('未能进入活动，请重新运行！')
            quit()
        }
        console.log('成功进入活动')
    }

    openTaskList()
    console.log('任务列表已打开，开始任务')

    const tasks = findTimeout(textMatches(/去完成|已完成/), 5000)
    for (let task of tasks) {
        if (task.text() == '已完成') continue
        
        // press(task.bounds().centerX(), task.bounds().centerY(), 1500)
        console.log('尝试进入任务')
        task.click()
        sleep(3000)
        // 根据任务列表存在情况判断
        let flag = 0
        let count = 0
        if (textContains('打卡领').exists()) {
            console.log('尝试进入任2')
            task.click()
            sleep(3000)
        }
        if (textContains('打卡领').exists()) {
            console.log('助手判断未能进入任务，退出')
            // console.log('京东')
            quit()
        }
        console.log('已进入。由于任务标识为纯图片，无法判断情况，等待12秒后自动返回')
        sleep(12000)
        console.log('完成，返回')
        backToList()
        // reopenTaskList()
    }
    // let share = text('去分享').findOne(3000)
    // if (share) {
    //     console.log('进行分享任务')
    //     task.click()
    //     if (textContains('分享好友一起').findOne(3000)) {
    //         click(200, 300)
    //     } else {
    //         console.log('未找到分享弹窗，失败')
    //     }
    // }
    console.log('任务已经全部完成，退出')
    alert('记得手动分享领取打卡红包并抽盲盒！')
} catch (err) {
    device.cancelKeepingAwake()
    if (err.toString() != 'JavaException: com.stardust.autojs.runtime.exception.ScriptInterruptedException: null') {
        console.error(err)
    }
    showVersion()
}

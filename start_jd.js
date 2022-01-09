if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

if (confirm('是否需要自动调整媒体音量为0', '以免直播任务发出声音。需要修改系统设置权限。')) {
    try {
        device.setMusicVolume(0)
        toast('成功设置媒体音量为0')
    } catch (err) {
        alert('首先需要开启权限，请开启后再次运行脚本')
        exit()
    }
} else {
    toast('不修改媒体音量')
}

if (!requestScreenCapture(false)) {
    alert('请求截图权限，用以查找按钮，请允许')
    console.show()
    console.log("请求截图失败，退出");
    exit();
} else {
    console.show()
    console.log('截图请求成功')
}


let join = confirm('是否自动完成入会任务？', '入会将会自动授权手机号给京东商家')

console.log('开始完成京东任务...')
console.log('按音量下键停止')

device.keepScreenDim(30 * 60 * 1000) // 防止息屏30分钟

// 监听音量下键
function registerKey() {
    events.observeKey()
    events.onKeyDown('volume_down', function (event) {
        console.log('京东任务脚本停止了')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    })
}
threads.start(registerKey)

// 自定义一个findTextDescMatchesTimeout
function findTextDescMatchesTimeout(reg, timeout) {
    let c = 0
    while (c < timeout / 50) {
        let result = textMatches(reg).findOnce() || descMatches(reg).findOnce()
        if (result) return result
        sleep(50)
        c++
    }
    return null
}

// 全局try catch，应对无法显示报错
try {

    // 自定义去取消亮屏的退出方法
    function quit() {
        device.cancelKeepingAwake()
        exit()
    }

    // 打开京东
    console.log('正在打开京东App...')
    if (!launch('com.jingdong.app.mall')) {
        console.log('未找到京东App，请先下载！')
        quit()
    }

    sleep(2000)

    // // 进入活动
    // console.log('等待页面加载...')
    // if (currentActivity() != 'com.jingdong.app.mall.MainFrameActivity') {
    //     console.log('请让京东处于App首页')
    // }
    // const into = descContains('浮层活动').findOne(20000)
    // sleep(2000)
    // if (into == null) {
    //     console.log('无法找到活动入口，异常退出！')
    //     quit()
    // }
    // click(into.bounds().centerX(), into.bounds().centerY())
    // click(into.bounds().centerX(), into.bounds().centerY())
    console.log('进入活动页面')

    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","des":"m","sourceValue":"babel-act","sourceType":"babel","url":"https://wbbny.m.jd.com/babelDiy/Zeus/41AJZXRUJeTqdBK9bPoPgUJiodcU/index.html?babelChannel=","M_sourceFrom":"h5auto","msf_type":"auto"}'
    })

    if (!findTextDescMatchesTimeout(/.*闯关分红包.*/, 20000)) {
        console.log('未能进入活动，请重新运行！')
        quit()
    }
    // scrollDown()
    sleep(2000)
    // scrollUp()

    console.log('打开任务列表')
    let taskListButtons = textMatches(/.*消耗.*/).findOne(20000)
    if (!taskListButtons) {
        console.log('未能打开任务列表，请关闭京东重新运行！')
        quit()
    }
    if (taskListButtons.indexInParent() <= 2) {
        taskListButtons = taskListButtons.parent()
    }
    taskListButtons = taskListButtons.parent().children()
    if (taskListButtons.empty()) {
        console.log('未能打开任务列表，请关闭京东重试！')
        quit()
    }
    let flag
    let taskListButton
    console.log('开始寻找列表')
    for (let i = 0; i < taskListButtons.length; i++) {
        let item = taskListButtons[i]
        if ((item.text() && item.text().match(/消耗.*爆竹/)) || (item.desc() && item.desc().match(/消耗.*爆竹/))) {
            flag = i
            continue
        }
        if (flag) {
            if (item.clickable()) {
                console.log('找到控件')
                taskListButton = item
                break
            }
        }
    }
    console.log('寻找列表结束')
    if (!taskListButton || !taskListButton.clickable()) {
        console.log('无法找到任务列表控件')
        quit()
    }
    taskListButton.click()
    if (!findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)) {
        console.log('似乎没能打开任务列表，退出')
        quit()
    }

    // 为了稳定页面布局
    (() => {
        console.log('进行一次试探性寻找，稳定页面布局')
        let taskButtons = textMatches(/.*浏览并关注.*|.*浏览.*s.*|.*累计浏览.*|.*浏览可得.*|.*逛晚会.*/).find()
        if (taskButtons.empty()) {
            console.log('未找到浏览任务，退出')
            quit()
        }
        let item = taskButtons[0]
        taskText = item.text()
        item = item.parent().child(3)
        console.log('进入，稍后返回')
        item.click()
        sleep(5000)
        console.log('返回')
        back()
        let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
        if (!r) back()
        sleep(3000)
    })()

    while (true) {
        function timeTask() {
            taskButton.click()
            console.log('等待浏览任务完成...')
            let c = 0
            while (c < 40) { // 0.5 * 40 = 20 秒，防止死循环
                let finish_reg = /获得.*?爆竹|已达上限/
                if ((textMatches(finish_reg).exists() || descMatches(finish_reg).exists())) // 等待已完成出现，有可能失败
                    break
                sleep(500)
                c++
            }
            if (c > 39) {
                console.log('未检测到任务完成标识。返回。')
            }
        }

        function itemTask(cart) {
            taskButton.click()
            console.log('等待进入商品列表...')
            textContains('当前页点击浏览').findOne(10000)
            sleep(2000)
            let items = textContains('.jpg!q70').find()
            for (let i = 0; i < items.length; i++) {
                if (cart) {
                    console.log('加购并浏览')
                    let tmp = items[i].parent().parent()
                    tmp.child(tmp.childCount() - 1).click()
                } else {
                    console.log('浏览商品页')
                    items[i].parent().parent().child(4).click()
                }
                sleep(5000)
                console.log('返回')
                back()
                sleep(5000)
                let r = textContains('.jpg!q70').findOnce()
                if (!r) {
                    back()
                    sleep(5000)
                }
                if (i > 4) {
                    break
                }
            }
        }

        function shopTask() {
            taskButton.click()
            console.log('等待进入店铺列表...')
            textContains('每逛').findOne(10000)
            sleep(2000)
            for (let i = 0; i < 4; i++) {
                let shop = textContains('.jpg!q70').findOnce()
                console.log('浏览店铺页')
                shop.parent().parent().click()
                sleep(8000)
                console.log('返回')
                back()
                sleep(5000)
                let r = textContains('.jpg!q70').findOnce()
                if (!r) {
                    back()
                    sleep(5000)
                }
            }
        }

        console.log('寻找未完成任务...')
        let taskButtons = textMatches(/.*浏览并关注.*|.*浏览.*s.*|.*累计浏览.*|.*浏览可得.*|.*逛晚会.*/).find()
        if (taskButtons.empty()) {
            console.log('未找到浏览任务，退出')
            quit()
        }

        let taskButton, taskText
        let img = captureScreen()
        for (let i = 0; i < taskButtons.length; i++) {
            let item = taskButtons[i]
            taskText = item.text()
            item = item.parent().child(3)
            let b = item.bounds()
            let x = b.left + b.width() / 15
            let y = b.top + b.height() / 2
            let color = images.pixel(img, x, y)
            let compare = colors.isSimilar(color, '#d6413f') || colors.isSimilar(color, '#d54c4c')
            console.log(taskText, colors.toString(color), x, y, compare)
            if (compare) {
                if (!join && taskText.match(/成功入会/)) continue
                taskButton = item
                break
            }
        }

        if (!taskButton) {
            console.log('未找到可自动完成的任务，退出。')
            console.log('如果活动页有弹窗遮挡，烦请手动关闭。')
            console.log('入会任务、互动任务、品牌墙需要手动完成。')
            console.log('小米机型无法找到任务，需要给予脚本“后台弹出页面”权限。')
            alert('任务已完成', '别忘了在脚本主页领取双十一红包！')
            quit()
        }

        if (taskText.match(/浏览并关注.*s|浏览.*s/)) {
            console.log('进行', taskText)
            timeTask()

            console.log('完成浏览任务，返回')
            back()
            let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
            if (!r) back()
            sleep(3000)
        } else if (taskText.match(/累计浏览/)) {
            console.log('进行累计浏览任务')

            if (taskText.match(/加购/)) itemTask(true)
            else itemTask(false)

            console.log('完成浏览商品，返回')
            back()
            let r = textMatches(/.*累计任务奖.*/).findOne(8000)
            if (!r) back()
            sleep(3000)
        } else if (join && taskText.match(/入会/)) {
            console.log('进行入会任务，等待加载...')
            taskButton.click()
            let check = textMatches(/.*确认授权即同意.*|.*我的特权.*/).findOne(20000)
            if (!check) {
                console.log('无法找到入会按钮，返回')
                back()
                let r = textMatches(/.*累计任务奖.*/).findOne(8000)
                if (!r) back()
                sleep(5000)
                continue
            } else if (check.text().match(/我的特权/)) {
                console.log('已经入会，返回')
                back()
                let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
                if (!r) back()
                sleep(3000)
                continue
            }
            sleep(2000)
            check = check.parent().child(5).bounds()
            console.log('即将勾选授权，自动隐藏控制台')
            console.hide()
            sleep(500)
            click(check.centerX(), check.centerY())
            sleep(500)
            try {
                let j = text('确认授权并加入店铺会员').findOnce().bounds()
                click(j.centerX(), j.centerY())
            } catch(err) {
                console.log('入会任务出现异常！停止完成入会任务。')
                join = 0
                sleep(500)
            }
            sleep(500)
            console.show()
            back()
            console.log('等待返回...')
            let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
            if (!r) back()
            sleep(5000)
        } else if (taskText.match(/浏览可得|浏览并关注|晚会/)) {
            let taskName = taskButton.parent().child(1).text()
            if (taskName.match(/种草城/)) {
                shopTask()
                back()
                sleep(5000)
            } else {
                console.log('进行参观任务')
                taskButton.click()
                sleep(5000)
                console.log('直接返回')
                back()
                let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
                if (!r) back()
                sleep(3000)
            }
        } else {
            console.log('未知任务类型，默认为浏览任务', taskText)
            timeTask()

            console.log('完成浏览任务，返回')
            back()
            let r = findTextDescMatchesTimeout(/.*累计任务奖.*/, 8000)
            if (!r) back()
            sleep(3000)
        }

    }
} catch (err) {
    device.cancelKeepingAwake()
    if (err.toString() != 'JavaException: com.stardust.autojs.runtime.exception.ScriptInterruptedException: null') {
        console.error(err)
    }
}
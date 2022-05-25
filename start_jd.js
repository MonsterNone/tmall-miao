if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

console.show()

function getSetting() {
    let indices = []
    autoOpen && indices.push(0)
    autoMute && indices.push(1)
    autoJoin && indices.push(2)

    let settings = dialogs.multiChoice('任务设置', ['自动打开京东进入活动。多开或任务列表无法自动打开时取消勾选', '自动调整媒体音量为0。以免直播任务发出声音，首次选择需要修改系统设置权限', '自动完成入会任务。京东将授权手机号给商家，日后可能会收到推广短信'], indices)

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

let storage = storages.create("jd_task");
let autoOpen = storage.get('autoOpen', true)
let autoMute = storage.get('autoMute', true)
let autoJoin = storage.get('autoJoin', true)
getSetting()

if (autoMute) {
    try {
        device.setMusicVolume(0)
        toast('成功设置媒体音量为0')
    } catch (err) {
        alert('首先需要开启权限，请开启后再次运行脚本')
        exit()
    }
}

console.log('开始完成京东任务...')
console.log('按音量下键停止')

device.keepScreenDim(30 * 60 * 1000) // 防止息屏30分钟

// 自定义取消亮屏的退出方法
function quit() {
    device.cancelKeepingAwake()
    exit()
}

// 监听音量下键
function registerKey() {
    events.observeKey()
    events.onKeyDown('volume_down', function (event) {
        console.log('京东任务脚本停止了')
        console.log('请手动切换回主页面')
        quit()
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

// 打开京东进入活动
function openAndInto() {
    console.log('正在打开京东App...')
    if (!launch('com.jingdong.app.mall')) {
        console.log('可能未安装京东App')
    }

    sleep(2000)
    console.log('进入活动页面')

    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","action":"to","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"https://u.jd.com/JdbEbUe","M_sourceFrom":"mxz","msf_type":"auto"}'
    })
}

// 打开任务列表
function openTaskList() {
    console.log('打开任务列表')
    let taskListButtons = text('消耗').findOne(20000)
    if (!taskListButtons) {
        console.log('未能打开任务列表，请关闭京东重新运行！')
        quit()
    }
    taskListButtons = taskListButtons.parent().parent().parent().parent().children()

    let taskListButton = null
    let flag = 0
    for (let i = 3; i < taskListButtons.length; i++) { // 从第4（4-1）个开始
        if (taskListButtons[i].clickable()) {
            if (flag) {
                taskListButton = taskListButtons[i]
                break
            } else {
                flag = 1
                continue
            }
        }
    }

    if (!taskListButton || !taskListButton.clickable()) {
        console.log('无法找到任务列表控件')
        quit()
    }
    taskListButton.click()
    if (!findTextDescMatchesTimeout(/累计任务奖励/, 10000)) {
        console.log('似乎没能打开任务列表，退出！')
        console.log('如果已经打开而未检测到，请删除101版本及以上的webview或使用国内应用市场版京东尝试。')
        quit()
    }
}

// 关闭任务列表
function closeTaskList() {
    console.log('关闭任务列表')
    let jiangli = findTextDescMatchesTimeout(/累计任务奖励/, 5000)
    if (!jiangli) {
        console.log('无法找到任务奖励标识')
        return false
    }
    let closeBtn = jiangli.parent().child(1)
    return closeBtn.click()
}

// 重新打开任务列表
function reopenTaskList() {
    closeTaskList()
    sleep(3000)
    openTaskList()
    sleep(5000)
}

// 获取未完成任务，根据数字标识，返回任务按钮、任务介绍、任务数量（数组）
function getTaskByText() {
    let tButton = null,
        tText = null,
        tCount = 0,
        tTitle = null
    console.log('寻找未完成任务...')
    let taskButtons = textMatches(/.*浏览并关注.*|.*浏览.*s.*|.*累计浏览.*|.*浏览可得.*|.*逛晚会.*|.*品牌墙.*|.*打卡.*/).find()
    if (!taskButtons.empty()) { // 如果找不到任务，直接返回
        for (let i = 0; i < taskButtons.length; i++) {
            let item = taskButtons[i]
            tTitle = item.parent().child(1).text()
            let r = tTitle.match(/(\d)\/(\d*)/)
            if (!r) continue

            tCount = (r[2] - r[1])

            console.log(tTitle, tCount)
            if (tCount) { // 如果数字相减不为0，证明没完成
                tText = item.text()
                if (!autoJoin && tText.match(/成功入会/)) continue
                if (tText.match(/下单/)) continue
                tButton = item.parent().child(3)
                break
            }
        }
    }
    return [tButton, tText, tCount, tTitle]
}

// 返回任务列表并检查是否成功，不成功重试一次，带有延时
function backToList() {
    sleep(500)
    back()
    for (let i = 0; i < 3; i++) { // 尝试返回3次
        if (!findTextDescMatchesTimeout(/累计任务奖励/, 5000)) {
            console.log('返回失败，重试返回')
            back()
            continue
        } else {
            break
        }
    }
    sleep(3000)
}

// 浏览n秒的任务
function timeTask() {
    console.log('等待浏览任务完成...')
    let c = 0
    while (c < 40) { // 0.5 * 40 = 20 秒，防止死循环
        if ((textMatches(/获得.*?金币/).exists() || descMatches(/获得.*?金币/).exists())) // 等待已完成出现
            break
        if ((textMatches(/已达上限/).exists() || descMatches(/已达上限/).exists())) { // 失败
            console.log('上限，返回刷新任务列表')
            return false
        }

        // 弹窗处理
        let pop = text('升级开卡会员领好礼').exists()
        if (pop) {
            pop.parent().parent().child(2).click()
            console.log('关闭会员弹窗')
        }

        sleep(500)
        c++
    }
    if (c > 39) {
        console.log('未检测到任务完成标识。')
        return false
    }
    return true
}

// 入会任务
function joinTask() {
    let check = textMatches(/.*确认授权即同意.*|.*我的特权.*|.*立即开卡.*|.*解锁全部会员福利.*/).findOne(8000)
    if (!check) {
        console.log('无法找到入会按钮，判定为已经入会')
        return true
    } else if (check.text().match(/我的特权/)) {
        console.log('已经入会，返回')
        return true
    } else {
        sleep(2000)
        if (check.text().match(/.*立即开卡.*|.*解锁全部会员福利.*/)) {
            let btn = check.bounds()
            console.log('即将点击开卡/解锁福利，自动隐藏控制台')
            console.hide()
            sleep(500)
            click(btn.centerX(), btn.centerY())
            sleep(500)
            check = textMatches(/.*确认授权即同意.*/).findOne(8000)
            sleep(2000)
        }

        if (!check) {
            console.log('无法找到入会按钮弹窗，加载失败')
            return false
        }
        if (check.indexInParent() == 6) {
            check = check.parent().child(5).bounds()
        } else {
            check = check.parent().parent().child(5).bounds()
        }

        console.log('即将勾选授权，自动隐藏控制台', check)
        console.hide()
        sleep(500)
        click(check.centerX(), check.centerY())
        sleep(500)
        try {
            let j = textMatches(/^确认授权(并加入店铺会员)*$/).findOne(8000).bounds()
            if (!j) {
                console.log('无法找到入会按钮，失败')
                return false
            }
            click(j.centerX(), j.centerY())
            sleep(500)
            console.show()
            return true
        } catch (err) {
            console.log('入会任务出现异常！停止完成入会任务。', err)
            autoJoin = 0
            sleep(500)
            console.show()
            return false
        }
    }
}

// 浏览商品和加购的任务，cart参数为是否加购的flag
function itemTask(cart) {
    console.log('等待进入商品列表...')
    if (!textContains('当前页').findOne(10000)) {
        console.log('未能进入商品列表。')
        return false
    }
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
        if (i >= 4 - 1) {
            break
        }
    }
    return true
}

// 逛店任务
function shopTask() {
    console.log('等待进入店铺列表...')
    let banner = textContains('喜欢').findOne(10000)
    if (!banner) {
        console.log('未能进入店铺列表。返回。')
        return false
    }
    let c = banner.text().match(/(\d)\/(\d*)/)
    if (!c) {
        c = 4 // 进行4次
    } else {
        c = c[2] - c[1]
    }
    sleep(2000)
    console.log('进行', c, '次')
    let like = textContains('喜欢').boundsInside(1, 0, device.width, device.height).findOnce()
    if (!like) {
        console.log('未能找到喜欢按钮。返回。')
        return false
    }
    let bound = [like.bounds().centerX(), like.bounds().centerY()]
    console.log('喜欢按钮位于', bound)
    for (let i = 0; i < c; i++) {
        click(bound[0], bound[1])
        console.log('浏览店铺页')
        sleep(8000)
        console.log('返回')
        back()
        sleep(5000)
        let r = textContains('喜欢').findOnce()
        if (!r) {
            back()
            sleep(5000)
        }
    }
    return true
}

// 参观任务
function viewTask() {
    console.log('进行参观任务')
    sleep(5000)
    console.log('参观任务直接返回')
    return true
}

// 品牌墙任务
function wallTask() {
    console.log('进行品牌墙任务')
    sleep(3000)
    for (let i of [2, 4, 6]) { // 选三个
        console.log('打开一个')
        textContains('!q70').findOnce(i).click()
        sleep(5000)
        console.log('直接返回')
        back()
        let r = textContains('!q70').findOne(8000)
        if (!r) back()
        sleep(3000)
    }
    console.log('返回顶部')
    let root = textContains('!q70').findOnce(2).parent().parent().parent().parent().parent().parent()
    root.child(root.childCount() - 1).click()
    console.log('品牌墙完成后重新打开任务列表')
    sleep(3000)
    openTaskList()
    return true
}

// 单个任务的function，自动进入任务、自动返回任务列表，返回boolean
function doTask(tButton, tText, tTitle) {
    let clickFlag = tButton.click()
    let tFlag
    if (tText.match(/浏览并关注.*s|浏览.*s/)) {
        console.log('进行', tText)
        tFlag = timeTask()
    } else if (tText.match(/累计浏览/)) {
        console.log('进行累计浏览任务')
        if (tText.match(/加购/)) {
            tFlag = itemTask(true)
        } else {
            tFlag = itemTask(false)
        }
    } else if (tText.match(/入会/)) {
        console.log('进行入会任务')
        tFlag = joinTask()
    } else if (tText.match(/浏览可得|浏览并关注|晚会/)) {
        let tTitle = tButton.parent().child(1).text()
        if (tTitle.match(/种草城/)) {
            tFlag = shopTask()
        } else {
            tFlag = viewTask()
        }
    } else if (tText.match(/品牌墙/)) {
        tFlag = wallTask()
        return tFlag // 品牌墙无需backToList，提前返回
    } else if (tText.match(/打卡/)) {
        tFlag = clickFlag // 打卡点击一次即可
        return tFlag
    } else {
        console.log('未知任务类型，默认为浏览任务', tText)
        tFlag = timeTask()
    }
    backToList()
    return tFlag
}

function signTask() {
    let anchor = className('android.view.View').filter(function (w) {
        return w.clickable() && (w.text() == '去使用奖励' || w.desc() == '去使用奖励')
    }).findOne(5000)

    if (!anchor) {
        console.log('未找到使用奖励按钮，签到失败')
        return false
    }

    let anchor_index = anchor.indexInParent()
    let sign = anchor.parent().child(anchor_index + 2) // 去使用的后两个
    sign.click()

    sign = textMatches(/.*点我签到.*|.*明天再来.*/).findOne(5000)
    if (!sign) {
        console.log('未找到签到按钮')
        return false
    }

    if (sign.text().match(/明天再来/)) {
        console.log('已经签到')
    } else {
        click(sign.bounds().centerX(), sign.bounds().centerY())
        console.log('签到完成，关闭签到弹窗')

        if (!next) {
            console.log('找不到下一个红包提示语，未能自动关闭弹窗')
            return false
        }
        console.log('关闭签到弹窗')
        next.parent().child(0).click()
    }

    let title = text('每天签到领大额红包').findOne(5000)
    if (!title) {
        console.log('未找到标题，未能自动关闭签到页。')
        return false
    }
    console.log('关闭签到页')
    title.parent().child(0).click()

    return true
}

// 全局try catch，应对无法显示报错
try {
    if (autoOpen) {
        openAndInto()
        console.log('等待活动页面加载')
        if (!findTextDescMatchesTimeout(/.*去使用奖励.*/, 8000)) {
            console.log('未能进入活动，请重新运行！')
            quit()
        }
        console.log('成功进入活动')
        sleep(2000)

        openTaskList();
        sleep(5000)
    } else {
        alert('请关闭弹窗后立刻手动打开京东App进入活动页面，并打开任务列表', '限时30秒')
        console.log('请手动打开京东App进入活动页面，并打开任务列表')
        if (!findTextDescMatchesTimeout(/累计任务奖励/, 30000)) {
            console.log('未能进入活动，请重新运行！')
            quit()
        }
        console.log('成功进入活动')
        sleep(2000)
    }

    // 完成所有任务的循环
    while (true) {
        let [taskButton, taskText, taskCount, taskTitle] = getTaskByText()

        if (!taskButton) {
            console.log('领取累计奖励')
            textContains('去领取').find().forEach(function(e, i) {
                console.log('领取第'+(i+1)+'个累计奖励')
                e.click()
                sleep(2000)
            })

            console.log('最后进行签到任务')
            signTask()

            console.log('没有可自动完成的任务了，退出。')
            console.log('互动任务、下单任务需要手动完成。')
            // alert('任务已完成', '别忘了在脚本主页领取年货节红包！')
            alert('任务已完成', '互动任务手动完成之后还会有新任务，建议做完互动二次运行脚本')
            quit()
        }

        if (taskText.match(/品牌墙/)) { // 品牌墙0/3只需要一次完成
            taskCount = 1
        }

        // 根据taskCount进行任务，一类任务一起完成，完成后刷新任务列表
        console.log('进行' + taskCount + '次“' + taskText + '”类任务')
        for (let i = 0; i < taskCount; i++) {
            console.log('第' + (i + 1) + '次')
            let taskFlag = doTask(taskButton, taskText, taskTitle)
            if (taskFlag) {
                console.log('完成，进行下一个任务')
            } else {
                console.log('任务失败，尝试重新打开任务列表获取任务')
                break // 直接退出，无需在此调用reopen
            }
        }
        console.log('重新打开任务列表获取任务')
        reopenTaskList()
    }
} catch (err) {
    device.cancelKeepingAwake()
    if (err.toString() != 'JavaException: com.stardust.autojs.runtime.exception.ScriptInterruptedException: null') {
        console.error(new Error().stack, err)
    }
}
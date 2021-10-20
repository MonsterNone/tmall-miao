if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

alert('即将请求截图权限，用以查找按钮，请允许')
if (!requestScreenCapture()) {
    console.log("请求截图失败，退出");
    exit();
}

const join = confirm('是否自动完成入会任务？', '入会将会自动授权手机号给京东商家')

console.show()
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

// 打开京东
console.log('正在打开京东App...')
if (!launch('com.jingdong.app.mall')) {
    console.log('未找到京东App，请先下载！')
    exit()
}
sleep(2000)

// 进入活动
console.log('等待页面加载...')
const into = descContains('浮层活动').findOne(20000)
sleep(2000)
if (into == null) {
    console.log('无法找到活动入口，异常退出！')
    exit()
}
click(into.bounds().centerX(), into.bounds().centerY())
click(into.bounds().centerX(), into.bounds().centerY())
console.log('进入活动页面')

if (!textContains('每日签到抽最高').findOne(20000)) {
    console.log('未能进入活动，请重新运行！')
    exit()
}
// scrollDown()
sleep(2000)
// scrollUp()

console.log('打开任务列表')
let taskListButton = textMatches(/.*消耗.*汪汪币/).findOne(20000)
if (!taskListButton) {
    console.log('未能打开任务列表，请关闭京东重新运行！')
    exit()
}
taskListButton = taskListButton.parent().children()
let flag
for (let i = 7; i < taskListButton.length; i++) {
    let item = taskListButton[i]
    if (item.text().match(/消耗.*汪汪币/)) {
        flag = i
        continue
    }
    if (flag) {
        if (item.clickable()) {
            taskListButton = item
            break
        }
    }
}
if (!taskListButton.clickable()) {
    console.log('无法找到任务列表控件')
    exit()
}
taskListButton.click()
sleep(2000)

while (true) {
    function timeTask() {
        taskButton.click()
        console.log('等待浏览任务完成...')
        let c = 0
        while (c < 40) { // 0.5 * 40 = 20 秒，防止死循环
            let finish_reg = /获得.*?汪汪币|任务已达上限/
            if ((textMatches(finish_reg).exists() || descMatches(finish_reg).exists())) // 等待已完成出现，有可能失败
                break
            sleep(500)
            c++
        }
        if (c > 39) {
            console.log('未检测到任务完成标识。返回。')
        }
        back()
        console.log('任务完成，返回')
        sleep(5000)
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
                items[i].parent().parent().child(5).click()
            } else {
                console.log('浏览商品页')
                items[i].parent().parent().child(4).click()
            }
            sleep(5000)
            console.log('返回')
            back()
            sleep(5000)
            if (i >= 4) {
                break
            }
        }
        console.log('完成浏览商品，返回')
        back()
        sleep(5000)
    }

    function shopTask() {
        taskButton.click()
        console.log('等待进入店铺列表...')
        textContains('每逛').findOne(10000)
        sleep(2000)
        for (let i = 0; i < 5; i++) {
            let shop = textContains('.jpg!q70').findOnce()
            console.log('浏览店铺页')
            shop.parent().parent().click()
            sleep(8000)
            console.log('返回')
            back()
            sleep(5000)
        }
    }

    console.log('寻找未完成任务...')
    let taskButtons = textMatches(/.*浏览并关注.*|.*浏览.*s.*|.*累计浏览.*|.*浏览可得.*/).find()
    if (taskButtons.empty()) {
        console.log('未找到浏览任务，退出')
        break
    }

    let taskButton, taskText
    let img = captureScreen()
    for (let i = 0; i < taskButtons.length; i++) {
        let item = taskButtons[i]
        taskText = item.text()
        item = item.parent().child(3)
        let b = item.bounds()
        let color = images.pixel(img, b.left + b.width() / 10, b.top + b.height() / 2)
        if (colors.isSimilar(color, '#fe2a60')) {
            if (!join && taskText.match(/成功入会/)) continue
            taskButton = item
            break
        }
    }

    if (!taskButton) {
        console.log('未找到可自动完成的任务，退出。')
        console.log('入会任务、互动任务需要手动完成。')
        break
    }

    if (taskText.match(/浏览并关注.*s|浏览.*s/)) {
        console.log('进行', taskText)
        timeTask()
    } else if (taskText.match(/累计浏览/)) {
        console.log('进行累计浏览任务')
        if (taskText.match(/加购/)) itemTask(true)
        else itemTask(false)
    } else if (join && taskText.match(/入会/)) {
        console.log('进行入会任务，等待加载...')
        taskButton.click()
        let check = text('确认授权即同意').findOne(20000)
        if (!check) {
            console.log('无法找到入会按钮，返回')
            back()
        }
        sleep(2000)
        check = check.parent().child(0).bounds()
        console.log('即将勾选授权，自动隐藏控制台')
        console.hide()
        sleep(500)
        click(check.centerX(), check.centerY())
        sleep(500)
        let j = text('确认授权并加入店铺会员').findOnce().bounds()
        click(j.centerX(), j.centerY())
        sleep(500)
        console.show()
        console.log('等待自动返回...')
        if (!textContains('累计任务奖励').findOne(8000)) { // 部分任务会自动返回
            console.log('手动返回')
            back()
        }
        sleep(5000)
    } else if (taskText.match(/浏览可得|浏览并关注/)) {
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
            sleep(5000)
        }
    }

}

device.cancelKeepingAwake()
// alert('任务完成！')
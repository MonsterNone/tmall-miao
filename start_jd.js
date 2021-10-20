if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

alert('即将请求截图权限，用以查找按钮，请允许')
if (!requestScreenCapture()) {
    console.log("请求截图失败，退出");
    exit();
}

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
taskListButton = taskListButton.parent().child(9)
taskListButton.click()
sleep(2000)

while (true) {
    function timeTask() {
        taskButton.click()
        console.log('等待浏览任务完成...')
        let c = 0
        while (c < 100) { // 0.5 * 100 = 50 秒，防止死循环
            let finish_reg = /获得.*?汪汪币|任务已达上限/
            if ((textMatches(finish_reg).exists() || descMatches(finish_reg).exists())) // 等待已完成出现，有可能失败
                break
            sleep(500)
            c++
        }
        if (c > 99) {
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
        let color = images.pixel(img, b.left+b.width()/10, b.top+b.height()/2)
        if (colors.isSimilar(color, '#fe2a60')) {
            if (taskText.match(/成功入会/)) continue
            taskButton = item
            break
        }
    }

    if (!taskButton) {
        console.log('未找到可自动完成的任务，退出。')
        console.log('入会任务、互动任务需要手动完成。')
        break
    }

    if (taskText.match(/浏览并关注|浏览.*s/)) {
        console.log('进行', taskText)
        timeTask()
    } else if (taskText.match(/累计浏览/)) {
        console.log('进行累计浏览任务')
        if (taskText.match(/加购/)) itemTask(true)
        else itemTask(false)
    } else if (taskText.match(/浏览可得/)) {
        console.log('进行参观任务')
        taskButton.click()
        sleep(5000)
        console.log('直接返回')
        back()
        sleep(5000)
    }



}

device.cancelKeepingAwake()
alert('任务完成！')
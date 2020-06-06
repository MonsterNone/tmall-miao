if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

console.show()
console.log('开始完成喵币任务...')
console.log('按音量下键停止')

device.keepScreenDim(60 * 60 * 1000)

function registerKey() {
    events.observeKey()
    events.onKeyDown('volume_down', function (event) {
        console.log('喵币任务脚本停止了')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    })
}
threads.start(registerKey)

// 打开淘宝活动页面
console.log('正在打开淘宝...')
var url = 'pages.tmall.com/wow/z/hdwk/n-hdwk-solution/2020618-single'

app.startActivity({
    action: "VIEW",
    data: "taobao://" + url
})
sleep(2000)

console.log('等待页面加载...')

while (true) {
    console.log('寻找任务入口...')
    text('做任务，领喵币').findOne(20000).click()
    var jumpButton = textMatches(/去浏览|去完成/).findOne(10000) // 找进入任务的按钮，10秒

    if (jumpButton == null) {
        console.log('没找到 去浏览/去完成 按钮。也许任务已经全部做完了。退出。')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    }

    console.log('进入任务...')
    jumpButton.click()

    console.log('等待任务完成...')

    if (descMatches(/.*浏览.*/).findOne(10000)) { // 等待浏览出现
        let v = className('android.support.v7.widget.RecyclerView').findOnce() // 滑动
        if (v) {
            sleep(1000)
            v.scrollForward()
        }
    }

    sleep(5000) // 等待15秒

    let finish_c = 0
    while (finish_c < 100) { // 0.5 * 100 = 50 秒，防止死循环
        if (textMatches(/.*完成.*|.*失败.*|.*上限.*|.*开小差.*/).exists() || descMatches(/.*完成.*|.*失败.*|.*上限.*|.*开小差.*/).exists()) // 等待已完成出现，有可能失败
            break
        sleep(500)
        finish_c++
    }

    if (finish_c > 99) {
        console.log('未检测到任务完成标识。退出。')
        console.log('如果你认为这是一个bug请截图反馈。')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    }

    console.log('任务完成，返回')

    if (currentActivity() == 'com.taobao.tao.TBMainActivity') {
        var backButton = descContains('返回618列车').findOnce() // 有可能是浏览首页，有可能无法点击
        if (backButton) {
            if (! backButton.parent().parent().parent().click()) {
                back()
            }
        } else {
            back()
        }
    }
    else {
        back()
    }

    console.log('等待页面刷新...')
    sleep(2000)
}
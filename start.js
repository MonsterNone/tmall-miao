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

// 自定义一个findTimeout，find_f是原本的查询器 text('sss').find()
function findTimeout(findF, timeout) {
    function findSth() {
        result = findF.find()
        if (result.nonEmpty()) {
            return
        }
        sleep(50)
        findSth()
    }

    var result
    var thread = threads.start(findSth)
    thread.join(timeout)

    return result.nonEmpty() ? result : null
}

// 查找任务按钮
function findTask() {
    var jumpButtonFind = textMatches(/去浏览|去搜索|去完成|签到|逛一逛|去逛逛/) // 找进入任务的按钮，10秒
    var jumpButtons = findTimeout(jumpButtonFind, 10000)

    if(!jumpButtons) {
        return null
    } 

    for (var i = 0; i < jumpButtons.length; i++) {
        var taskName
        try {
            taskName = jumpButtons[i].parent().child(0).child(0).text()
        } catch (err) {
            continue
        }
        if (taskName) {
            if (taskName.match(/签到/)) {
                console.log('进行“签到”任务')
                sleep(1000)
                jumpButtons[i].click()
                sleep(8000)
                return findTask()
            }
            if (!taskName.match(/邀请|登录|组队|参与|施肥|浇水|特价版|小鸡/)) {
                console.log('进行“' + taskName + '”任务')
                return jumpButtons[i]
            }
        }
    }

    return null
}

// 打开淘宝活动页面
console.log('正在打开淘宝...')
var url = 'pages.tmall.com/wow/hdwk/act/2020nhj-single'

app.startActivity({
    action: "VIEW",
    data: "taobao://" + url
})
sleep(2000)

console.log('等待页面加载...')

check = textMatches(/免费种下|逛店铺得福气/).findOne(20000) // 判断是否开始任务
if (check == null) {
    console.log('无法找到任务入口')
    exit()
}
else if (check.text() == '免费种下') {
    alert('请首先选择一个水果种下再运行脚本！')
    exit()
}
else {
    try {
        s = textMatches(/.*mWNgYGBg.*/).depth(21).findOnce()
        s.parent().parent().child(s.parent().parent().childCount() - 1).click()
    }
    catch (err) {
        console.log(err)
        console.log('无法进入任务列表，可能是淘宝更新了页面逻辑，请反馈')
        exit()
    }
}

while (true) {
    console.log('寻找任务入口...')
    var jumpButton = findTask()

    if (jumpButton == null) {
        // 没有任务之后领取奖励
        var awardButtonFind = textMatches(/领取奖励/)
        var awardButtons = findTimeout(awardButtonFind, 10000)

        if (awardButtons) {
            for (var i = 0; i < awardButtons.length; i++) {
                console.log('领取累计任务奖励')
                awardButtons[i].click()
                console.log('等待5秒再次领取...')
                sleep(5000)
            }
        }

        console.log('没找到合适的任务。也许任务已经全部做完了。退出。')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        alert('别忘了在脚本主页领取年货节红包！')
        exit()
    }

    console.log('随机延时后进入任务...')
    sleep(random() * 5000)
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
            if (!backButton.parent().parent().parent().click()) {
                back()
            }
        } else {
            back()
        }
    } else {
        back()
    }

    console.log('等待页面刷新...')
    sleep(5000)
}
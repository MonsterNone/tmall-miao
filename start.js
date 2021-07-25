if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

// alert('请把手机放稳，不要摇晃！', '不然有时候会跳出合伙赢喵币，导致任务阻塞')

console.show()
console.log('开始完成奥运任务...')
console.log('按音量下键停止')

device.keepScreenDim(60 * 60 * 1000)

function registerKey() {
    events.observeKey()
    events.onKeyDown('volume_down', function (event) {
        console.log('奥运任务脚本停止了')
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
    var jumpButtonFind = textMatches(/去浏览|去搜索|去完成|签到|逛一逛|去逛逛|去观看|去参赛|去领取/) // 找进入任务的按钮，10秒
    var jumpButtons = findTimeout(jumpButtonFind, 10000)

    if (!jumpButtons) {
        return null
    }

    for (var i = 0; i < jumpButtons.length; i++) {
        var taskName, content
        try {
            taskName = jumpButtons[i].parent().child(0).child(0).text()
            content = jumpButtons[i].parent().child(0).child(1).child(0).text()
        } catch (err) {
            console.log(err)
            continue
        }
        if (taskName) {
            if (taskName.match(/签到/)) {
                console.log('进行签到任务')
                sleep(1000)
                jumpButtons[i].click()
                sleep(8000)
                return findTask()
            }
            if (!(taskName.match(/邀请|登录|组队|参与|施肥|浇水|特价版|小鸡|消除|穿搭|森林|点淘|人生|我的淘宝/) || content.match(/小互动/))) {
                return [taskName, jumpButtons[i]]
            }
        }
    }
    return null
}

function liulan() {
    // if (textMatches(/.*浏览.*/).findOne(10000)) { // 等待浏览出现
    //     let v = className('android.support.v7.widget.RecyclerView').findOnce() // 滑动
    //     if (v) {
    //         sleep(1000)
    //         v.scrollForward()
    //     }
    // }

    sleep(10000) // 等待15秒

    let finish_c = 0
    while (finish_c < 100) { // 0.5 * 100 = 50 秒，防止死循环
        let finish_reg = /.*完成.*|.*失败.*|.*上限.*|.*开小差.*/
        if ((textMatches(finish_reg).exists() || descMatches(finish_reg).exists()) && !text("浏览15秒").exists()) // 等待已完成出现，有可能失败
            break
        if (textMatches(/.*休息会呗.*/).exists()) {
            alert('触发淘宝验证', '请手动验证后返回淘宝首页，重新执行任务')
            console.log('异常退出。')
            exit()
        }
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
}

// 打开淘宝活动页面
console.log('正在打开淘宝...')
var url = 'pages.tmall.com/wow/z/hdwk/game2020v2/olympicgame'

app.startActivity({
    action: "VIEW",
    data: "taobao://" + url
})
sleep(2000)

console.log('等待页面加载...')

try {
    text('集能量').findOne(20000)
    console.log('准备打开任务列表')
    sleep(5000)
    if(click('关闭')) {
        sleep(2000)
    }
    text('集能量').findOnce().click()
    console.log('准备搜索任务')
    sleep(5000)
} catch (err) {
    console.log(err)
    console.log('无法进入任务列表，可能是淘宝更新了页面逻辑，请反馈')
    exit()
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
        // alert('别忘了在脚本主页领取618红包！')
        exit()
    }

    if (jumpButton[0].match('去浏览店铺领能量')) {
        console.log('进行浏览店铺任务')
        jumpButton[1].click()
        while (!textContains('任务完成').exists()) {
            console.log('进入店铺浏览')
            text('逛店最多').findOne(15000).parent().click()
            liulan()
            sleep(5000)
        }
        back()
    } else if (jumpButton[0].match(/.*金币小镇.*|浏览餐饮卡券.*|.*加油赛.*/)) {
        console.log('进行' + jumpButton[0] + '任务，10秒后返回')
        jumpButton[1].click()
        sleep(10000)
        back()
    } else if (jumpButton[0].match(/.*直播.*/)) {
        console.log('进行直播任务')
        jumpButton[1].click()
        sleep(15000)
        var i = 0
        while (i < 30) {
            if (!(textContains('浏览15秒').exists() || descContains('浏览15秒').exists()) || textContains('任务已完成').exists()) {
                break
            }
            i++
            sleep(500)
        }
        back()
    } else {
        console.log('进行' + jumpButton[0] + '任务')
        jumpButton[1].click()
        liulan()
    }

    console.log('等待页面刷新...')
    sleep(5000)
}
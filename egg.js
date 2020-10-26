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

// 打开淘宝活动页面
console.log('正在打开淘宝...')
var url = 's.click.taobao.com/ru7K5vu'

app.startActivity({
    action: "VIEW",
    data: "taobao://" + url
})
sleep(2000)

console.log('等待页面加载...')

text('做任务赢彩蛋').findOne(20000)

while (true) {
    console.log('寻找任务入口...')
    var jumpButton = text('去浏览').findOne(10000)

    if (jumpButton == null) {
        console.log('没找到合适的任务。也许任务已经全部做完了。退出。')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    }

    var taskName
    try {
        taskName = jumpButton.parent().child(1).text()
    } catch (err) {

    }

    if (taskName && taskName.match(/浏览商品详情/)) {
        jumpButton.click()
        var itemList = idEndsWith('J_item_list').findOne(5000)
        try {
            itemList.child(0).child(0).click()
            console.log('等待任务完成...')
            sleep(10000)
            back()
        } catch (err) {

        }
    } else {
        console.log('随机延时后进入任务...')
        sleep(random() * 2500)
        jumpButton.click()

        console.log('等待任务完成...')

        sleep(20000) // 等待20秒
        back()

        // let finish_c = 0
        // while (finish_c < 50) { // 0.5 * 100 = 25 秒，防止死循环
        //     if (textMatches(/奖球/).exists() || descMatches(/奖球/).exists()) // 等待已完成出现，有可能失败
        //         continue
        //     sleep(500)
        //     finish_c++
        // }

        // if (finish_c > 99) {
        //     console.log('未检测到任务完成标识。退出。')
        //     console.log('如果你认为这是一个bug请截图反馈。')
        //     console.log('请手动切换回主页面')
        //     device.cancelKeepingAwake()
        //     exit()
        // }
    }

    console.log('任务完成，返回')

    console.log('等待页面刷新...')
    sleep(2000)
}
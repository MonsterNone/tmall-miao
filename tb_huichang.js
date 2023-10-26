const VERSION = '20231111-K'

if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

let showVersion = function () {
    console.log('当前版本：' + VERSION)
    console.log('https://github.com/monsternone/tmall-miao')
    toast('当前版本：' + VERSION)
}

// alert('请把手机放稳，不要摇晃！', '不然有时候会跳出合伙赢喵币，导致任务阻塞')

function getSetting() {
    let indices = []
    autoOpen && indices.push(0)
    autoMute && indices.push(1)
    indices.push(2)

    let settings = dialogs.multiChoice('任务设置', ['自动打开淘宝进入活动。多开或任务列表无法自动打开时取消勾选（注意，分身运行淘宝大概率导致任务收益变为100）', '自动调整媒体音量为0。以免直播任务发出声音，首次选择需要修改系统设置权限', '此选项用于保证选择的处理，勿动！'], indices)

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
}

let storage = storages.create("tb_task");
let autoOpen = storage.get('autoOpen', true)
let autoMute = storage.get('autoMute', true)
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

console.show()
showVersion()
console.log('开始完成能量任务...')
console.log('按音量下键停止')

device.keepScreenDim(60 * 60 * 1000)

function registerKey() {
    try {
        events.observeKey()
    } catch (err) {
        console.log('监听音量键停止失败，应该是无障碍权限出错，请关闭软件后台任务重新运行。')
        console.log('如果还是不行可以重启手机尝试。')
        quit()
    }
    events.onKeyDown('volume_down', function (event) {
        console.log('喵币任务脚本停止了')
        console.log('请手动切换回主页面')
        device.cancelKeepingAwake()
        exit()
    })
}
threads.start(registerKey)

// 全局try catch，应对无法显示报错
try {

    // 自定义去取消亮屏的退出方法
    function quit() {
        device.cancelKeepingAwake()
        exit()
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

    // 打开任务列表
    function openTaskList() {
        let c = idContains('node_2_icon').findOne(5000)
        if (c) {
            console.log('使用默认方法尝试打开任务列表')
            c.click()
        } else {
            throw '无法找到任务列表入口'
        }
        if (textContains('浏览商品领能量值').findOne(2000)) {
            console.log('关闭弹窗')
            idContains('CLOSE').findOnce().click()
            sleep(1000)
            c.click()
        }
        // if (!textContains('累计任务奖励').findOne(8000)) {
        //     console.log('默认方式打开失败，二次尝试')
        //     console.log('首先检测弹窗')
        //     try {
        //         let anchor = textContains('O1CN010Zax611FU0Z5m6nnQ').findOne(5000)
        //         anchor.parent().click()
        //         sleep(2000)
        //         console.log('领红包弹窗已关闭')
        //     } catch (err) {
        //         console.log(err)
        //         console.log('领红包弹窗关闭失败。此问题不影响运行')
        //     }
        //     try {
        //         idContains('CLOSE').findOne(2000).click()
        //         sleep(1000)
        //     } catch (err) {
        //         console.log(err)
        //         console.log('其他弹窗关闭失败。此问题不影响运行')
        //     }
        //     console.log('出现未能自动关闭的弹窗请手动关闭')
        //     sleep(2000)
        //     // let right = c.bounds().right
        //     // let left = c.bounds().left
        //     // let top = c.bounds().top
        //     // let bottom = c.bounds().bottom
        //     // click(random(right,left), random(top, bottom))
        //     click(c.bounds().centerX(), c.bounds().centerY())
        //     console.log('已点击，等待任务列表出现')
        if (!textContains('累计任务奖励').findOne(8000)) {
            throw '无法打开任务列表'
        }
    }

    // TODO:
    // 查找任务按钮
    function findTask() {
        var jumpButtonFind = textMatches(/去浏览|去完成/) // 找进入任务的按钮，10秒
        var jumpButtons = findTimeout(jumpButtonFind, 10000)

        if (!jumpButtons) {
            return null
        }

        for (var i = 0; i < jumpButtons.length; i++) {
            var taskName, content
            try {
                taskName = jumpButtons[i].parent().child(1).text()
                // content = jumpButtons[i].parent().child(2).child(0).text()
            } catch (err) {
                console.log(err)
                continue
            }
            if (taskName) {
                // if (taskName.match(/签到领/)) {
                //     console.log('进行签到任务')
                //     sleep(1000)
                //     jumpButtons[i].click()
                //     sleep(8000)
                //     return findTask()
                // }
                console.log(taskName)
                if (!(taskName.match(/天猫超市/))) {
                    return [taskName, jumpButtons[i]]
                }
            }
        }
        return null
    }

    // TODO:
    function liulan() {
        // if (textMatches(/.*浏览.*/).findOne(10000)) { // 等待浏览出现
        //     let v = className('android.support.v7.widget.RecyclerView').findOnce() // 滑动
        //     if (v) {
        //         sleep(1000)
        //         v.scrollForward()
        //     }
        // }

        // textMatches(/.*浏览得奖励.*/).findOne(15000) // 等待开始
        let finish_c = 0
        while (finish_c < 60) { // 0.5 * 60 =30 秒，防止死循环
            if (textMatches(/.*下拉浏览.*/).exists() || textContains('下滑').exists()) {
                console.log('进行模拟滑动')
                swipe(device.width / 2, device.height - 200, device.width / 2 + 20, device.height - 500, 2000)
                continue
            }
            let finish_reg = /.*任务已完成[\s\S]*|.*失败.*|.*上限.*|.*开小差.*|^\+[\d]*$/
            if (textMatches(finish_reg).exists() || descMatches(finish_reg).exists()) { // 等待已完成出现，有可能失败
                break
            }
            if (textMatches(/.*休息会呗.*/).exists()) {
                alert('触发淘宝验证', '请手动验证后返回淘宝首页，重新执行任务')
                console.log('异常退出。')
                quit()
            }
            if (textContains('互动奖励').exists() ||
                descContains('互动奖励').exists()) {
                console.log('跳过互动任务')
                break
            }
            if (finish_c && finish_c % 5 == 0) {
                console.log('滑动防止页面卡顿')
                swipe(device.width / 2, device.height - 400, device.width / 2 + 20, device.height - 500, 1000)
                finish_c = finish_c + 2
            }
            sleep(500)
            finish_c++
        }

        if (finish_c > 59) {
            console.log('未检测到任务完成标识。返回。')
            return false
        }

        console.log('任务完成')
        return true
    }

    // TODO:
    function backToList() {
        console.log('返回上级')
        if (idContains('node_2_icon').exists()) {
            console.log('已在任务列表')
            return
        }
        back()
        for (let i = 0; i < 3; i++) {
            if (!idContains('node_2_icon').findOne(5000)) {
                console.log('似乎没有返回，二次尝试')
                back()
            } else {
                break
            }
        }
        sleep(1000)
    }

    if (autoOpen) {
        // 打开淘宝活动页面
        console.log('正在打开淘宝...')

        app.startActivity({
            action: "VIEW",
            data: "taobao://s.click.taobao.com/7qinv6u"
        })
        sleep(2000)

        console.log('等待页面加载...')
    } else {
        console.log('请在30秒内打开淘宝做任务赢红包活动页 88￥ CZ3457 yRhaW1EFDJB￥ https://m.tb.cn/h.5SjTGhB')
    }
    if (!idContains('node_2_icon').findOne(30000)) {
        console.log('未能检测到任务页，退出')
        quit()
    }

    console.log('已打开活动，准备搜索任务')
    sleep(2000)

    console.log('首先关闭弹窗')
    try {
        let anchor = idContains('J_wfdlgwrap_6').findOne(5000)
        if (anchor) {
            click(anchor.bounds().centerX(), anchor.bounds().centerY())
            sleep(2000)
            console.log('领红包弹窗已关闭')
        }
    } catch (err) {
        console.log(err)
        console.log('领红包弹窗关闭失败。此问题不影响运行')
    }
    try {
        textContains('TB16l86YLb2gK0jSZK9XXaEgFXa').findOne(5000).click()
        sleep(2000)
        console.log('其他弹窗已关闭')
    } catch (err) {
        console.log(err)
        console.log('其他弹窗关闭失败。此问题不影响运行')
    }

    console.log('检测任务列表是否打开')
    if (textContains('累计任务奖励').findOne(5000)) {
        console.log('先关闭列表')
        idContains('close_btn').findOnce().click()
        sleep(2000)
    }

    while (true) {
        console.log('准备打开任务列表')
        sleep(2000)
        openTaskList()
        console.log('寻找任务入口...')
        var jumpButton = findTask()

        if (jumpButton == null) {
            console.log('没找到合适的任务。也许任务已经全部做完了。退出。互动任务不会自动完成。')
            console.log('请手动切换回主页面')
            alert('任务已完成', '别忘了在脚本主页领取双11红包！互动任务需要手动完成。')
            quit()
        }

        console.log('进行' + jumpButton[0] + '任务')
        sleep(2000)

        if (jumpButton[0].match(/商品/)) {
            jumpButton[1].click()
            sleep(2000)
            let count = jumpButton[0].match(/浏览(\d*)个/)[1]
            console.log('等待页面')
            if (!textContains('精选热卖').findOne(8000)) {
                throw '商品页面未加载'
            }
            try {
                count -= idContains('J_wf_node_2_time').findOne(5000).text()
            } catch (err) {
                console.log('获取数量失败，使用默认值', err)
            }
            console.log('点击', count, '个商品')
            let buttons = textContains('q75').find()
            if (!buttons) {
                throw '无法找到商品，任务失败'
            }
            for (let i = 0; i < 10 && count > buttons.length; i++) {
                console.log('商品数量不足，向下翻页', buttons.length)
                scrollDown()
                sleep(2000)
                scrollDown()
                sleep(2000)
                buttons = textContains('q75').find()
                console.log(buttons.length)
            }
            if (count > buttons.length) {
                console.log('商品数量不足，分次完成')
                count = buttons.length
            }

            for (let i = 0; i < count; i++) {
                console.log('点击第', i + 1, '个')
                sleep(2000)
                buttons[i].click()
                console.log('等待加载')
                if (textMatches(/加入购物车|粉丝福利购/).findOne(10000) || currentActivity() == 'com.taobao.android.detail.wrapper.activity.DetailActivity') {
                    console.log('商品打开成功，返回')
                    back()
                    if (!textContains('精选热卖').findOne(10000)) {
                        console.log('似乎没有返回，二次尝试')
                        back()
                    }
                } else {
                    throw '商品页未能加载'
                }
            }
            // sleep(1000)
            backToList()
        } else if (jumpButton[0].match(/搜索/)) {
            jumpButton[1].click()
            console.log('等待搜索')
            sleep(2000)
            let anchor = className("Button").text('搜索').findOne(8000)
            try {
                let listView = className('android.widget.ListView').findOne(2000).child(0)
                if (listView.childCount() == 1) {
                    listView.child(0).click()
                } else {
                    listView.child(1).click()
                }
            } catch (e) {
                console.log('无法获取推荐搜索列表，使用自定义搜索')
                anchor.parent().child(1).setText('iphone')
                anchor.click()
            }
            liulan()
            sleep(1000)
            back()
            backToList()
        } else if (jumpButton[0].match(/为你推荐|主会场/)) {
            jumpButton[1].click()
            liulan()
        } else {
            jumpButton[1].click()
            liulan()
            // sleep(1000)
            // back()
            backToList()
        }

        console.log('等待页面刷新...')
        sleep(2000)
    }
} catch (err) {
    device.cancelKeepingAwake()
    if (err.toString() != 'JavaException: com.stardust.autojs.runtime.exception.ScriptInterruptedException: null') {
        console.error(err)
    }
    showVersion()
}

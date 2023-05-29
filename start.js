const VERSION = '20221111-V'

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

console.show()
showVersion()

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
console.log('开始完成喵币任务...')
console.log('按音量下键停止')

device.keepScreenDim(60 * 60 * 1000)

let startCoin;

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
        if (startCoin) {
            console.log('本次任务开始时有', startCoin, '喵币')
        }
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

    // 查找任务按钮
    function findTask() {
        var jumpButtonFind = textMatches(/.*(去浏览|去搜索|去完成|去签到|去逛逛|去观看|去参赛).*/) // 找进入任务的按钮，10秒
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
                console.log('使用第二种方法尝试')
                try {
                    content = jumpButtons[i].parent().child(0).child(1).text()
                    console.log('成功，继续任务')
                }
                catch (err) {
                    continue
                }
            }
            if (taskName) {
                if (taskName.match(/签到/)) {
                    console.log('进行签到任务')
                    sleep(1000)
                    jumpButtons[i].click()
                    sleep(8000)
                    return findTask()
                }
                if (!(taskName.match(/淘金币|提醒|开通|续费|乐园|话费|斗地主|消消乐|流浪猫|开88|扔喵币|占领|邀请|登录|组队|参与|施肥|浇水|特价版|小鸡|消除|穿搭|森林|点淘|人生|我的淘宝|庄园|支付宝|点击人物|省钱卡|年卡|积分/) || content.match(/小互动|开通/))) {
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

        // textMatches(/.*浏览得奖励.*/).findOne(15000) // 等待开始
        let finish_c = 0
        let countdown = 0
        console.log('开始检测任务完成，部分控件无法检测，会在30秒后自动返回，请耐心等待。')
        while (finish_c < 250) { // 0.1 * 250 = 25 秒，防止死循环
            if (textMatches(/.*下拉浏览.*|.*浏览最高得.*/).exists()) {
                console.log('进行模拟滑动')
                swipe(device.width / 2, device.height - 200, device.width / 2 + 20, device.height - 500, 2000)
                finish_c = finish_c + 10
                continue
            }
            let finish_reg = /.*任务.*?完成[\s\S]*?|.*失败.*|.*上限.*|.*开小差.*|.*喵币已发放[\s\S]*|.*下单可获得[\s\S]*|任务已经/
            if (textMatches(finish_reg).exists() || descMatches(finish_reg).exists()) { // 等待已完成出现，有可能失败
                break
            }
            if (countdown == 0 && idContains('countdown').exists()) {
                countdown = 1
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
            if (text('手机淘宝触屏版').exists()) {
                console.log('页面未加载，返回')
                break
            }
            if (text('宝贝口袋').exists()) {
                let cart = text('购物车').findOnce()
                let x = cart.bounds().right
                let y = cart.bounds().top
                console.log('关闭直播购物车')
                click(x, y - 100)
            }
            if (text('立即关注得喵币').exists()) {
                console.log('关注直播间任务，点击关注按钮')
                text('立即关注得喵币').click()
                sleep(1000)
                break
            }
            if (finish_c % 50 == 0) {
                console.log('滑动防止页面卡顿')
                swipe( device.width / 2, device.height - 400, device.width / 2 + 20, device.height - 500, 500)
                finish_c = finish_c + 5
            }
            sleep(100)
            finish_c++
        }

        if (countdown) {
            console.log('出现图片类型标识，使用新方法完成，18秒后视为任务完成，自动返回')
            sleep(18000)
        }

        if (finish_c > 249) {
            console.log('未检测到任务完成标识。返回。')
            // console.log('如果你认为这是一个bug请截图反馈。')
            // console.log('一般情况下，二次运行脚本即可。')
            // console.log('请手动切换回主页面')
            // device.cancelKeepingAwake()
            // quit()
            if (textContains('累计任务奖励').exists()) {
                console.log('店铺已主动返回，继续任务')
                return
            }
            back()
            sleep(1000)
            // TODO: 返回检测
            if (!textContains('累计任务奖励').findOne(8000)) {
                console.log('似乎没有返回，二次尝试')
                back()
            }
            return
        }

        console.log('任务结束，返回')

        back()
        sleep(1000)
        if (!textContains('累计任务奖励').findOne(5000)) {
            if (currentActivity() == 'com.taobao.tao.TBMainActivity') {
                console.log('返回到了主页，尝试重新进入任务')
                id('com.taobao.taobao:id/rv_main_container').findOnce().child(3).child(0).click()
            } else {
                console.log('似乎没有返回，二次尝试')
                back()
            }
        }
    }

    // 喵币数量
    function getCoin() {
        console.log('获取喵币数量')
        try {
            let e = textContains('我的喵币').findOnce()
            let num = e.text().match(/(\d*)个/)[1]
            console.log('当前共有', num, '喵币')
            return num
        } catch (err) {
            console.log(err)
            console.log('获取喵币数量错误，不影响脚本运行')
            return null
        }
    }

    try {
        if (autoOpen) {
            // 打开淘宝活动页面
            console.log('正在打开淘宝...')
            var url = 'pages.tmall.com/wow/z/hdwk/hd2023618/home?disableNav=YES&qd_from=tbsybutton'

            app.startActivity({
                action: "VIEW",
                data: "taobao://" + url
            })
            sleep(2000)

            console.log('等待页面加载...')
            textContains('领喵币').findOne(20000)
            console.log('准备打开任务列表，第一次启动页面等待10秒加载')
            sleep(10000)

            let c = textContains('领喵币').findOne(1000)
            if (c) {
                console.log('使用默认方法尝试打开任务列表')
                c.click()
                sleep(1000)
                c.click()
                console.log('已点击，未能打开建议手动点击一下任务列表。此问题并非bug，和网络以及设备性能有关。')
                console.log('检测任务列表，准备进行二次尝试')
            } else {
                throw '无法找到任务列表入口'
            }
            if (!textContains('累计任务奖励').findOne(8000)) {
                console.log('默认方式打开失败，二次尝试')
                console.log('首先检测弹窗')
                for (let i = 0; i < 2 && text('关闭').findOne(2000); i++) { // 关闭弹窗
                    console.log('检测到弹窗，关闭')
                    click('关闭')
                    sleep(2000)
                }
                console.log('已试图自动关闭弹窗。有未能自动关闭的弹窗请手动关闭')
                sleep(5000)
                // let right = c.bounds().right
                // let left = c.bounds().left
                // let top = c.bounds().top
                // let bottom = c.bounds().bottom
                // click(random(right,left), random(top, bottom))
                click(c.bounds().centerX(), c.bounds().centerY())
                console.log('已点击，等待任务列表出现')
                if (!textContains('累计任务奖励').findOne(8000)) {
                    throw '无法打开任务列表'
                }
            }
        } else {
            console.log('请在30秒内打开淘宝活动页，并打开任务列表')
            if (textContains('累计任务奖励').findOne(30000)) {
                console.log('已打开，继续任务')
            } else {
                console.log('未能检测到任务列表，退出')
                quit()
            }
        }
        console.log('准备搜索任务')
        sleep(2000)
    } catch (err) {
        console.log(err)
        console.log('无法进入任务列表，如果你认为这是bug，请截图反馈。注意！1级没法做任务，请先升到2级！')
        quit()
    }

    startCoin = getCoin()

    while (true) {
        console.log('寻找任务入口...')
        var jumpButton = findTask()

        if (jumpButton == null) {
            // 没有任务之后领取奖励
            var awardButtonFind = textMatches(/立即领取|领取奖励/)
            var awardButtons = findTimeout(awardButtonFind, 10000)

            if (awardButtons) {
                for (var i = 0; i < awardButtons.length; i++) {
                    console.log('领取累计任务奖励')
                    awardButtons[i].click()
                    console.log('等待5秒再次领取...')
                    sleep(5000)
                }
            }

            const endCoin = getCoin()

            console.log('没找到合适的任务。也许任务已经全部做完了。退出。互动任务不会自动完成。')
            console.log('请手动切换回主页面')
            if (startCoin && endCoin) {
                console.log('本次任务共获得', (endCoin - startCoin), '喵币')
            }
            alert('任务已完成', '别忘了在脚本主页领取双十一红包！互动任务需要手动完成。')
            quit()
        }

        if (jumpButton[0].match('去浏览店铺领能量')) {
            console.log('进行浏览店铺任务')
            jumpButton[1].click()
            while (!textContains('任务完成').exists()) {
                console.log('进入店铺浏览')
                text('逛店最多').findOne(15000).parent().click()
                liulan()
                sleep(2000)
            }
            back()
        } else if (jumpButton[0].match(/.*玩游戏.*|.*浏览餐饮卡券.*|.*加油赛.*|.*赚星星.*/)) {
            console.log('进行' + jumpButton[0] + '任务，10秒后返回')
            jumpButton[1].click()
            sleep(10000)
            back()
        } else if (jumpButton[0].match(/领现金/)) {
            console.log('进行' + jumpButton[0] + '任务')
            jumpButton[1].click()
            let into = text('打开链接').findOne(10000)
            if (!into) {
                console.log('无法找到进入领现金的按钮！')
                quit()
            }
            into.click()
            liulan()
        } else if (jumpButton[0].match(/搜一搜/)) {
            console.log('进行' + jumpButton[0] + '任务')
            jumpButton[1].click()
            console.log('等待搜索')
            sleep(2000)
            textContains('搜索后浏览').findOne(8000)
            let listView = className('android.widget.ListView').findOne(2000).child(0)
            if (listView.childCount() == 1) {
                listView.child(0).click()
            } else {
                listView.child(1).click()
            }
            liulan()
            sleep(1000)
            back()
            backToList()
        } else {
            console.log('进行' + jumpButton[0] + '任务')
            jumpButton[1].click()
            liulan()
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

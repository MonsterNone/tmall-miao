if (!auto.service) {
    toast('无障碍服务未启动！退出！')
    exit()
}

// alert('请把手机放稳，不要摇晃！', '不然有时候会跳出合伙赢喵币，导致任务阻塞')

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

console.show()
console.log('开始完成喵糖任务...')
console.log('按音量下键停止')

device.keepScreenDim(60 * 60 * 1000)

function registerKey() {
    events.observeKey()
    events.onKeyDown('volume_down', function (event) {
        console.log('喵糖任务脚本停止了')
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

    // 查找任务按钮
    function findTask() {
        var jumpButtonFind = textMatches(/去浏览|去搜索|去完成|签到|逛一逛|去逛逛|去观看|去参赛/) // 找进入任务的按钮，10秒
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
                if (!(taskName.match(/话费|斗地主|消消乐|流浪猫|开88|扔喵糖|占领|邀请|登录|组队|参与|施肥|浇水|特价版|小鸡|消除|穿搭|森林|点淘|人生|我的淘宝/) || content.match(/小互动/))) {
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

        textMatches(/.*浏览得奖励.*/).findOne(15000) // 等待开始

        let finish_c = 0
        while (finish_c < 80) { // 0.5 * 60 = 40 秒，防止死循环
            let finish_reg = /.*完成.*|.*失败.*|.*上限.*|.*开小差.*|.*发放.*/
            if (
                (textMatches(finish_reg).exists() ||
                    descMatches(finish_reg).exists() ||
                    textContains('任务已完成').exists() ||
                    textContains('喵糖已发放').exists() ||
                    descContains('任务已完成').exists() ||
                    descContains('喵糖已发放').exists()) &&
                !text("浏览得奖励").exists()
            ) // 等待已完成出现，有可能失败
            {
                break
            }
            if (textMatches(/.*休息会呗.*/).exists()) {
                alert('触发淘宝验证', '请手动验证后返回淘宝首页，重新执行任务')
                console.log('异常退出。')
                quit()
            }
            sleep(500)
            finish_c++
        }

        if (finish_c > 79) {
            console.log('未检测到任务完成标识。返回。')
            // console.log('如果你认为这是一个bug请截图反馈。')
            // console.log('一般情况下，二次运行脚本即可。')
            // console.log('请手动切换回主页面')
            // device.cancelKeepingAwake()
            // quit()
            return back()
        }

        console.log('任务完成，返回')

        // if (currentActivity() == 'com.taobao.tao.TBMainActivity') {
        //     var backButton = descContains('返回618列车').findOnce() // 有可能是浏览首页，有可能无法点击
        //     if (backButton) {
        //         if (!backButton.parent().parent().parent().click()) {
        //             back()
        //         }
        //     } else {
        //         back()
        //     }
        // } else {
        //     back()
        // }
        back()
        if (!text('做任务赢奖励').findOne(5000)) {
            console.log('似乎没有返回，二次尝试')
            back()
        }
    }

    // 打开淘宝活动页面
    console.log('正在打开淘宝...')
    var url = 'pages.tmall.com/wow/z/hdwk/20211111/pk20211111'

    app.startActivity({
        action: "VIEW",
        data: "taobao://" + url
    })
    sleep(2000)

    console.log('等待页面加载...')

    try {
        textMatches(/.*赚.*?糖.*/).findOne(20000)
        console.log('准备打开任务列表')
        sleep(2000)
        // if(click('关闭')) {
        //     sleep(2000)
        // }
        let c = textMatches(/.*赚.*?糖.*/).findOnce()
        if (c) {
            console.log('打开任务列表')
            c.click()
        } else {
            console.log('默认方式打开失败，二次尝试')
            c = descMatches(/.*赚.*?糖.*/).findOnce()
            if (c) {
                c.click()
            } else {
                console.log('无法找到任务列表按钮')
                quit()
            }
        }
        console.log('准备搜索任务')
        if (!text('做任务赢奖励').findOne(10000)) {
            throw '未检测到任务列表标识，判定进入失败！'
        }
        sleep(2000)
    } catch (err) {
        console.log(err)
        console.log('无法进入任务列表，如果你认为这是bug，请截图反馈')
        quit()
    }

    while (true) {
        console.log('寻找任务入口...')
        var jumpButton = findTask()

        if (jumpButton == null) {
            // 没有任务之后领取奖励
            var awardButtonFind = textMatches(/立即领取/)
            var awardButtons = findTimeout(awardButtonFind, 10000)

            if (awardButtons) {
                for (var i = 0; i < awardButtons.length; i++) {
                    console.log('领取累计任务奖励')
                    awardButtons[i].click()
                    console.log('等待5秒再次领取...')
                    sleep(5000)
                }
            }

            console.log('没找到合适的任务。也许任务已经全部做完了。退出。互动任务不会自动完成。')
            console.log('请手动切换回主页面')
            alert('任务已完成', '别忘了在脚本主页领取双十一红包！')
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
        } else if (jumpButton[0].match(/.*浏览餐饮卡券.*|.*加油赛.*|.*赚星星.*/)) {
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
    if (!err.toString().match(/null/)) {
        console.error(err)
    }
}
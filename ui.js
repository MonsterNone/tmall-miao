"ui";

const VERSION = '2022618-10'

ui.layout(
    <frame>
        <vertical id="main" visibility="visible">
            <button id="automationPermission" text="1. 授予无障碍权限" />
            <button id="consolePermission" text="2. 授予悬浮窗权限" />
            <button id="startTask" text="3-1. 淘宝活动尚未开始，敬请期待(5.29)" />
            <button id="startJDTask" text="3-2. 开始京东任务" /> 
            <button id="startJDChoujiang" text="3-3. 进行京东热爱奇旅抽奖任务(beta)" /> 
            {/* <button id="discountTask" text="4-1. 领取天猫年货现金红包" /> */}
            {/* <button id="jd" text="4-2. 领取京东年货现金红包（领完再进，每天三次）" /> */}
            {/* <button id="specialTask" text="5. 淘宝618主会场" /> */}
            {/* <button id="caidan" text="5. 完成天猫开彩蛋任务" /> */}
            {/* <button id="butie" text="天猫百亿补贴会场，真补贴，真划算" /> */}
            {/* <button id="showHb" text="消灭红包！旧的不去新的不来！" textColor="red" /> */}
            <button id="showHC" text="618大促会场直达" textColor="red" />
            <button id="showQun" text="加入618活动助力群" />
            <button id="showQun2" text="加入内部优惠线报群" />
            {/* <button id="feedback" text="正版发布地址！小心病毒盗版！" /> */}
            <button id="checkUpdate" text="检查更新（需要联网）" />
            <text text="使用脚本有机率导致任务收益减少！本脚本仅供学习参考，请勿用于非法用途，使用脚本导致的任何可能结果与本人无关。请使用新版淘宝/京东运行，老版本部分任务会出现问题。" textStyle="bold|italic" textColor="red" textSize="18sp" />
            {/* <text text="部分机型无障碍权限授予部分可能出现bug，请关闭软件重新打开授予权限。" textStyle="italic" textColor="blue" /> */}
            {/* <text text="如果始终无法授予请重启手机尝试" /> */}
            <text text="使用说明" textColor="red" />
            <text text="1. 运行脚本之前建议按首先点击授予权限" />
            <text text="2. 脚本运行过程中按 音量减 即可强制停止" />
            <text text="3. 部分互动任务需要手动完成" />
            <text text="其他说明" textColor="red" />
            <text text="1. 本脚本基于Auto.JS（感谢原开发者）" />
            <text autoLink="web" text="2. 本程序完全免费，基础代码全部开源，项目地址：https://github.com/MonsterNone/tmall-miao" />
            <text text="3. 由于调用淘宝打开页面，部分手机管家可能会误报为诱导软件，实际上本软件绝无任何病毒行为。" />
            {/* <text text="4. 运行中出现bug请附上详细控制台log、页面截图等提交issue" /> */}
            <text id="ver" line="1" />
        </vertical>
        <vertical id="qun" visibility="gone" bg="#ffffff">
            <img id="jiaQun" src="file://res/qun.png" />
            <text text="互助QQ群：533943195，点击图片自动跳转手机QQ添加" textSize="20sp" gravity="center" />
            <button id="hideQun" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
        <vertical id="qun2" visibility="gone" bg="#ffffff">
            <img id="jiaQun2" src="file://res/qun2.jpg" />
            <text text="线报QQ群：740725146，点击图片自动跳转手机QQ添加" textSize="20sp" gravity="center" />
            <button id="hideQun2" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
        {/* <vertical id="hb" visibility="gone" bg="#ffffff" paddingTop="50" paddingLeft="20" paddingRight="20">
            <text text="每日的红包使用掉，淘宝才会给你发新红包！5元惊喜红包不用完，绝对不会收到下一个5元！" textSize="18sp" textStyle="bold" textColor="red" />
            <button id="get" text="先领红包，不领咋有的用哈哈" />
            <button id="one" text="小红包：每日一元购" />
            <button id="big" text="大红包：官方补贴清单" />
            <button id="hideHb" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical> */}
        <vertical id="huichang" visibility="gone" bg="#ffffff" paddingTop="50" paddingLeft="20" paddingRight="20">
            {/* <button id="jianhuo" text="618内部爆款清单" /> */}
            <button id="jdHuichang" text="京东618主会场" />
            <button id="jdYouhui" text="京东618万券齐发会场，早鸟券包1分抢" />
            <button id="jdRexiao" text="京东618爆款清单，预售定金膨胀至高5倍" />
            <button id="yushou" text="天猫618预售争霸赛" />
            <button id="rexiao" text="618热销榜，单单有补贴" />
            <button id="chaoshi" text="天猫超市，抢15元超市优惠券" />
            <button id="jdChaoshi" text="京东超市，上午下单下午收货，领券满200-20" />
            <button id="jdBaihuo" text="京东新百货，美妆居家钟表运动，送货上门正品保障" />
            <button id="hideHC" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
    </frame>
)

ui.ver.setText('\n版本：' + VERSION)

threads.start(checkUpdate)

// ui.tb.click(function () {
//     app.openUrl('https://www.wandoujia.com/apps/32267/history_v253')
// })

ui.automationPermission.click(function () {
    threads.start(autoPerReq)
})

ui.consolePermission.click(function () {
    threads.start(conPerReq)
})

ui.startTask.click(function () {
    alert('淘宝活动尚未开始', '5.29天猫活动上线，敬请关注脚本更新')
    // engines.execScriptFile('./start.js')
})

ui.startJDTask.click(function () {
    engines.execScriptFile('./start_jd.js')
})

ui.startJDChoujiang.click(function () {
    engines.execScriptFile('./jd_choujiang.js')
})

// ui.butie.click(function () {
//     const url = 'm.tb.cn/h.4yiqRfM'

//     app.startActivity({
//         action: "VIEW",
//         data: "taobao://" + url
//     })
// })

// ui.discountTask.click(function () {
//     // toast('也可手淘搜索密令【我要领红包7555】直达会场！')
//     const url = 'https://m.tb.cn/h.fkkgNPR'
//     openTbUrl(url)
// })

// ui.specialTask.click(function() {
//     engines.execScriptFile('./special.js')
// })

// ui.caidan.click(function () {
//     engines.execScriptFile('./egg.js')
// })

ui.showQun.click(function () {
    ui.main.visibility = 8
    ui.qun.visibility = 0
})

ui.showQun2.click(function () {
    ui.main.visibility = 8
    ui.qun2.visibility = 0
})

ui.hideQun.click(function () {
    ui.qun.visibility = 8
    ui.main.visibility = 0
})

ui.hideQun2.click(function () {
    ui.qun2.visibility = 8
    ui.main.visibility = 0
})

ui.jiaQun.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://card/show_pslcard?src_type=internal&version=1&uin=533943195&card_type=group&source=qrcode'
    })
})

ui.jiaQun2.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://card/show_pslcard?src_type=internal&version=1&uin=740725146&card_type=group&source=qrcode'
    })
})

// ui.feedback.click(function () {
//     app.openUrl('https://github.com/monsternone/tmall-miao')
// })

ui.checkUpdate.click(function () {
    threads.start(checkUpdate)
})

// ui.jd.click(function() {
//     dialogs.build({
//         title: "是否使用复制京口令领取？",
//         content: "实测京口令领取红包更大，如果app未自动弹出口令请使用默认方式",
//         positive: "京口令方式",
//         negative: "默认方式"
//     }).on("positive", ()=>{
//         setClip("28:/！40ZkU2rLJVXAr！")
//         if (launch('com.jingdong.app.mall')) {
//             toast('京口令已复制，打开京东App领取')
//         } else {
//             toast('京口令已复制，请手动打开京东App领取')
//         }
//     }).on("negative", ()=>{
//         const url = 'https://u.jd.com/PIYvDAt'
//         openJdUrl(url)
//     }).show()
// })
 
// ui.showHb.click(function () {
//     ui.hb.visibility = 0
// })

ui.showHC.click(function () {
    ui.main.visibility = 8
    ui.huichang.visibility = 0
})

ui.yushou.click(function () {
    const url = 'https://m.tb.cn/h.ftic1Dx'
    openTbUrl(url)
})

// ui.jianhuo.click(function () {
//     app.startActivity({
//         action: "VIEW",
//         data: "taobao://m.tb.cn/h.fkiwuT1"
//     })
// })

ui.chaoshi.click(function () {
    const url = 'https://m.tb.cn/h.fHizabu'
    openTbUrl(url)
})

ui.rexiao.click(function () {
    const url = 'https://m.tb.cn/h.fGzYnPr'
    openTbUrl(url)
})

ui.jdHuichang.click(function () {
    const url = 'https://u.jd.com/JCbNy3t'
    openJdUrl(url)
})

ui.jdRexiao.click(function () {
    const url = 'https://u.jd.com/JCb4AIS'
    openJdUrl(url)
})

ui.jdYouhui.click(function () {
    const url = 'https://u.jd.com/JLbfhhN'
    openJdUrl(url)
})

ui.jdChaoshi.click(function () {
    const url = 'https://u.jd.com/JwSw88P'
    openJdUrl(url)
})

ui.jdBaihuo.click(function () {
    const url = 'https://u.jd.com/JISziRw'
    openJdUrl(url)
})

ui.hideHC.click(function () {
    ui.huichang.visibility = 8
    ui.main.visibility = 0
})

// ui.hideHb.click(function () {
//     ui.hb.visibility = 8
// })

// ui.get.click(function () {
//     app.startActivity({
//         action: "VIEW",
//         data: "taobao://m.tb.cn/h.4Hbw15w"
//     })
// })

// ui.one.click(function () {
//     app.startActivity({
//         action: "VIEW",
//         data: "taobao://m.tb.cn/h.4uqf6PB"
//     })
// })

// ui.big.click(function () {
//     app.startActivity({
//         action: "VIEW",
//         data: "taobao://m.tb.cn/h.4uqfnYR"
//     })
// })

function autoPerReq() {
    if (!auto.service) {
        alert('找到618任务助手，勾选授予权限', '部分机型在“已安装服务”中')
    }
    auto.waitFor()
    toast('无障碍权限授予成功')
}

function conPerReq() {
    toast('打开悬浮窗权限')
    toast('华为/荣耀机型注意，请手动到设置-应用-权限中开启（仅首次运行需要）')
    console.show()
    console.log('悬浮窗权限授予成功！此窗口马上消失')
    sleep(1000)
    console.hide()
}


function checkUpdate() {
    toast('正在检查更新')
    const versionUrl = 'https://raw.fastgit.org/MonsterNone/tmall-miao/master/version'
    http.get(versionUrl, {}, function (res, err) {
        if (err) {
            toast('检查更新出错，请手动前往项目地址查看')
            return
        }
        try {
            res = res.body.json()
        } catch (err) {
            toast('检查更新出错，请手动前往项目地址查看')
            return
        }
        const version = res.version
        const log = res.log
        if (version != VERSION) {
            var go = confirm("有新的版本，前往下载" + version, log)
            if (go) {
                alert('如果打不开Github链接，请查看QQ群公告至蓝奏云下载')
                app.openUrl('https://github.com/MonsterNone/tmall-miao/releases/latest')
            }
        } else {
            toast('当前为最新版')
        }
    })
}

// 唤起京东APP打开url的方法
function openJdUrl(url) {
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"'+ url +'","M_sourceFrom":"h5auto","msf_type":"auto"}'
    })
}

// 唤起淘宝APP打开url的方法，此处url带不带http头都可
function openTbUrl(url) {
    url = url.replace(/https?:\/\//, '')
    app.startActivity({
        action: "VIEW",
        data: "taobao://" + url
    })
}
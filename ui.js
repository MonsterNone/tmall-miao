"ui";

const VERSION = '20221111-A'

ui.layout(
    <frame>
        <vertical id="main" visibility="visible">
            <button id="automationPermission" text="1. 授予无障碍权限" />
            <button id="consolePermission" text="2. 授予悬浮窗权限" />
            <button id="startJDTask" text="3-1. 开始京东任务" /> 
            <button id="startTask" text="3-2. 开始淘宝任务" />
            {/* <button id="startJDChoujiang" text="3-3. 开始京东热爱奇旅抽奖任务(Beta 2)" />  */}
            <button id="tb" textColor="blue" text="4-1. 领取天猫双十一专享红包（尚未开始）" />
            <button id="jd" textColor="blue" text="4-2. 领取京东双十一专享红包（尚未开始）" />
            {/* <button id="specialTask" text="5. 淘宝双十一主会场" /> */}
            {/* <button id="caidan" text="5. 完成天猫开彩蛋任务" /> */}
            {/* <button id="butie" text="天猫百亿补贴会场，真补贴，真划算" /> */}
            {/* <button id="showHb" text="消灭红包！旧的不去新的不来！" textColor="red" /> */}
            <button id="showHC" text="双十一大促会场直达" textColor="red" />
            <button id="showQun" text="加入双十一活动助力群" />
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
            <text id="guild" text="新上线互助QQ频道，人数更多功能更全！点击本行文字加入！" textSize="40sp" textColor="red" gravity="center" />
            <img id="jiaQun" src="file://res/qun.png" />
            <text text="互助QQ群：533943195，点击图片自动跳转手机QQ添加" textSize="20sp" gravity="center" />
            <button id="hideQun" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
        <vertical id="qun2" visibility="gone" bg="#ffffff">
            <img id="jiaQun2" src="file://res/qun2.jpg" />
            <text text="线报QQ群：740725146，点击图片自动跳转手机QQ添加" textSize="20sp" gravity="center" />
            <button id="hideQun2" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
        <vertical id="hb" visibility="gone" bg="#ffffff" paddingTop="50" paddingLeft="20" paddingRight="20">
        <text text="消灭小红包专区" textSize="18sp" textStyle="bold" textColor="blue" />
            <text text="记得先在首页领取每日红包！加码红包不用完，大概率不会收到下一个加码！" textSize="18sp" textStyle="bold" textColor="red" />
            <button id="jdMiaosha" text="京喜秒杀，消灭小红包" />
            <button id="temai" text="淘宝天天特卖，消灭小红包" />
            <button id="hideHb" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
        <vertical id="huichang" visibility="gone" bg="#ffffff" paddingTop="50" paddingLeft="20" paddingRight="20">
            <button id="jdHuichang" text="京东双十一主会场" />
            <button id="yushou" text="天猫双十一主会场(22日开启)" />
            <button id="jdRexiao" text="京东家电双11预售提前购" />
            <button id="jdYouhui" text="京东手机双十一专区" />
            <button id="chaoshi" text="猫超内购清单" />
            {/* <button id="rexiao" text="天猫超级U选，精选爆品史低价" /> */}
            {/* <button id="jianhuo" text="天猫双十一内购清单" /> */}
            {/* <button id="jdChaoshi" text="京东超市，上午下单下午收货，领券满200-20" />
            <button id="jdBaihuo" text="京东新百货，美妆居家钟表运动，送货上门正品保障" /> */}
            <button id="hideHC" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical>
    </frame>
)

ui.ver.setText('\n版本：' + VERSION)

threads.start(checkUpdate)

ui.automationPermission.click(function () {
    threads.start(autoPerReq)
})

ui.consolePermission.click(function () {
    threads.start(conPerReq)
})

ui.startTask.click(function () {
    alert('淘宝活动尚未开始', '敬请关注脚本更新')
    // engines.execScriptFile('./start.js')
})

ui.startJDTask.click(function () {
    engines.execScriptFile('./start_jd.js')
})

// ui.startJDChoujiang.click(function () {
//     engines.execScriptFile('./jd_choujiang.js')
// })

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

ui.guild.click(function() {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://forward/url?url_prefix=aHR0cHM6Ly9xdW4ucXEuY29tL3Fxd2ViL3F1bnByby9zaGFyZT9pbnZpdGVDb2RlPTFYMGNzSFRXU1Bu'
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
//         setClip("88:/￥AC096DapYao%")
//         rawInput("已复制，部分机型限制剪贴板，可以手动复制", "88:/￥AC096DapYao%")
//         if (launch('com.jingdong.app.mall')) {
//             toast('京口令已复制，打开京东App领取')
//         } else {
//             toast('京口令已复制，请手动打开京东App领取')
//         }
//     }).on("negative", ()=>{
//         const url = 'https://u.jd.com/JdHdlPN'
//         openJdUrl(url)
//     }).show()
// })
 
// ui.tb.click(function () {
//     const url = 'https://s.m.taobao.com/h5?q=惊喜不断来dddd'
//     openTbUrl(url)
// })

// ui.showHb.click(function () {
//     ui.hb.visibility = 0
// })

ui.showHC.click(function () {
    ui.main.visibility = 8
    ui.huichang.visibility = 0
})

ui.yushou.click(function () {
    // const url = 'https://s.m.taobao.com/h5?q=惊喜不断来dddd'
    const url = 'https://m.tb.cn/h.UeNxVFJ'
    openTbUrl(url)
})

// ui.jianhuo.click(function () {
//     const url = 'https://m.tb.cn/h.fFOaz9Q'
//     openTbUrl(url)
// })

ui.chaoshi.click(function () {
    const url = 'https://s.click.taobao.com/mHrbfSu'
    openTbUrl(url)
})

// ui.rexiao.click(function () {
//     const url = 'https://m.tb.cn/h.ftnQgmQ'
//     openTbUrl(url)
// })

ui.jdHuichang.click(function () {
    const url = 'https://u.jd.com/kIbdeYx'
    openJdUrl(url)
})

ui.jdRexiao.click(function () {
    const url = 'https://u.jd.com/kLbG0Q7'
    openJdUrl(url)
})

ui.jdMiaosha.click(function () {
    const url = 'https://u.jd.com/NMvLVd3'
    openJdUrl(url)
})

ui.temai.click(function () {
    const url = 'https://m.tb.cn/h.fFVPNIk'
    openTbUrl(url)
})

ui.jdYouhui.click(function () {
    const url = 'https://u.jd.com/kKbqMrP'
    openJdUrl(url)
})

// ui.jdChaoshi.click(function () {
//     const url = 'https://u.jd.com/JwSw88P'
//     openJdUrl(url)
// })

// ui.jdBaihuo.click(function () {
//     const url = 'https://u.jd.com/JISziRw'
//     openJdUrl(url)
// })

ui.hideHC.click(function () {
    ui.huichang.visibility = 8
    ui.main.visibility = 0
})

ui.hideHb.click(function () {
    ui.hb.visibility = 8
})

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
        alert('找到双十一任务助手，勾选授予权限', '部分机型在“已安装服务”中')
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
    if (VERSION == 0) {
        toast('无法加载version.js')
        return
    }
    toast('正在检查更新')
    const versionUrl = 'https://raw.githubusercontents.com/MonsterNone/tmall-miao/master/version'
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
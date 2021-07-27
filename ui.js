"ui";

const VERSION = 'ChinaNo.1-4'

ui.layout(
    <frame>
        <vertical>
            {/* <button id="tb" text="点击下载淘宝9.0版本（此版本目前无黑号检测）"  textColor="red" textSize="16sp" /> */}
            <button id="automationPermission" text="1. 授予无障碍权限" />
            <button id="consolePermission" text="2. 授予悬浮窗权限" />
            {/* <button id="discountTask" text="3. 领取淘宝618红包" /> */}
            <button id="startTask" text="3. 开始奥运任务" />
            {/* <button id="specialTask" text="5. 领取会场红包（0点领红包最大）" /> */}
            {/* <button id="caidan" text="5. 完成天猫开彩蛋任务" /> */}
            <button id="butie" text="天猫百亿补贴会场，真补贴，真划算" />
            {/* <button id="jd" text="5. 领取京东618红包（领完再进，每天三次）" /> */}
            {/* <button id="showHb" text="消灭红包！旧的不去新的不来！" textColor="red" /> */}
            <button id="showQun" text="加入天猫活动助力群" />
            <button id="feedback" text="正版发布地址！小心病毒盗版！" />
            <button id="checkUpdate" text="检查更新" />
            <text text="使用脚本有机率导致任务收益减少！本脚本仅供学习参考，请勿用于非法用途，使用脚本导致的任何可能结果与本人无关。请使用新版淘宝运行，老版本部分任务会出现问题。" textStyle="bold|italic" textColor="red" textSize="18sp" />
            <text text="部分机型无障碍权限授予部分可能出现bug，请关闭软件重新打开授予权限。" textStyle="italic" textColor="blue" />
            <text text="如果始终无法授予请重启手机尝试" />
            <text text="使用说明" textColor="red" />
            <text text="1. 运行脚本之前建议按首先点击授予权限" />
            <text text="2. 脚本运行过程中按 音量减 即可强制停止" />
            <text text="3. 部分每日任务需要手动完成" />
            <text text="4. 运行前最好先将媒体音量关闭，直播任务可能会发出声音" />
            <text text="其他说明" textColor="red" />
            <text text="1. 本脚本基于Auto.JS（感谢原开发者）" />
            <text text="2. 免费！" />
            {/* <text autoLink="web" text="3. 项目地址https://github.com/MonsterNone/tmall-miao" /> */}
            {/* <text text="4. 运行中出现bug请附上详细控制台log、页面截图等提交issue" /> */}
            <text text="3. 由于调用淘宝打开页面，部分手机管家可能会误报为诱导软件，实际上本软件绝无任何病毒行为" />
            <text id="ver" line="2" />
        </vertical>
        <vertical id="qun" visibility="gone" bg="#ffffff">
            <img src="file://res/qun.png" />
            <button id="hideQun" style="Widget.AppCompat.Button.Colored" text="隐藏" />
            {/* <text text="由于微信号被恶意举报，无法拉群，新开了一个QQ群，欢迎加入！" /> */}
            {/* <text text="每天9点，群公告准时发车" /> */}
            {/* <text text="截图后打开微信扫描二维码加入" />
            <text text="如果二维码无法进入请添加小助手微信拉进群：zs2020618" /> */}
        </vertical>
        {/* <vertical id="hb" visibility="gone" bg="#ffffff" paddingTop="50" paddingLeft="20" paddingRight="20">
            <text text="每日的红包使用掉，淘宝才会给你发新红包！5元惊喜红包不用完，绝对不会收到下一个5元！" textSize="18sp" textStyle="bold" textColor="red" />
            <button id="get" text="先领红包，不领咋有的用哈哈" />
            <button id="one" text="小红包：每日一元购" />
            <button id="big" text="大红包：官方补贴清单" />
            <button id="hideHb" style="Widget.AppCompat.Button.Colored" text="隐藏" />
        </vertical> */}
    </frame>
)

ui.ver.setText('\n版本：' + VERSION + '\n中国队加油！')

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
    engines.execScriptFile('./start.js')
})

ui.butie.click(function () {
    const url = 'm.tb.cn/h.4yiqRfM'

    app.startActivity({
        action: "VIEW",
        data: "taobao://" + url
    })
})

// ui.discountTask.click(function () {
//     engines.execScriptFile('./discount.js')
// })

// ui.specialTask.click(function() {
//     engines.execScriptFile('./special.js')
// })

// ui.caidan.click(function () {
//     engines.execScriptFile('./egg.js')
// })

ui.showQun.click(function () {
    ui.qun.visibility = 0
})

ui.feedback.click(function () {
    app.openUrl('https://github.com/monsternone/tmall-miao')
})

ui.hideQun.click(function () {
    ui.qun.visibility = 8
})

ui.checkUpdate.click(function () {
    threads.start(checkUpdate)
})

// ui.jd.click(function() {
//     setClip("30.0复制整段话 https://JKzjbFTD6e1VdB抢紅包，购痛快~最高18618元紅包等你来！#7Aae64urfa@打kai{婛岽}")
//     if (launchApp("京东")) {
//         toast('京口令已复制！正在打开京东...')
//     }
//     else {
//         app.openUrl('https://u.jd.com/z4cMT4D')
//     }
// })

// ui.showHb.click(function () {
//     ui.hb.visibility = 0
// })

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
        alert('找到天猫618助手，勾选授予权限', '部分机型在“已安装服务”中')
    }
    auto.waitFor()
    toast('无障碍权限授予成功')
}

function conPerReq() {
    toast('打开悬浮窗权限')
    console.show()
    console.log('悬浮窗权限授予成功！此窗口马上消失')
    sleep(1000)
    console.hide()
}


function checkUpdate() {
    toast('正在检查更新')
    var versionUrl = 'https://cdn.jsdelivr.net/gh/monsternone/tmall-miao@latest/version'
    http.get(versionUrl, {}, function (res, err) {
        if (err) {
            toast('检查更新出错，请手动前往项目地址查看')
            return
        }
        var version = res.body.string()
        if (version != VERSION) {
            var go = confirm("有新的版本，前往下载" + version)
            if (go) {
                app.openUrl('https://github.com/MonsterNone/tmall-miao/releases')
            }
        } else {
            toast('当前为最新版')
        }
    })
}
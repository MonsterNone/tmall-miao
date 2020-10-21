"ui";

const VERSION = 12

ui.layout(
    <frame>
        <vertical>
            <button id="automationPermission" text="1. 授予无障碍权限" />
            <button id="consolePermission" text="2. 授予悬浮窗权限" />
            <button id="startTask" text="3. 开始每日任务" />
            <button id="discountTask" text="4. 领取双十一红包（21日0点开始）" />
            {/* <button id="specialTask" text="5. 领取会场红包（0点领红包最大）" /> */}
            {/* <button id="showQun" text="加入双十一交流群" /> */}
            <button id="feedback" text="正版发布地址！小心病毒盗版！" />
            <button id="checkUpdate" text="检查更新" />
            {/* <button id="jd" text="领取京东双十一红包" /> */}
            <text text="初版不能自动完成所有任务，后续版本将继续优化" textStyle="bold|italic" textColor="red" />
            <text text="部分机型无障碍权限授予部分可能出现bug，请关闭软件重新打开授予权限。" textStyle="bold|italic" textColor="red" />
            <text text="如果始终无法授予请重启手机尝试" />
            <text text="使用说明" textColor="red" />
            <text text="1. 运行脚本之前建议按首先点击授予权限" />
            <text text="2. 脚本运行过程中按 音量减 即可强制停止" />
            <text text="3. 部分每日任务需要手动完成" />
            <text text="其他说明" textColor="red" />
            <text text="1. 本脚本基于Auto.JS（感谢原开发者）" />
            <text text="2. 免费！" />
            <text autoLink="web" text="3. 项目地址https://github.com/MonsterNone/tmall-miao" />
            {/* <text text="4. 运行中出现bug请附上详细控制台log、页面截图等提交issue" /> */}
            {/* <text text="5. 由于调用淘宝打开页面，部分手机管家可能会误报为诱导软件，实际上本软件绝无任何病毒行为" /> */}
            <text id="ver" line="2" />
        </vertical>
        <vertical id="qun" visibility="gone" bg="#ffffff">
            <img src="file://res/qun.png" />
            <button id="hideQun" style="Widget.AppCompat.Button.Colored" text="隐藏" />
            {/* <text text="每天9点，群公告准时发车" />
            <text text="截图后打开微信扫描二维码加入" />
            <text text="一群已满200人，二群新建，车队共享" /> */}
            <text text="如果二维码无法进入请添加小助手微信拉进群：zs2020618" />
        </vertical>
    </frame>
)

ui.ver.setText('\n版本：V' + VERSION)

threads.start(checkUpdate)

ui.automationPermission.click(function() {
    threads.start(autoPerReq)
})

ui.consolePermission.click(function() {
    threads.start(conPerReq)
})

ui.startTask.click(function() {
    engines.execScriptFile('./start.js')
})

ui.discountTask.click(function() {
    engines.execScriptFile('./discount.js')
})

// ui.specialTask.click(function() {
//     engines.execScriptFile('./special.js')
// })

// ui.showQun.click(function() {
//     ui.qun.visibility = 0 
// })

ui.feedback.click(function() {
    app.openUrl('https://github.com/monsternone/tmall-miao')
})

ui.hideQun.click(function() {
    ui.qun.visibility = 8
})

ui.checkUpdate.click(function() {
    threads.start(checkUpdate)
})

// ui.jd.click(function() {
//     app.openUrl('https://u.jd.com/sPttYC')
// })

function autoPerReq() {
    if(!auto.service) {
        toast('进入 无障碍 ，选择 天猫双十一喵币助手')
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
    http.get(versionUrl, {}, function(res, err){
        if(err){
            toast('检查更新出错，请手动前往项目地址查看')
            return
        }
        var version = res.body.string()
        if (version != VERSION) {
            var go = confirm("有新的版本，前往下载")
            if (go) {
                app.openUrl('https://github.com/MonsterNone/tmall-miao/releases')
            }
        }
        else {
            toast('当前为最新版')
        }
    })
}


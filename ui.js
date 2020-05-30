"ui";

const VERSION = 2

ui.layout(
    <vertical>
        <button id="automationPermission" text="1. 授予无障碍权限" />
        <button id="consolePermission" text="2. 授予悬浮窗权限" />
        <button id="startTask" text="3. 开始每日任务" />
        <button id="discountTask" text="4. 领取618红包（每天三次）" />
        <button id="checkUpdate" text="检查更新" />
        <text text="部分机型权限授予部分可能出现bug，如果始终无法授予请重启手机尝试" />
        <text text="使用说明" textColor="red" />
        <text text="1. 运行脚本之前建议按首先点击授予权限" />
        <text text="2. 脚本运行过程中按 音量减 即可强制停止" />
        <text text="3. 部分每日任务需要手动完成" />
        <text text="其他说明" textColor="red" />
        <text text="1. 本脚本基于Auto.JS（感谢原开发者）" />
        <text text="2. 免费！" />
        <text text="3. 项目地址https://github.com/MonsterNone/tmall-miao" />
        <text text="4. 运行中出现bug请附上详细控制台log、页面截图等提交issue" />
    </vertical>
)

threads.start(checkUpdate)

ui.automationPermission.click(function() {
    if (auto.service == null) { 
        toast('进入 无障碍 ，选择 天猫618喵币助手')
        threads.start(function () { 
            auto()
        })
        toast('无障碍权限授予成功')
    }
    else {
        toast('无障碍权限授予成功')
    }
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

ui.checkUpdate.click(function() {
    threads.start(checkUpdate)
})

function autoPerReq() {
    toast('进入 无障碍 ，选择 天猫618喵币助手')
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
    var versionUrl = 'https://cdn.jsdelivr.net/gh/monsternone/tmall-miao/version'
    http.get(versionUrl, {}, function(res, err){
        if(err){
            toast('检查更新出错，请手动前往项目地址查看')
            return
        }
        var version = res.body.string()
        if (version != VERSION) {
            confirm("有新的版本，前往下载")
                .then(go => {
                    if(go){
                        app.openUrl('https://github.com/MonsterNone/tmall-miao/releases')
                    }
                })
        }
        else {
            toast('当前为最新版')
        }
    })
}


"ui";

const VERSION = '20221111-J'

const deviceWidth = device.width
const deviceHeight = device.height

ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar color="white" id="toolbar" title="喵币助手（2022双11）" h="auto" >
                </toolbar>
                <tabs id="tabs" />
            </appbar>
            <viewpager id="viewpager">
                {/* 第一页 */}
                <frame>
                    <scroll>
                        <vertical gravity="center|top">
                            <card w="{{parseInt(deviceWidth*0.95) + 'px'}}" h="{{parseInt(deviceHeight*0.05) + 'px'}}"
                                margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                <horizontal gravity="center_vertical" padding="5" id="checkUpdate">
                                    <text size="20dp" text="当前版本：{{VERSION}}，点击检查更新" />
                                </horizontal>
                            </card>
                            <card w="{{parseInt(deviceWidth*0.95) + 'px'}}" h="{{parseInt(deviceHeight*0.1) + 'px'}}"
                                margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                <vertical gravity="center_vertical">
                                    <text gravity="center" color="red" text="运行脚本请先授予权限" size="20dp" />
                                    <horizontal gravity="center">
                                        <button id="consolePermission" text="1. 授予悬浮窗权限" />
                                        <button id="automationPermission" text="2. 授予无障碍权限" />
                                    </horizontal>
                                </vertical>
                            </card>
                            <horizontal gravity="center|top">
                                <card w="{{parseInt(deviceWidth*0.45) + 'px'}}" h="auto"
                                    margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                    <vertical gravity="center_vertical">
                                        <text gravity="center" color="blue" text="加入双十一互助组队" size="20dp" />
                                        <vertical gravity="center">
                                            <button id="guild" text="QQ频道（推荐）" />
                                            <button id="qun" text="QQ群：533943195" />
                                        </vertical>
                                    </vertical>
                                </card>
                                <card w="{{parseInt(deviceWidth*0.45) + 'px'}}" h="auto"
                                    margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                    <vertical gravity="center_vertical">
                                        <text gravity="center" color="blue" text="加入好价神车线报群" size="20dp" />
                                        <vertical gravity="center">
                                            <button id="guild1" text="QQ频道（推荐）" />
                                            <button id="qun2" text="QQ群：740725146" />
                                        </vertical>
                                    </vertical>
                                </card>
                            </horizontal>
                            <card w="{{parseInt(deviceWidth*0.95) + 'px'}}" h="auto"
                                margin="5" cardCornerRadius="15dp" cardBackgroundColor="#FFC0BE" gravity="left">
                                <vertical gravity="center_vertical">
                                    <text gravity="center" color="#E8110F" text="双十一必领无门槛红包！！" size="30dp" />
                                    <text gravity="center" color="#E8110F" text="↓↓↓↓↓↓点击下方色块领取↓↓↓↓↓↓" />
                                    <horizontal gravity="center">
                                        <card w="{{parseInt(deviceWidth*0.45) + 'px'}}" h="{{parseInt(deviceHeight*0.18) + 'px'}}"
                                            margin="5" cardCornerRadius="15dp" cardBackgroundColor="#FF82A9"
                                            gravity="left" id="tbHb">
                                            <vertical gravity="center_vertical">
                                                <text gravity="center" color="#FFF000" text="淘宝红包！！" size="30dp" />
                                                <text gravity="center">(已经开始发放)</text>
                                            </vertical>
                                        </card>
                                        <card w="{{parseInt(deviceWidth*0.45) + 'px'}}" h="{{parseInt(deviceHeight*0.18) + 'px'}}"
                                            margin="5" cardCornerRadius="15dp" cardBackgroundColor="#FF82A9"
                                            gravity="left" id="jdHb">
                                            <vertical gravity="center_vertical">
                                                <text gravity="center" color="#FFF000" text="京东红包！！" size="30dp" />
                                                <text gravity="center">领完退出再进，每日3次</text>
                                                <text gravity="center">(10.28开始发放)</text>
                                            </vertical>
                                        </card>
                                    </horizontal>
                                </vertical>
                            </card>
                            <text text="仅供学习参考，请勿用于非法用途，请于下载后24小时内删除。用户使用脚本导致的任何可能结果与开发者无关。" />
                            <text text="1. 本程序基于Auto.JS（感谢原开发者）" />
                            <text autoLink="web" text="2. 本程序完全免费，基础代码全部开源，项目地址：https://github.com/MonsterNone/tmall-miao" />
                            <text text="3. 由于调用淘宝打开页面，部分手机管家可能会误报为诱导软件，实际上本软件绝无任何病毒行为。" />
                        </vertical>
                    </scroll>
                </frame>
                {/* 第二页 */}
                <frame>
                    <horizontal gravity="center_vertical|center_horizontal">
                        <card w="{{parseInt(deviceWidth*0.48) + 'px'}}" h="*"
                            margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="center|top">
                            <vertical>
                                <text textStyle="bold" gravity="center|top" textSize="18dp">淘宝会场(可滑动查看)</text>
                                <scroll gravity="center|top">
                                    <vertical>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="tb5">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/tb5.jpeg" />
                                                <text gravity="center" textSize="16dp">淘宝预售主会场</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="tb1">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/tb1.jpeg" />
                                                <text gravity="center" textSize="16dp">淘宝预售能量红包会场</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="tb2">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/tb2.jpeg" />
                                                <text gravity="center" textSize="16dp">猫超内购清单</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="tb4">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/tb4.jpeg" />
                                                <text gravity="center" textSize="16dp">预售实时热销榜</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="tb3">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/tb3.jpeg" />
                                                <text gravity="center" textSize="16dp">聚划算百亿补贴</text>
                                            </vertical>
                                        </card>
                                    </vertical>
                                </scroll>
                            </vertical>
                        </card>
                        <card w="{{parseInt(deviceWidth*0.48) + 'px'}}" h="*"
                            margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="center|top">
                            <vertical>
                                <text textStyle="bold" gravity="center|top" textSize="18dp">京东会场(可滑动查看)</text>
                                <scroll gravity="center|top">
                                    <vertical>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="jd1">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/jd1.jpg" />
                                                <text gravity="center" textSize="16dp">京东预售主会场</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="jd2">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/jd2.jpg" />
                                                <text gravity="center" textSize="16dp">爆款手机买贵1.2倍退差</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="jd4">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/jd4.jpg" />
                                                <text gravity="center" textSize="16dp">家电双11预售提前购</text>
                                            </vertical>
                                        </card>
                                        <card marginBottom="10dp" h="auto" w="*" cardBackgroundColor="#f5f5f5" id="jd3">
                                            <vertical>
                                                <img layout_gravity="center" src="file://res/activity/jd3.jpg" />
                                                <text gravity="center" textSize="16dp">爆款价同11.11，定金100抵1111</text>
                                            </vertical>
                                        </card>
                                    </vertical>
                                </scroll>
                            </vertical>
                        </card>
                    </horizontal>
                </frame>
                {/* 第三页 */}
                <frame>
                    <scroll>
                        <vertical>
                            <text text="软件已做防检测处理。如果你的手机内装有其他辅助，有可能导致任务收益减少。" textStyle="italic" textColor="red" textSize="18dp" />
                            <text text="运行前需要首先在首页授予权限！！！！" textStyle="bold" textColor="red" textSize="30dp" />
                            <card w="{{parseInt(deviceWidth*0.95) + 'px'}}" h="auto"
                                margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                <vertical gravity="center_vertical">
                                    <text gravity="center" text="淘宝任务" size="20dp" color="#FF6D31" />
                                    <horizontal gravity="center">
                                        <button id="startTask" text="主活动" />
                                        <button id="energyTask" text="能量任务" />
                                        <button id="huichangTask" text="会场任务" />
                                        <button id="tbHb1" text="淘宝双十一红包" />
                                    </horizontal>
                                </vertical>
                            </card>
                            <card w="{{parseInt(deviceWidth*0.95) + 'px'}}" h="auto"
                                margin="5" cardCornerRadius="15dp" cardBackgroundColor="#f5f5f5" gravity="left">
                                <vertical gravity="center_vertical">
                                    <text gravity="center" text="京东任务" size="20dp" color="#FF6D31" />
                                    <horizontal gravity="center">
                                        <button id="startJDTask" text="主活动" />
                                        <button id="jdHb1" text="京东双十一红包（28日中午12点开启）" />
                                    </horizontal>
                                </vertical>
                            </card>
                            <scroll>
                                <vertical margin="5">
                                    <text textStyle="bold">使用帮助：</text>
                                    <text>在首页授予权限模块，给予软件运行必要的权限，之后点击上方按钮即可完成任务。</text>
                                    <text textStyle="bold">可能出现的问题：</text>
                                    <text>Q: 点击开始运行，跳转到通知权限页面</text>
                                    <text>A: 华为/荣耀机型需要在设置-应用管理内手动打开软件的悬浮窗权限</text>
                                    <text>Q: 京东任务检测不到活动、无法检测到任务列表等情况</text>
                                    <text>A: 请首先检查系统WebView版本，高于101版本则无法获取到控件（检测方法：手机设置-应用列表，勾选显示系统应用后搜索webview）</text>
                                </vertical>
                            </scroll>
                        </vertical>
                    </scroll>
                </frame>
                {/* 第四页
                <frame>
                    <com.stardust.autojs.core.console.ConsoleView id="console" h="*" />
                </frame> */}
            </viewpager>
        </vertical>
    </drawer>
);

activity.setSupportActionBar(ui.toolbar);
ui.viewpager.setTitles(["主页", "双11会场", "进行任务"]);
ui.tabs.setupWithViewPager(ui.viewpager);
// ui.viewpager.setOnPageChangeListener({
//     //已选定页面发生改变时触发
//     onPageSelected: function (index) {
//         if (index == 4) {
//             /**控制台 */
//             ui.console.setConsole(runtime.console);
//             // ui.console.findViewById(org.autojs.autojs.R.id.input_container).setVisibility(android.view.View.GONE);
//             //ui.console.setConsole(org.autojs.autojs.autojs.AutoJs.getInstance().getGlobalConsole());            

//             // 设置控制台字体颜色
//             let c = new android.util.SparseArray();
//             let Log = android.util.Log;
//             c.put(Log.VERBOSE, new java.lang.Integer(colors.parseColor("#dfc0c0c0")));
//             c.put(Log.DEBUG, new java.lang.Integer(colors.parseColor("#cc000000")));
//             c.put(Log.INFO, new java.lang.Integer(colors.parseColor("#ff64dd17")));
//             c.put(Log.WARN, new java.lang.Integer(colors.parseColor("#ff2962ff")));
//             c.put(Log.ERROR, new java.lang.Integer(colors.parseColor("#ffd50000")));
//             c.put(Log.ASSERT, new java.lang.Integer(colors.parseColor("#ffff534e")));
//             ui.console.setColors(c);
//             /**控制台 */
//         }
//     }
// })

threads.start(checkUpdate)

confirm('为了保证运行效果，软件启动后会清空一次剪贴板，不允许请点取消')
    .then(value => {
        if (value) {
            setClip('')
            toast('剪贴板清空')
        } else {
            toast('不清空')
        }
    })

ui.checkUpdate.click(function () {
    threads.start(checkUpdate)
})

ui.consolePermission.click(function () {
    threads.start(conPerReq)
})

ui.automationPermission.click(function () {
    threads.start(autoPerReq)
})

ui.guild.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://forward/url?url_prefix=aHR0cHM6Ly9xdW4ucXEuY29tL3Fxd2ViL3F1bnByby9zaGFyZT9pbnZpdGVDb2RlPTFYMGNzSFRXU1Bu'
    })
})

ui.guild1.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://forward/url?url_prefix=aHR0cHM6Ly9xdW4ucXEuY29tL3Fxd2ViL3F1bnByby9zaGFyZT9pbnZpdGVDb2RlPTFYMGNzSFRXU1Bu'
    })
})

ui.qun.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://card/show_pslcard?src_type=internal&version=1&uin=533943195&card_type=group&source=qrcode'
    })
})

ui.qun2.click(function () {
    app.startActivity({
        action: 'VIEW',
        data: 'mqqapi://card/show_pslcard?src_type=internal&version=1&uin=740725146&card_type=group&source=qrcode'
    })
})

ui.tbHb.click(function () {
    const url = 'https://s.m.taobao.com/h5?q=惊喜不断来dddd'
    openTbUrl(url)
})

ui.jdHb.click(function () {
    toast('京东红包暂未开启')
})

ui.tbHb1.click(function () {
    const url = 'https://s.m.taobao.com/h5?q=惊喜不断来dddd'
    openTbUrl(url)
})

ui.jdHb1.click(function () {
    toast('京东红包暂未开启')
})

ui.tb1.click(function () { openTbUrl('https://s.click.taobao.com/UiWnRSu') })
ui.tb2.click(function () { openTbUrl('https://s.click.taobao.com/0KclRSu') })
ui.tb3.click(function () { openTbUrl('https://s.click.taobao.com/5ByfBSu') })
ui.tb4.click(function () { openTbUrl('https://s.click.taobao.com/76MkRSu') })
ui.tb5.click(function () { openTbUrl('https://s.m.taobao.com/h5?q=惊喜不断来dddd') })
ui.jd1.click(function () { openJdUrl('https://u.jd.com/kdBs9Ry') })
ui.jd2.click(function () { openJdUrl('https://u.jd.com/kCB6yl5') })
ui.jd3.click(function () { openJdUrl('https://u.jd.com/kCBuyG7') })
ui.jd4.click(function () { openJdUrl('https://u.jd.com/kKBsW0H') })

ui.startTask.click(function () {
    alert('淘宝活动尚未开始', '敬请关注脚本更新')
    // engines.execScriptFile('./start.js')
})

ui.energyTask.click(function () {
    engines.execScriptFile('./tb_nengliang.js')
})

ui.huichangTask.click(function () {
    engines.execScriptFile('./tb_huichang.js')
})

ui.startJDTask.click(function () {
    engines.execScriptFile('./start_jd.js')
})

// 唤起京东APP打开url的方法
function openJdUrl(url) {
    app.startActivity({
        action: "VIEW",
        data: 'openApp.jdMobile://virtual?params={"category":"jump","des":"m","sourceValue":"JSHOP_SOURCE_VALUE","sourceType":"JSHOP_SOURCE_TYPE","url":"' + url + '","M_sourceFrom":"h5auto","msf_type":"auto"}'
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

function conPerReq() {
    toast('打开悬浮窗权限')
    alert('华为/荣耀机型注意', '请手动到设置-应用-权限中开启')
    console.show()
    console.log('悬浮窗权限授予成功！此窗口马上消失')
    sleep(1000)
    console.hide()
}

function autoPerReq() {
    if (!auto.service) {
        alert('找到双十一任务助手，勾选授予权限', '部分机型在“已安装服务”中')
    }
    auto.waitFor()
    toast('无障碍权限授予成功')
}

function checkUpdate() {
    if (VERSION == 0) {
        toast('无法加载version.js')
        return
    }
    toast('正在检查更新')
    const versionUrl = 'https://gitlab.com/MonsterNone/tmall-miao/-/raw/main/version'
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
                alert('如果打不开Github链接，请查看QQ频道（或QQ群）公告至蓝奏云下载')
                app.openUrl('https://github.com/MonsterNone/tmall-miao/releases/latest')
            }
        } else {
            toast('当前为最新版')
        }
    })
}
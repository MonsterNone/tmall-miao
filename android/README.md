# 618任务助手 - Android (uiautomator2) 版

基于 [MonsterNone/tmall-miao](https://github.com/MonsterNone/tmall-miao) 的 Android 适配版本。

## 改造说明

核心改动是将 `hmdriver2` 替换为 `uiautomator2`，以下是关键 API 映射：

| 功能 | hmdriver2 (鸿蒙) | uiautomator2 (安卓) |
|------|-----------------|---------------------|
| 连接设备 | `Driver()` | `u2.connect()` |
| 元素是否存在 | `.exists()` 方法 | `.exists` 属性 |
| 返回键 | `d.go_back()` | `d.press('back')` |
| 输入文本 | `d.input_text()` | `d.send_keys()` |
| 启动/停止应用 | `d.start_app()` / `d.stop_app()` | `d.app_start()` / `d.app_stop()` |
| 控件树 | `dump_hierarchy()` 返回 JSON | `dump_hierarchy()` 返回 XML 字符串 |
| 屏幕尺寸 | `d.display_size` 属性 | `d.window_size()` 方法 |
| 手势操作 | `d.gesture.start/move/action()` | `d.touch.down/move/up()` |
| 淘宝包名 | `com.taobao.taobao4hmos` | `com.taobao.taobao` |
| 京东包名 | `com.jd.hm.mall` | `com.jingdong.app.mall` |

## 环境准备

### 1. 安装 Python

推荐 Python 3.8+，Windows 用户推荐 3.10。

### 2. 安装 ADB

下载 [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)，将 `adb.exe` 所在目录加入系统 PATH。

### 3. 安装 Python 依赖

```bash
cd android
pip install -r requirements.txt
```

### 4. 初始化手机端的 uiautomator2 服务（首次必须）

手机开启 USB 调试并连接电脑后，执行：

```bash
python -m uiautomator2 init
```

这会在手机上安装 `atx-agent` 和 `uiautomator2-apk` 两个必要组件。成功后会显示 `successfully init`。

## 连接设备

### Android 真机

1. 手机开启「开发者选项」→ 打开「USB 调试」
2. USB 数据线连接电脑
3. 验证连接：`adb devices` 显示设备序列号代表手机正常连接
4. 直接运行脚本即可，`u2.connect()` 会自动连接

## 运行

```bash
cd android
python main.py
```

按菜单提示选择：
- `0` — 一键完成所有任务
- `1` — 仅淘金币任务
- `2` — 仅淘宝能量红包任务
- `3` — 仅京东推红包任务
- `4` — 仅京东打卡任务
- `5` — 退出

运行中 `Ctrl+C` 可随时中断。

## 注意事项

1. **首次使用必须执行 `python -m uiautomator2 init`**，否则会报连接错误
2. **任务运行期间不要操作手机**，否则可能干扰脚本的点击和滑动

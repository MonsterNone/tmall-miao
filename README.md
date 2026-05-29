# 618任务助手(鸿蒙/安卓通用版)

> AutoJS版太容易被检测，已停止开发。

---

# 618淘宝淘金币互助网站：https://tasku.top

---

当前版本：20260618-C

2026 618已支持：

- [x] 淘宝淘金币任务
- [x] 淘宝红包能量任务
- [ ] 京东推红包任务
- [ ] 京东红包打卡任务

已完成：

- [x] 适配Android (uiautomator2)
- [x] 适配HarmonyOS (hmdriver2)
- [x] 运行时设备类型选择

开发中：

- [x] 打包运行

> 当前仍在开发调试中，请手动运行。后续可能会制作一键运行安装包。

## 一键运行（仅限Windows X64）

在Releases中下载，下载后用cmd运行（推荐，在下载文件夹空白处Shift+右键，选择打开shell）或直接双击运行均可。adb、hdc已打包。

## 任务依赖

由于系统特性，需要使用电脑（Win/Mac）运行

1. Python3.8+版本
2. 对应的调试工具：
   - 鸿蒙：HDC调试工具
   - 安卓：ADB调试工具
3. 对应的自动化库：
   - 鸿蒙：[hmdriver2](https://github.com/codematrixer/hmdriver2)
   - 安卓：[uiautomator2](https://github.com/openatx/uiautomator2)
4. 手机开启开发者模式，并打开USB调试或无线调试

## 克隆仓库

git clone或右上角下载zip均可

## 安装依赖

### 1. 下载Python3

https://www.python.org/downloads/

推荐3.10版本，https://www.python.org/ftp/python/3.10.11/

### 2. 安装自动化库

电脑上打开终端，执行：

```bash
# 安装两个库（都装上，运行时选择设备类型）
pip3 install -r requirements.txt
```

### 3. 安装调试工具

**鸿蒙设备：**

安装HDC工具，并配置环境变量

[官网操作指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/hdc#环境准备)

**安卓设备：**

安装ADB工具，并配置环境变量

然后初始化uiautomator2设备端：

```bash
python -m uiautomator2 init
```

### 4. 开启手机USB调试，并连接电脑

**鸿蒙设备：**

`设置`-点击账号下方`手机名称`-连续点击5次`软件版本`，开启开发者选项

重启后`设置`-`系统`-`开发者选项`，打开`USB调试`或`无线调试`

USB连接：通过数据线连接电脑，终端执行`hdc list targets`查看是否显示手机

无线连接：终端输入`hdc tconn 手机无线调试显示的ip:端口号`

**安卓设备：**

`设置`-`关于手机`-连续点击7次`版本号`，开启开发者选项

`设置`-`开发者选项`，打开`USB调试`

USB连接：通过数据线连接电脑，终端执行`adb devices`查看是否显示手机

## 运行脚本

```bash
python main.py
```

运行后会提示选择设备类型（鸿蒙/安卓），选择后即可使用。

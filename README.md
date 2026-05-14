# 618任务助手(HarmonyOS Next版)

> AutoJS版太容易被检测，已停止开发。

当前版本：20260618-B

2026 618已支持：

- [x] 淘宝淘金币任务
- [x] 淘宝红包能量任务
- [未开始] 京东推红包任务
- [未开始] 京东红包打卡任务

开发中：
- [ ] 打包运行
- [ ] 适配Android

> 当前仍在开发调试中，请手动运行。后续可能会制作一键运行安装包。

> 此版本理论上也可以修改几行代码转换为uiautomator2在安卓运行，后续可能会制作整合版。

## 任务依赖

由于鸿蒙系统特性，需要使用电脑（Win/Mac）运行

1. Python3.8+版本
2. 鸿蒙HDC调试工具
2. [hmdriver2](https://github.com/codematrixer/hmdriver2)库
3. 手机开启开发者模式，并打开USB调试或无线调试

## 安装依赖

1. 下载python3

https://www.python.org/downloads/

> Windows推荐3.10版本，https://www.python.org/ftp/python/3.10.11/

2. 安装HDC工具，并配置环境变量

[官网操作指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/hdc#环境准备)

安装后根据指南后续不知，添加hdc到系统环境变量

3. 安装hmdirver2基础库

电脑上打开终端，执行`pip3 install -U hmdriver2`

4. 开启手机usb调试，并连接电脑

`设置`-点击账号下方`手机名称`-连续点击5次`软件版本`，开启开发者选项

重启后`设置`-`系统`-`开发者选项`，打开`USB调试`或`无线调试`

USB连接： 通过数据线连接电脑，终端执行hdc list targets查看是否显示手机

无线连接：终端输入`hdc tconn 手机无线调试显示的ip:端口号`

## 运行脚本

`python main.py`
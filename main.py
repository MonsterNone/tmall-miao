import argparse
import json
import os
import platform
import sys
import time
import threading
import urllib.request

# 打包后将内置的 tools 目录加入 PATH，使 hdc/adb 可被找到
if getattr(sys, 'frozen', False):
    _tools_dir = os.path.join(sys._MEIPASS, 'tools')
    if os.path.isdir(_tools_dir):
        os.environ['PATH'] = _tools_dir + os.pathsep + os.environ.get('PATH', '')
        os.environ['ADBUTILS_ADB_PATH'] = os.path.join(_tools_dir, 'adb.exe')


# 颜色设置 - 适用于支持ANSI转义码的终端
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    INFO = '\033[90m'
    INPUT = '\033[33m'
    BLINK = '\033[5m'


def is_windows():
    """检查是否在Windows系统上运行"""
    return platform.system() == 'Windows'


def clear_screen():
    """清屏函数，支持不同操作系统"""
    os.system('cls' if is_windows() else 'clear')


def animate_text(text, delay=0.02, new_line=True):
    """动画显示文本"""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(delay)
    if new_line:
        print()


def _get_base_path():
    """获取资源文件的基础路径，兼容 PyInstaller 打包"""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def _read_local_version():
    """从 version.json 读取本地版本号"""
    try:
        version_path = os.path.join(_get_base_path(), 'version.json')
        with open(version_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('version', '')
    except Exception:
        return ''


def check_version():
    """检测是否有新版本，有则提示，异常时静默跳过"""
    local_version = _read_local_version()
    if not local_version:
        return

    try:
        url = 'https://gh.dpik.top/https://github.com/MonsterNone/tmall-miao/raw/refs/heads/next/version.json'
        req = urllib.request.Request(url, headers={'User-Agent': 'tmall-miao'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            remote_data = json.loads(resp.read().decode('utf-8'))
        remote_version = remote_data.get('version', '')
        if remote_version and remote_version != local_version:
            print(f"{Colors.WARNING}╔══════════════════════════════════════════╗{Colors.ENDC}")
            print(f"{Colors.WARNING}║  {Colors.BOLD}发现新版本: {remote_version}{Colors.ENDC}{Colors.WARNING}".ljust(44) + f"║{Colors.ENDC}")
            print(f"{Colors.WARNING}║  请及时更新以获得最新功能和修复".ljust(42) + f"║{Colors.ENDC}")
            print(f"{Colors.WARNING}╚══════════════════════════════════════════╝{Colors.ENDC}")
            print()
    except Exception:
        print(f"{Colors.INFO}版本检测失败，请检查网络连接{Colors.ENDC}")
        print()


def display_welcome():
    """显示增强的欢迎界面"""
    clear_screen()

    local_version = _read_local_version() or 'unknown'
    title = f"""
{Colors.HEADER}╔══════════════════════════════════════════╗{Colors.ENDC}
{Colors.HEADER}║                                          ║{Colors.ENDC}
{Colors.HEADER}║   {Colors.BOLD}欢迎使用喵币助手Next {local_version}{Colors.ENDC}{Colors.HEADER}       ║{Colors.ENDC}
{Colors.HEADER}║                                          ║{Colors.ENDC}
{Colors.HEADER}╚══════════════════════════════════════════╝{Colors.ENDC}
"""
    animate_text(title, 0.005)
    time.sleep(0.2)

    print()


def select_device():
    """设备类型选择"""
    print(f"{Colors.OKBLUE}╔══════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.OKBLUE}║          {Colors.BOLD}请选择设备类型{Colors.ENDC}{Colors.OKBLUE}                  ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╠══════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 1. {Colors.ENDC}鸿蒙 (HarmonyOS)  - hmdriver2{Colors.OKBLUE}        ║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 2. {Colors.ENDC}安卓 (Android)     - uiautomator2{Colors.OKBLUE}     ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╚══════════════════════════════════════════╝{Colors.ENDC}")

    while True:
        choice = input(f"{Colors.INPUT}请选择设备类型 (1-2): {Colors.ENDC}").strip()
        if choice == "1":
            print(f"{Colors.OKGREEN}已选择：鸿蒙设备 (hmdriver2){Colors.ENDC}")
            return 'hmdriver2'
        elif choice == "2":
            print(f"{Colors.OKGREEN}已选择：安卓设备 (uiautomator2){Colors.ENDC}")
            return 'uiautomator2'
        else:
            print(f"{Colors.FAIL}❌ 无效选择，请输入1或2。{Colors.ENDC}")


def select_connection():
    """连接方式选择"""
    print()
    print(f"{Colors.OKBLUE}╔══════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.OKBLUE}║          {Colors.BOLD}请选择连接方式{Colors.ENDC}{Colors.OKBLUE}                  ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╠══════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 1. {Colors.ENDC}USB 有线连接{Colors.OKBLUE}                         ║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 2. {Colors.ENDC}WiFi 无线连接{Colors.OKBLUE}                         ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╚══════════════════════════════════════════╝{Colors.ENDC}")

    while True:
        choice = input(f"{Colors.INPUT}请选择连接方式 (1-2): {Colors.ENDC}").strip()
        if choice == "1":
            print(f"{Colors.OKGREEN}已选择：USB有线连接{Colors.ENDC}")
            return None
        elif choice == "2":
            addr = input(f"{Colors.INPUT}请输入设备IP地址和端口 (如 192.168.1.100:5555): {Colors.ENDC}").strip()
            if not addr:
                print(f"{Colors.FAIL}❌ 地址不能为空，请重新选择。{Colors.ENDC}")
                continue
            print(f"{Colors.OKGREEN}已选择：WiFi无线连接 ({addr}){Colors.ENDC}")
            return addr
        else:
            print(f"{Colors.FAIL}❌ 无效选择，请输入1或2。{Colors.ENDC}")


def display_menu():
    features = [
        f"{Colors.OKCYAN}✓ 互助QQ群：533943195{Colors.ENDC}",
        f"{Colors.OKCYAN}✓ 互助网站：https://tasku.top{Colors.ENDC}"
    ]

    for feature in features:
        animate_text(feature, 0.01)
        time.sleep(0.05)

    """显示优化的功能菜单"""
    print(f"{Colors.OKBLUE}╔══════════════════════════════════════════╗{Colors.ENDC}")
    print(
        f"{Colors.OKBLUE}║                {Colors.BOLD}功能菜单{Colors.ENDC}{Colors.OKBLUE}                  ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╠══════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 0. {Colors.ENDC}一键完成所有任务{Colors.OKBLUE.ljust(27, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 1. {Colors.ENDC}淘金币10亿任务{Colors.OKBLUE.ljust(29, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.OKCYAN}║ 2. {Colors.ENDC}淘宝能量红包任务{Colors.OKBLUE.ljust(27, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.OKCYAN}║ 3. {Colors.ENDC}京东推红包任务{Colors.OKBLUE.ljust(29, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.OKCYAN}║ 4. {Colors.ENDC}京东打卡任务{Colors.OKBLUE.ljust(31, ' ')}║{Colors.ENDC}")
    print(f"{Colors.WARNING}║ 5. {Colors.ENDC}退出程序{Colors.OKBLUE.ljust(35, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╚══════════════════════════════════════════╝{Colors.ENDC}")


def loading_animation(message="加载中", duration=1.5):
    """显示加载动画（固定时长）"""
    symbols = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
    start_time = time.time()

    while time.time() - start_time < duration:
        for symbol in symbols:
            print(f"\r{Colors.INFO}{message} {symbol}{Colors.ENDC}", end='', flush=True)
            time.sleep(0.1)
            if time.time() - start_time >= duration:
                break

    print(f"\r{Colors.OKGREEN}{message} 完成！{Colors.ENDC}{' ' * 10}")


class _LoadingSpinner:
    """后台加载动画，配合实际操作使用"""

    def __init__(self, message="加载中"):
        self.message = message
        self._stop_event = threading.Event()
        self._thread = None

    def start(self):
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._spin, daemon=True)
        self._thread.start()

    def _spin(self):
        symbols = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
        idx = 0
        while not self._stop_event.is_set():
            print(f"\r{Colors.INFO}{self.message} {symbols[idx % len(symbols)]}{Colors.ENDC}", end='', flush=True)
            idx += 1
            self._stop_event.wait(0.1)

    def stop(self, success=True):
        self._stop_event.set()
        if self._thread:
            self._thread.join()
        if success:
            print(f"\r{Colors.OKGREEN}{self.message} 完成！{Colors.ENDC}{' ' * 10}")
        else:
            print(f"\r{Colors.FAIL}{self.message} 失败！{Colors.ENDC}{' ' * 10}")


def main():
    """程序主函数"""
    parser = argparse.ArgumentParser(description='喵币助手Next - 618自动化任务')
    parser.add_argument(
        '--log', dest='loglevel', default='INFO',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        help='日志级别 (默认: INFO)'
    )
    args = parser.parse_args()

    # 统一日志配置
    import logging
    logging.basicConfig(
        format='%(asctime)s %(levelname)-8s [%(filename)-9s:%(lineno)-3d] %(message)s',
        datefmt='%Y-%m-%d:%H:%M:%S'
    )
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, args.loglevel))
    global LOG_LEVEL
    LOG_LEVEL = args.loglevel

    display_welcome()
    check_version()

    # 设备选择
    device_type = select_device()

    # 连接方式选择
    serial = select_connection()

    # 初始化设备适配器（含重试）
    from modules.device_adapter import DeviceAdapter
    max_retries = 2
    d = None
    last_error = None
    for attempt in range(1, max_retries + 1):
        label = f"正在连接设备{' (重试 ' + str(attempt - 1) + '/' + str(max_retries - 1) + ')' if attempt > 1 else ''}"
        spinner = _LoadingSpinner(label)
        spinner.start()
        try:
            d = DeviceAdapter(device_type=device_type, serial=serial)
            spinner.stop(success=True)
            print(f"{Colors.OKGREEN}设备连接成功！({d}){Colors.ENDC}")
            break
        except Exception as e:
            spinner.stop(success=False)
            last_error = e
            if attempt < max_retries:
                print(f"{Colors.WARNING}连接失败，等待3秒后重试...{Colors.ENDC}")
                time.sleep(3)
    else:
        print(f"{Colors.FAIL}❌ 设备连接失败（已重试{max_retries}次）: {str(last_error)}{Colors.ENDC}")
        print(f"{Colors.WARNING}请检查：{Colors.ENDC}")
        if device_type == 'hmdriver2':
            print(f"  1. 手机是否通过USB连接电脑（或WiFi地址是否正确）")
            print(f"  2. 是否开启USB调试")
            print(f"  3. hdc list targets 是否能看到设备")
            if serial:
                print(f"  4. 无线连接需先用USB执行 hdc tmode port 5555 开启TCP模式")
        else:
            print(f"  1. 手机是否通过USB连接电脑（或WiFi地址是否正确）")
            print(f"  2. 是否开启USB调试")
            print(f"  3. adb devices 是否能看到设备")
            print(f"  4. 是否已运行 python -m uiautomator2 init")
            if serial:
                print(f"  5. 无线连接需先用USB执行 adb tcpip 5555 开启TCP模式")
        sys.exit(1)

    print('\n\n\n')

    while True:
        display_menu()

        try:
            print(f"{Colors.INPUT}任务运行中按Ctrl+C可以停止{Colors.ENDC}")
            choice = input(f"{Colors.INPUT}请输入你的选择 (0-5): {Colors.ENDC}").strip()

            if choice == "0":
                loading_animation("开始每日任务一键完成")
                print("")
                loading_animation("正在加载淘金币任务脚本")
                print("")
                from modules import taobao
                tb_coin = taobao.run(d)
                print("")
                # loading_animation("正在加载能量红包任务脚本")
                # print("")
                # from modules import energy
                # energy_coin = energy.run(d)
                # print("")

                print(f"{Colors.HEADER}╔══════════════════════════════════════════╗{Colors.ENDC}")
                print(
                    f"{Colors.HEADER}║       {Colors.BOLD}任务全部完成，获得收益统计{Colors.ENDC}{Colors.HEADER}             ║{Colors.ENDC}")
                print(f"{Colors.HEADER}╠══════════════════════════════════════════╣{Colors.ENDC}")
                print(f"{Colors.OKCYAN}║ 跳一跳体力: {tb_coin:<27}    ║{Colors.ENDC}")
                # print(f"{Colors.OKCYAN}║ 红包能量值:  {energy_coin:<27}    ║{Colors.ENDC}")
                print(f"{Colors.HEADER}╚══════════════════════════════════════════╝{Colors.ENDC}")

            elif choice == "1":
                loading_animation("正在加载淘金币任务脚本")
                print("")
                from modules import taobao
                taobao.run(d)
                print("")
            # elif choice == "2":
            #     loading_animation("正在加载能量红包任务脚本")
            #     print("")
            #     from modules import energy
            #     energy.run(d)
            #     print("")
            elif choice == "5":
                print(f"{Colors.OKGREEN}感谢使用，再见！{Colors.ENDC}")
                sys.exit(0)
            else:
                print(f"{Colors.FAIL}❌ 无效选择，请重新输入。{Colors.ENDC}")
                time.sleep(0.5)
        except KeyboardInterrupt:
            print(f"\n{Colors.WARNING}⚠️ 操作已取消。{Colors.ENDC}")
            time.sleep(0.5)
        except RuntimeError as e:
            print(f"{Colors.FAIL}❌ 任务异常: {str(e)}{Colors.ENDC}")
            time.sleep(1)
        except Exception as e:
            print(f"{Colors.FAIL}❌ 发生错误: {str(e)}{Colors.ENDC}")
            print(e)
            time.sleep(1)


if __name__ == "__main__":
    main()

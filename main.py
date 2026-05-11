import os
import platform
import sys
import time


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
    # 新增颜色和样式
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


def display_welcome():
    """显示增强的欢迎界面"""
    clear_screen()

    # 显示ASCII艺术标题
    title = f"""
{Colors.HEADER}╔══════════════════════════════════════════╗{Colors.ENDC}
{Colors.HEADER}║                                          ║{Colors.ENDC}
{Colors.HEADER}║   {Colors.BOLD}欢迎使用喵币助手Next v20260618-A{Colors.ENDC}{Colors.HEADER}       ║{Colors.ENDC}
{Colors.HEADER}║                                          ║{Colors.ENDC}
{Colors.HEADER}╚══════════════════════════════════════════╝{Colors.ENDC}
"""
    animate_text(title, 0.005)
    time.sleep(0.2)

    # 显示简短描述
    features = [
        f"{Colors.OKCYAN}✓ 互助QQ群：533943195{Colors.ENDC}",
        f"{Colors.OKCYAN}✓ 线报优惠群：604427222{Colors.ENDC}",
        f"{Colors.OKCYAN}✓ 活动通知群：418454328{Colors.ENDC}"
    ]

    for feature in features:
        animate_text(feature, 0.01)
        time.sleep(0.05)

    print()


def display_menu():
    """显示优化的功能菜单"""
    # 显示618红包提示横幅（红色）
    # print(f"{Colors.FAIL}╔══════════════════════════════════════════╗{Colors.ENDC}")
    # print(f"{Colors.FAIL}║          {Colors.ENDC}618大额红包，每日可领！         {Colors.FAIL}║{Colors.ENDC}")
    # print(f"{Colors.FAIL}║          {Colors.ENDC}(进入对应APP搜索哦！)           {Colors.FAIL}║{Colors.ENDC}")
    # print(f"{Colors.FAIL}║       淘宝红包搜：{Colors.FAIL.ljust(14, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.FAIL}║       京东红包搜：{Colors.FAIL.ljust(15, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.FAIL}║ 淘宝购物车红包搜：{Colors.FAIL.ljust(15, ' ')}║{Colors.ENDC}")
    # print(f"{Colors.FAIL}╚══════════════════════════════════════════╝{Colors.ENDC}")
    # print()  # 空行分隔

    # 功能菜单
    print(f"{Colors.OKBLUE}╔══════════════════════════════════════════╗{Colors.ENDC}")
    print(
        f"{Colors.OKBLUE}║                {Colors.BOLD}功能菜单{Colors.ENDC}{Colors.OKBLUE}                  ║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╠══════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 0. {Colors.ENDC}一键完成所有任务{Colors.OKBLUE.ljust(27, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 1. {Colors.ENDC}淘金币10亿任务{Colors.OKBLUE.ljust(29, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 2. {Colors.ENDC}淘宝能量红包任务{Colors.OKBLUE.ljust(27, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 3. {Colors.ENDC}京东推红包任务{Colors.OKBLUE.ljust(29, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKCYAN}║ 4. {Colors.ENDC}京东打卡任务{Colors.OKBLUE.ljust(31, ' ')}║{Colors.ENDC}")
    print(f"{Colors.WARNING}║ 5. {Colors.ENDC}退出程序{Colors.OKBLUE.ljust(35, ' ')}║{Colors.ENDC}")
    print(f"{Colors.OKBLUE}╚══════════════════════════════════════════╝{Colors.ENDC}")


def loading_animation(message="加载中", duration=1.5):
    """显示加载动画"""
    symbols = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']
    start_time = time.time()

    while time.time() - start_time < duration:
        for symbol in symbols:
            print(f"\r{Colors.INFO}{message} {symbol}{Colors.ENDC}", end='', flush=True)
            time.sleep(0.1)
            if time.time() - start_time >= duration:
                break

    print(f"\r{Colors.OKGREEN}{message} 完成！{Colors.ENDC}{' ' * 10}")


def main():
    """程序主函数"""
    display_welcome()

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
                tb_coin = taobao.run()
                print("")
                loading_animation("正在加载能量红包任务脚本")
                print("")
                from modules import energy
                energy_coin = energy.run()
                print("")
                loading_animation("正在加载京东推红包任务脚本")
                print("")
                from modules import jd_push
                push_coin = jd_push.run()
                print("")
                loading_animation("正在加载京东打卡任务脚本")
                print("")
                from modules import jd_hb
                jd_hb.run()
                print("")

                print(f"{Colors.HEADER}╔══════════════════════════════════════════╗{Colors.ENDC}")
                print(
                    f"{Colors.HEADER}║       {Colors.BOLD}任务全部完成，获得收益统计{Colors.ENDC}{Colors.HEADER}             ║{Colors.ENDC}")
                print(f"{Colors.HEADER}╠══════════════════════════════════════════╣{Colors.ENDC}")
                print(f"{Colors.OKCYAN}║ 跳一跳体力: {tb_coin:<27}    ║{Colors.ENDC}")
                print(f"{Colors.OKCYAN}║ 红包能量值:  {energy_coin:<27}    ║{Colors.ENDC}")
                print(f"{Colors.OKCYAN}║ 推红包次数: {push_coin:<27}    ║{Colors.ENDC}")
                print(f"{Colors.OKCYAN}║ 京东打卡:  任务完成                         ║{Colors.ENDC}")
                print(f"{Colors.HEADER}╚══════════════════════════════════════════╝{Colors.ENDC}")

            elif choice == "1":
                loading_animation("正在加载淘金币任务脚本")
                print("")
                from modules import taobao
                taobao.run()
                print("")
            elif choice == "2":
                loading_animation("正在加载能量红包任务脚本")
                print("")
                from modules import energy
                energy.run()
                print("")
            elif choice == "3":
                loading_animation("正在加载京东推红包任务脚本")
                print("")
                from modules import jd_push
                jd_push.run()
                print("")
            elif choice == "4":
                loading_animation("正在加载京东打卡任务脚本")
                print("")
                from modules import jd_hb
                jd_hb.run()
                print("")
            elif choice == "5":
                print(f"{Colors.OKGREEN}感谢使用，再见！{Colors.ENDC}")
                sys.exit(0)
            else:
                print(f"{Colors.FAIL}❌ 无效选择，请重新输入。{Colors.ENDC}")
                time.sleep(0.5)
        except KeyboardInterrupt:
            print(f"\n{Colors.WARNING}⚠️ 操作已取消。{Colors.ENDC}")
            time.sleep(0.5)
        except Exception as e:
            print(f"{Colors.FAIL}❌ 发生错误: {str(e)}{Colors.ENDC}")
            print(e)
            time.sleep(1)


if __name__ == "__main__":
    main()

import json
import re
import time

from hmdriver2.driver import Driver, logger

from utils import find_timeout_text, find_timeout_xpath, open_taobao_search


# 打开任务列表
def open_task_list():
    print('打开任务列表，首先检测')
    if find_timeout_text(d, '累计任务奖励', 5):
        print('已打开')
        return True
    print('点击打开')
    d(text="O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256").click()
    print('等待任务列表')
    if find_timeout_text(d, '累计任务奖励', 5):
        print('任务列表打开成功')
        return True
    else:
        print('未检测到任务列表')
        return False


# 检查是否在任务列表并返回
def return_task_list():
    print('尝试返回活动页')
    if d(text='O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256').exists():
        print('已在活动页')
        return True
    print('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout_text(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
        print('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout_text(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
            return False
    return True


# 获取当前体力
def get_coin():
    print('获取当前体力')
    j = d.dump_hierarchy()
    coin = re.findall(r'当前进度 (\d*)/', json.dumps(j, ensure_ascii=False))[0]
    coin = int(coin)
    print('当前共有', coin, '能量')
    return coin


# 任务名为浏览15秒，且不是搜索
def find_time_15_task():
    print('寻找浏览15秒任务')
    xpath1 = "//*[@text='去浏览'][parent::*[not(.//*[contains(@text, '10个商品')]) and not(.//*[contains(@text, '搜索')])] ]"
    xpath2 = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')]]]"
    if d.xpath(xpath1).exists():
        d.xpath(xpath1).click()
        return True
    elif d.xpath(xpath2).exists():
        d.xpath(xpath2).click()
        return True
    else:
        return False


# 任务名为浏览15秒，搜索任务
def find_time_15_search_task():
    print('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜索')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 10个商品任务
def find_item_10_task():
    print('寻找浏览10个商品任务')
    xpath = "//*[@text='去浏览'][parent::*[.//*[contains(@text, '10个商品')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 能量浏览任务
def do_time_task_energy():
    print('等待进入')
    if not find_timeout_xpath(d, '//*[contains(@text, "下滑浏览15秒")]', 5):
        print('未能检测到进入任务，退出')
        exit(0)
    n = 0
    print('进行任务')
    while True:
        if not d.xpath('//*[contains(@text, "下滑浏览15秒")]').exists() and not d.xpath(
                '//*[contains(@text, "已浏览") and contains(@text, "秒")]').exists():
            print('浏览完成')
            break
        if n > 15:
            print('任务循环过长，终止')
            break
        w, h = d.display_size
        d.swipe(x1=w / 2, y1=h - 100, x2=w / 2 + 100, y2=h - 500)
        n += 1

    if n > 15:
        return False

    print('任务已完成')
    return True


def do_search_task_energy():
    print('等待进入')
    if not find_timeout_text(d, '搜索有福利', 10):
        print('进入任务失败')
        return False
    print('进入任务成功，进行商品搜索')
    d.xpath('//*[@text="搜索发现"]/parent::*/list/listItem[1]').click()
    f = do_time_task_energy()
    if f:  # 不成功不返回，以免多返回了
        d.go_back()
    return f


# 10个商品任务
def do_10_item_task():
    print('等待进入')
    if not find_timeout_text(d, '已浏览商品', 5):
        print('未能检测到进入任务，退出')
        exit(0)
    already = []
    while True:
        print('搜索商品')
        t = json.dumps(d.dump_hierarchy(), ensure_ascii=False, indent=2)
        r = re.findall('"(O1.*?_560x560q75.*?)"', t)
        if len(r) == 0:
            print('未能找到商品。退出')
            exit(0)
        for i in r:
            # print(i)
            if i in already:
                continue
            print('点击浏览')
            d(text=i).click()
            already.append(i)
            print('等待8秒自动返回')
            time.sleep(8)
            if not d.xpath('//*[contains(@text, "_560x560q75")]').exists():
                print('返回')
                d.go_back()
            else:
                print('未进入商品，不返回')
            time.sleep(1)
            if not d(text='已浏览商品').exists():
                print('已完成')
                return True
        d.swipe_ext('up')


if __name__ == '__main__':
    logger.disabled = True
    print('连接设备...')
    d = Driver()
    print('开始运行...')

    TRY_RUN = False
    # TRY_RUN = True

    startCoin = 0
    endCoin = 0

    if not TRY_RUN:
        print('首先关闭音量')
        d.shell("uitest uiInput keyEvent 22")  # 点击扬声器静音

        open_taobao_search(d, '好运红包6666')

        print('等待活动打开...')
        if not find_timeout_text(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 30):
            print('未检测到活动页，退出')
            exit(0)
        print('活动已打开，开始任务')

        startCoin = get_coin()

        while True:
            noTime15TaskFlag = False
            noTime15SearchTaskFlag = False
            noItem10Task = False

            if not open_task_list():
                print('任务列表打开失败，退出')
                exit(0)

            if find_time_15_task():
                print('进行浏览任务')
                if not do_time_task_energy():
                    print('浏览任务失败')
                else:
                    print('浏览任务成功')

                if not return_task_list():
                    print('返回任务列表失败，请重新运行')
                    exit(0)
                else:
                    print('返回成功，进行下一个任务')
                    continue
            else:
                print('没有浏览15秒任务')
                noTime15TaskFlag = True

            if find_time_15_search_task():
                print('进行搜索任务')
                if not do_search_task_energy():
                    print('搜索任务失败')
                else:
                    print('搜索任务成功')

                if not return_task_list():
                    print('返回任务列表失败，请重新运行')
                    exit(0)
                else:
                    print('返回成功，进行下一个任务')
                    continue
            else:
                print('没有搜索任务')
                noTime15SearchTaskFlag = True

            if find_item_10_task():
                print('进行浏览10次商品任务')
                if not do_10_item_task(d):
                    print('浏览10次商品失败')
                else:
                    print('浏览10次商品成功')

                if not return_task_list():
                    print('返回任务列表失败，请重新运行')
                    exit(0)
                else:
                    print('返回成功，进行下一个任务')
                    continue
            else:
                print('没有浏览10次任务')
                noItem10Task = True

            if noTime15TaskFlag and noTime15SearchTaskFlag and noItem10Task:
                print('没有任务了')
                break

        endCoin = get_coin()
        print('本次运行共获得', (endCoin - startCoin), '能量')

        print('运行结束')

    else:  # TRYRUN
        # do_time_task_energy()
        # do_search_task()
        # get_coin()
        print(find_time_15_task())
        # print(find_time_15_search_task())
        # return_task_list()
        # print(find_item_10_task())
        # do_10_item_task()

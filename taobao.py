import json
import re
import time
from hmdriver2.driver import Driver, logger
from utils import find_timeout


# 检查是否在任务列表并返回
def return_task_list():
    print('尝试返回任务列表')
    if d(text='累计任务奖励').exists():
        print('已在任务列表')
        return True
    print('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout(d(text='累计任务奖励'), 5):
        print('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout(d(text='累计任务奖励'), 5):
            return False
    return True


# 获取当前体力
def get_coin():
    print('获取当前体力')
    j = d.dump_hierarchy()
    coin = re.findall(r'剩余 (\d*) 体力', json.dumps(j, ensure_ascii=False))[0]
    coin = int(coin)
    print('当前共有', coin, '体力')
    return coin


# 任务名为浏览15秒，且不是搜索
def find_time_15_task():
    print('寻找浏览15秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and not(.//*[contains(@text, '搜一搜')])] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览15秒，搜索任务
def find_time_15_search_task():
    print('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜一搜')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览5秒，且不是搜索
def find_time_5_task():
    print('寻找浏览5秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览5秒')] and .//*[contains(@text, '搜一搜')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


def do_time_task():
    print('等待进入')
    if not find_timeout(d(text='浏览得奖励'), 10):
        print('进入任务失败')
        return False
    print('进入任务成功，进行商品浏览')
    d.xpath('//*[contains(@text, "310x310xzq90")]').click()
    print('浏览中 等待18秒返回')
    time.sleep(18)
    print('返回')
    d.go_back()
    print('任务已完成')
    return True


def do_search_task():
    print('等待进入')
    if not find_timeout(d(text='搜索有福利'), 10):
        print('进入任务失败')
        return False
    print('进入任务成功，进行商品搜索')
    d.xpath('//*[@text="搜索发现"]/parent::*/list/listItem[1]').click()
    return do_time_task()


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
        print('首先关闭媒体音量')
        d.shell("uitest uiInput keyEvent 17")  # 点击音量减小键

        print('首先关闭淘宝App')
        d.stop_app('com.taobao.taobao4hmos')
        time.sleep(3)
        print('打开淘宝App')
        d.start_app('com.taobao.taobao4hmos')
        print('等待淘宝首页加载...')
        if not find_timeout(d(id='searchBg'), 10):
            print('未能检测到淘宝首页，退出')
        d.xpath('//*[@id="searchBg"]/Stack[2]').click()
        print('等待淘宝搜索页加载...')
        if not find_timeout(d(text='搜索'), 10):
            print('未能检测到淘宝搜索页，退出')
        print('进入活动')
        d.input_text('淘金币618赢10亿')
        d(text='搜索').click()

        print('等待活动打开...')
        if not find_timeout(d(text='O1CN01yJWwRA1uH5o8MXTSE_!!6000000006011-2-tps-741-84'), 30):
            print('未检测到活动页，退出')
            exit(0)
        print('活动已打开，开始任务')

        startCoin = get_coin()

        print('打开任务列表')
        d(text="赚体力").click()
        print('等待任务列表')
        if find_timeout(d(text='累计任务奖励'), 5):
            print('任务列表打开成功')
        else:
            print('任务列表打开失败，退出')
            exit(0)

        while True:
            noTime15TaskFlag = False
            noTime15SearchTaskFlag = False
            noTime5TaskFlag = False

            if find_time_15_task():
                print('进行浏览任务')
                if not do_time_task():
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
                if not do_search_task():
                    print('搜索任务失败')
                else:
                    print('搜索任务成功')
                    d.go_back()

                if not return_task_list():
                    print('返回任务列表失败，请重新运行')
                    exit(0)
                else:
                    print('返回成功，进行下一个任务')
                    continue
            else:
                print('没有搜索任务')
                noTime15SearchTaskFlag = True

            if find_time_5_task():
                print('进行浏览5秒任务，8秒自动返回')
                time.sleep(8)

                if not return_task_list():
                    print('返回任务列表失败，请重新运行')
                    exit(0)
                else:
                    print('返回成功，进行下一个任务')
                    continue
            else:
                print('没有浏览5秒任务')
                noTime5TaskFlag = True

            if noTime15TaskFlag and noTime5TaskFlag:
                print('没有任务了')
                break

        print('领取累计任务奖励')
        print('第一个')
        d(text='立即领取').click_if_exists()
        time.sleep(1)
        print('第二个')
        d(text='立即领取').click_if_exists()
        time.sleep(1)
        print('第三个')
        d(text='立即领取').click_if_exists()
        time.sleep(1)

        endCoin = get_coin()
        print('本次运行共获得', (endCoin - startCoin), '体力')

        print('运行结束')

    else:  # TRYRUN
        # do_time_task()
        # do_search_task()
        # get_coin()
        print(find_time_15_task())
        print(find_time_15_search_task())

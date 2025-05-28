import json
import logging
import re
import time

import hmdriver2.driver
from hmdriver2.driver import Driver, logger

from modules.utils import find_timeout_xpath, open_taobao_search, logger, find_timeout_re, json2xml, mute


# 打开任务列表
def open_task_list():
    logger.info('打开任务列表，首先检测')
    if find_timeout_re(d, '我的能量值', 5):
        logger.info('已打开')
        return True
    logger.info('点击打开')
    d(text="O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256").click()
    logger.info('等待任务列表')
    if find_timeout_re(d, '我的能量值', 5):
        logger.info('任务列表打开成功')
        return True
    else:
        logger.info('未检测到任务列表')
        return False


# 检查是否在任务列表并返回
def return_task_list():
    logger.info('尝试返回活动页')
    if d(text='O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256').exists():
        logger.info('已在活动页')
        return True
    logger.info('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
        logger.info('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
            return False
    return True


# 关闭弹窗
def close_popup():
    logger.info('关闭弹窗，检测3次')
    for i in range(3):
        r = find_timeout_re(d, '"((TB16l86YLb2gK0jSZK9XXaEgFXa.*?jpg_)|开奖即同意)"', 5)
        if r:
            if r[0][0] == '开奖即同意':
                logger.info('点击开奖')
                d.xpath('//*[@text="开奖即同意"]/../../*[last()-1]').click()
            else:
                logger.info('点击关闭')
                d(text=r[0][0]).click()
            time.sleep(1)
        else:
            logger.info('不需要关闭')


# 获取当前体力
def get_coin():
    logger.info('获取当前体力')
    x = json2xml(d.dump_hierarchy())
    coin = x.xpath('//*[@text="我的能量值"]/../*[3]/@text')[0]
    coin = int(coin)
    logger.info('当前共有 {} 能量'.format(coin))
    return coin


# TODO: 改为正则匹配合并搜索
# 任务名为浏览15秒，且不是搜索
def find_time_15_task():
    logger.info('寻找浏览15秒任务')
    xpath1 = "//*[@text='去浏览'][parent::*[not(.//*[contains(@text, '10个商品')]) and not(.//*[contains(@text, '搜索')])] ]"
    xpath2 = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and not(.//*[contains(@text, '搜索')])] ]"
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
    logger.info('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜索')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 10个商品任务
def find_item_10_task():
    logger.info('寻找浏览10个商品任务')
    xpath = "//*[@text='去浏览'][parent::*[.//*[contains(@text, '10个商品')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 能量浏览任务
def do_time_task_energy():
    logger.info('等待进入')
    if not find_timeout_re(d, '下滑浏览15秒', 5):
        logger.info('未能检测到进入任务，退出')
        exit(0)
    n = 0
    logger.info('进行任务')
    while True:
        if not d.xpath('//*[contains(@text, "下滑浏览15秒")]').exists() and not d.xpath(
                '//*[contains(@text, "已浏览") and contains(@text, "秒")]').exists():
            logger.info('浏览完成')
            break
        if n > 15:
            logger.info('任务循环过长，终止')
            break
        w, h = d.display_size
        d.swipe(x1=w / 2, y1=h - 300, x2=w / 2 + 100, y2=h - 600)
        n += 1

    if n > 15:
        return False

    logger.info('任务已完成')
    return True


def do_search_task_energy():
    logger.info('等待进入')
    if not find_timeout_xpath(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品搜索')
    d.xpath('//*[@text="搜索发现"]/parent::*/list/listItem[1]').click()
    f = do_time_task_energy()
    if f:  # 不成功不返回，以免多返回了
        d.go_back()
    return f


# 10个商品任务
def do_10_item_task():
    logger.info('等待进入')
    if not find_timeout_re(d, '已浏览商品', 5):
        logger.info('未能检测到进入任务，退出')
        exit(0)
    already = []
    while True:
        logger.info('搜索商品')
        t = json.dumps(d.dump_hierarchy(), ensure_ascii=False, indent=2)
        r = re.findall('"(O1.*?_560x560q75.*?)"', t)
        if len(r) == 0:
            logger.info('未能找到商品。退出')
            exit(0)
        for i in r:
            # logger.info(i)
            if i in already:
                continue
            logger.info('点击浏览')
            d(text=i).click()
            already.append(i)
            logger.info('等待8秒自动返回')
            time.sleep(8)
            if not d.xpath('//*[contains(@text, "_560x560q75")]').exists():
                logger.info('返回')
                d.go_back()
            else:
                logger.info('未进入商品，不返回')
            time.sleep(1)
            if not d(text='已浏览商品').exists():
                logger.info('已完成')
                return True
        d.swipe_ext('up')


def run():
    global d
    logger.setLevel(logging.INFO)
    logger.info('连接设备...')
    d = Driver()
    logger.info('开始运行...')

    start_coin = 0
    end_coin = 0

    logger.info('首先关闭音量')
    mute(d)

    open_taobao_search(d, '好运红包6666')

    logger.info('等待活动打开...')
    if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 30):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    logger.info('首先关闭弹窗')
    if d(text='我的能量值').exists():
        logger.info('不需要关闭')
    else:
        close_popup()

    if not open_task_list():
        logger.error('任务列表打开失败，退出')
        exit(0)

    start_coin = get_coin()

    while True:
        no_time_15_task_flag = False
        no_time_15_search_task_flag = False
        no_item_10_task = False

        if not open_task_list():
            logger.error('任务列表打开失败，退出')
            exit(0)

        if find_time_15_task():
            logger.info('进行浏览任务')
            if not do_time_task_energy():
                logger.info('浏览任务失败')
            else:
                logger.info('浏览任务成功')

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览15秒任务')
            no_time_15_task_flag = True

        if find_time_15_search_task():
            logger.info('进行搜索任务')
            if not do_search_task_energy():
                logger.info('搜索任务失败')
            else:
                logger.info('搜索任务成功')

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有搜索任务')
            no_time_15_search_task_flag = True

        if find_item_10_task():
            logger.info('进行浏览10次商品任务')
            if not do_10_item_task(d):
                logger.info('浏览10次商品失败')
            else:
                logger.info('浏览10次商品成功')

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览10次任务')
            no_item_10_task = True

        if no_time_15_task_flag and no_time_15_search_task_flag and no_item_10_task:
            logger.info('没有任务了')
            break

    end_coin = get_coin()
    logger.info('本次运行共获得 {} 能量'.format(end_coin - start_coin))

    logger.info('运行结束')

hmdriver2.driver.logger.disabled = True
d = 0

if __name__ == '__main__':
    logger.setLevel(logging.DEBUG)
    hmdriver2.driver.logger.disabled = True
    logger.info('连接设备...')
    d = Driver()
    logger.info('开始运行...')

    TRY_RUN = False
    # TRY_RUN = True

    if not TRY_RUN:
        run()
    else:  # TRYRUN
        # do_time_task_energy()
        # do_search_task()
        # get_coin()
        # logger.info(find_time_15_task())
        # logger.info(find_time_15_search_task())
        # return_task_list()
        # logger.info(find_item_10_task())
        # do_10_item_task()
        close_popup()
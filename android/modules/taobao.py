import logging
import re
import time

import uiautomator2 as u2

from modules.utils import (enter_taobao_coin, open_taobao_search,
                           find_timeout_xpath, logger, find_timeout_re,
                           mute, xp_exists, xp_click, xp_click_if_exists)


# 检查是否在任务列表并返回
def return_task_list():
    logger.info('尝试返回任务列表')
    if xp_exists(d, '//node[@text="累计任务奖励"]'):
        logger.info('已在任务列表')
        return True
    logger.info('已点击返回，检测是否成功')
    d.press('back')
    if not find_timeout_re(d, '累计任务奖励', 5):
        logger.info('返回失败，再次返回重试')
        d.press('back')
        if not find_timeout_re(d, '累计任务奖励', 5):
            return False
    return True


# 获取当前体力
def get_coin():
    logger.info('获取当前体力')
    t = d.dump_hierarchy()
    coin = re.findall(r'剩余 (\d*) 体力', t)[0]
    coin = int(coin)
    logger.info('当前共有 {} 体力'.format(coin))
    return coin


# 查找浏览15秒任务
def find_time_15_task():
    logger.info('寻找浏览15秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and not(.//*[contains(@text, '搜一搜')])] ]"
    return xp_click(d, xpath)


# 查找浏览15秒搜索任务
def find_time_15_search_task():
    logger.info('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜一搜')]] ]"
    return xp_click(d, xpath)


# 查找浏览5秒任务
def find_time_5_task():
    logger.info('寻找浏览5秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览5秒')] and not(.//*[contains(@text, '搜一搜')])] ]"
    return xp_click(d, xpath)


# 执行浏览任务
def do_time_task():
    logger.info('等待进入')
    if not find_timeout_re(d, '310x310xzq90', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品浏览')
    xp_click(d, '//*[contains(@text, "310x310xzq90")]')
    logger.info('浏览中 等待18秒返回')
    time.sleep(18)
    logger.info('返回')
    d.press('back')
    logger.info('任务已完成')
    return True


# 执行搜索任务
def do_search_task():
    logger.info('等待进入')
    if not find_timeout_xpath(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品搜索')
    xp_click(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]')
    return do_time_task()


def run():
    global d
    logger.setLevel(logging.INFO)

    logger.info('连接设备...')
    d = u2.connect()
    logger.info('开始运行...')

    start_coin = 0
    end_coin = 0

    logger.info('首先关闭音量')
    mute(d)

    enter_taobao_coin(d)

    logger.info('等待活动打开...')
    if not find_timeout_re(d, 'O1CN', 30):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    start_coin = get_coin()

    logger.info('打开任务列表')
    time.sleep(3)
    xp_click(d, '//node[@text="赚体力"]')
    logger.info('等待任务列表')
    if find_timeout_re(d, '累计任务奖励', 5):
        pass
    if xp_exists(d, '//node[@text="累计任务奖励"]'):
        logger.info('任务列表打开成功')
    else:
        logger.info('任务列表打开失败，退出')
        exit(0)

    done_count = 0

    while True:
        no_time_15_task_flag = False
        no_time_15_search_task_flag = False
        no_time_5_task_flag = False

        if find_time_15_task():
            logger.info('进行浏览任务')
            if not do_time_task():
                logger.info('浏览任务失败')
            else:
                done_count += 1
                logger.info('浏览任务成功')

            time.sleep(3)

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
            if not do_search_task():
                logger.info('搜索任务失败')
            else:
                done_count += 1
                logger.info('搜索任务成功')
                d.press('back')

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有搜索任务')
            no_time_15_search_task_flag = True

        if find_time_5_task():
            logger.info('进行浏览5秒任务，8秒自动返回')
            time.sleep(8)
            done_count += 1

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览5秒任务')
            no_time_5_task_flag = True

        if no_time_15_task_flag and no_time_5_task_flag and no_time_15_search_task_flag:
            logger.info('没有任务了')
            break

    logger.info('领取累计任务奖励')
    for i in find_timeout_re(d, '立即领取', 1):
        logger.info('领取')
        xp_click_if_exists(d, '//*[@text="立即领取"]')
        time.sleep(0.5)

    end_coin = get_coin()
    logger.info('本次运行共完成 {} 任务，获得 {} 体力'.format(done_count, end_coin - start_coin))

    logger.info('运行结束')
    return end_coin - start_coin


d = None

if __name__ == '__main__':
    logger.setLevel(logging.DEBUG)
    logger.info('连接设备...')
    d = u2.connect()
    logger.info('开始运行...')

    TRY_RUN = False
    if not TRY_RUN:
        run()
    else:
        logger.info(find_time_15_task())
        logger.info(find_time_15_search_task())

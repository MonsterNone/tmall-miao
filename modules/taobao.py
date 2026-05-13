import json
import logging
import re
import time

import hmdriver2.driver
from hmdriver2.driver import Driver

from modules.utils import open_taobao_search, find_timeout_xpath, logger, find_timeout_re, mute


# 检查是否在任务列表并返回
def return_task_list():
    logger.info('尝试返回任务列表')
    if d(text='累计任务奖励').exists():
        logger.info('已在任务列表')
        return True
    logger.info('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout_re(d, '累计任务奖励', 5):
        logger.info('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout_re(d, '累计任务奖励', 5):
            return False
    return True


# 获取当前体力
def get_coin():
    logger.info('获取当前体力')
    j = d.dump_hierarchy()
    coin = re.findall(r'剩余 (\d*) 体力', json.dumps(j, ensure_ascii=False))[0]
    coin = int(coin)
    logger.info('当前共有 {} 体力'.format(coin))
    return coin


# 任务名为浏览15秒，且不是搜索
def find_time_15_task():
    logger.info('寻找浏览15秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and not(.//*[contains(@text, '搜一搜')])] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览15秒，搜索任务
def find_time_15_search_task():
    logger.info('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜一搜')]] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览5秒，且不是搜索
def find_time_5_task():
    logger.info('寻找浏览5秒任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览5秒')] and not(.//*[contains(@text, '搜一搜')])] ]"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


def do_time_task():
    logger.info('等待进入')
    if not find_timeout_re(d, '310x310xzq90', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品浏览')
    d.xpath('//*[contains(@text, "310x310xzq90")]').click()
    logger.info('浏览中 等待18秒返回')
    time.sleep(18)
    logger.info('返回')
    d.go_back()
    logger.info('任务已完成')
    return True


def do_search_task():
    logger.info('等待进入')
    if not find_timeout_xpath(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品搜索')
    d.xpath('//*[@text="搜索发现"]/parent::*/list/listItem[1]').click()
    return do_time_task()


def run():
    global d
    logger.setLevel(logging.INFO)

    logger.info('连接设备...')
    d = Driver()
    logger.info('开始运行...')

    startCoin = 0
    endCoin = 0

    logger.info('首先关闭音量')
    mute(d)

    open_taobao_search(d, '618赢20亿')

    logger.info('等待活动打开...')
    if not find_timeout_re(d, '赚体力', 30):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    startCoin = get_coin()

    logger.info('打开任务列表')
    time.sleep(3)
    d(text="赚体力").click()
    logger.info('等待任务列表')
    if find_timeout_re(d, '累计任务奖励', 5):
        logger.info('任务列表打开成功')
    else:
        logger.info('任务列表打开失败，退出')
        return False

    # 任务统计
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

            time.sleep(3)  # 可能有弹窗，等待消失

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
                d.go_back()

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
    for i in find_timeout_re(d, '立即领取', 1):  # 搜索1次，搜搜到几个循环几次
        logger.info('领取')
        d(text='立即领取').click_if_exists()
        time.sleep(0.5)

    endCoin = get_coin()
    logger.info('本次运行共完成 {} 任务，获得 {} 体力'.format(done_count, endCoin - startCoin))

    logger.info('运行结束')

    return endCoin - startCoin


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
        # do_time_task()
        # do_search_task()
        # get_coin()
        logger.info(find_time_15_task())
        logger.info(find_time_15_search_task())

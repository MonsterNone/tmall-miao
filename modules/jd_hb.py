import logging
import time

import hmdriver2
from hmdriver2.driver import Driver

from modules.utils import open_jd_search, logger, find_timeout_re


def close_popup():
    logger.info('关闭弹窗')
    if find_timeout_re(d, '活动规则>', 1):
        d.xpath('//*[contains(@text, "活动时间")]/../../*[last()]').click_if_exists()
        logger.info('再次关闭')
        time.sleep(3)
        d.xpath('//*[contains(@text, "活动规则")]/../../../../*[last()]').click()
    else:
        print('不需要关闭')


def get_red():
    logger.info('获取当前推红包次数')
    coin = find_timeout_re(d, r'今天剩余(\d*)次', 1)[0]
    coin = int(coin)
    logger.info('当前共有 {} 推红包次数'.format(coin))
    return coin


def return_task_list():
    logger.info('尝试返回任务列表')
    if d(text='每天打卡累计').exists():
        logger.info('已在任务列表')
        return True
    logger.info('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout_re(d, '每天打卡累计', 5):
        logger.info('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout_re(d, '每天打卡累计', 5):
            return False
    return True


# 去完成任务，加购，仅需浏览
# genericContainer - 加购推荐好物(1/2)
# staticText - 加购商品
# staticText - 推红包次数+1
# genericContainer -
#   genericContainer - 去完成
def find_view_task():
    logger.info('寻找浏览任务')
    xpath = "//*[contains(@text, '浏览6秒')]/.././/*[@text='去完成']"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


def find_item_5_task():
    logger.info('寻找点击5个商品任务')
    xpath = "//*[contains(@text, '点击5个商品')]/.././/*[@text='去完成']"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


def do_item_5_task():
    logger.info('开始点击5个商品任务')
    logger.info('等待页面加载...')
    if not find_timeout_re(d, '优惠兑换剩余', 5):
        logger.info('未检测到任务，退出')
        return False
    already = []
    while True:
        logger.info('搜索商品')
        r = find_timeout_re(d, r'text": "([0-9a-z]{16})"', 3)
        print(r)
        if not r:
            logger.info('未找到商品，退出')
            return False
        for i in r:
            if i in already:
                continue
            logger.info('点击浏览')
            d(text=i).click()
            already.append(i)
            logger.info('等待8秒自动返回')
            time.sleep(8)
            if not find_timeout_re(d, '优惠兑换剩余', 1):
                logger.info('返回')
                d.go_back()
            else:
                logger.info('未进入商品，不返回')
            time.sleep(1)
            if len(already) >= 5:
                logger.info('已完成')
                return True
        d.swipe_ext('up')


def run():
    global d
    logger.setLevel(logging.INFO)

    logger.info('连接设备...')
    d = Driver()
    logger.info('开始运行...')

    logger.info('首先关闭音量')
    d.shell("uitest uiInput keyEvent 22")  # 点击扬声器静音
    d.shell("uitest uiInput keyEvent 23")  # 点击扬声器静音

    open_jd_search(d, '红包快来886')
    logger.info('等待活动打开...')
    if not find_timeout_re(d, '活动规则', 20):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    close_popup()

    logger.info('打开任务列表')
    time.sleep(3)
    d(text='去领取').click()
    logger.info('等待任务列表...')
    if not find_timeout_re(d, '每天打卡累计', 5):
        logger.error('未检测到任务列表，退出')
        exit(0)

    while True:
        no_view_task = False
        no_item_5_task = False

        if find_view_task():
            logger.info('进行参观任务，8秒自动返回')
            time.sleep(8)

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览15秒任务')
            no_view_task = True

        if find_item_5_task():
            logger.info('进行浏览5个商品任务')

            if not do_item_5_task():
                logger.info('浏览5个商品任务失败')
            else:
                logger.info('浏览5个商品任务成功')

            if not return_task_list():
                logger.info('返回任务列表失败，请重新运行')
                exit(0)
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览15秒任务')
            no_item_5_task = True

        if no_view_task and no_item_5_task:
            logger.info('没有任务了')
            break

    logger.info('领取打卡奖励')
    if d(text='4c1b204204e75dd7').exists():
        d(text='4c1b204204e75dd7').click()
    else:
        logger.info('无需领取')

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
    TRY_RUN = True
    if not TRY_RUN:
        run()

    else:
        logger.debug('DEBUG RUN')
        # get_red()
        close_popup()
        # d.xpath('//*[contains(@text, "活动规则")]/../../../../*[last()]').click()
        # print(find_view_task())
        # do_time_task()
        # do_item_5_task()
        # do_search_task()
        # get_coin()
        # logger.info(find_time_15_task())
        # logger.info(find_time_15_search_task())

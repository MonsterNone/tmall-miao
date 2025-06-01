import logging
import time

import hmdriver2
from hmdriver2.driver import Driver

from modules.utils import open_jd_search, logger, find_timeout_re, mute


def get_red():
    logger.info('获取当前推红包次数')
    coin = find_timeout_re(d, r'今天剩余(\d*)次', 1)[0]
    coin = int(coin)
    logger.info('当前共有 {} 推红包次数'.format(coin))
    return coin


def return_task_list():
    logger.info('尝试返回任务列表')
    if d(text='做任务 得推红包次数').exists():
        logger.info('已在任务列表')
        return True
    logger.info('已点击返回，检测是否成功')
    d.go_back()
    if not find_timeout_re(d, '做任务 得推红包次数', 5):
        logger.info('返回失败，再次返回重试')
        d.go_back()
        if not find_timeout_re(d, '做任务 得推红包次数', 5):
            return False
    return True


# 去完成任务，加购，仅需浏览
# genericContainer - 加购推荐好物(1/2)
# staticText - 加购商品
# staticText - 推红包次数+1
# genericContainer -
#   genericContainer - 去完成
def find_view_task():
    logger.info('寻找浏览加购任务')
    xpath = "//*[@text='去完成' or @text='去关注' or @text='逛一逛']"
    if d.xpath(xpath).exists():
        d.xpath(xpath).click()
        return True
    else:
        return False


def run():
    global d
    logger.setLevel(logging.INFO)

    logger.info('连接设备...')
    d = Driver()
    logger.info('开始运行...')

    logger.info('首先关闭音量')
    mute(d)

    start_red = 0
    end_red = 0

    open_jd_search(d, '天天推红包')
    logger.info('等待活动打开...')
    if not find_timeout_re(d, '赚红包', 20):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    start_red = get_red()

    logger.info('打开任务列表')
    time.sleep(3)
    d.xpath('//*[@text="赚红包"]/../../../../*[2]').click()
    logger.info('等待任务列表')
    if find_timeout_re(d, '做任务 得推红包次数', 5):
        logger.info('任务列表打开成功')
    else:
        logger.info('任务列表打开失败，退出')
        exit(0)

    while True:
        no_view_task = False

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

        # if find_time_15_search_task():
        #     logger.info('进行搜索任务')
        #     if not do_search_task():
        #         logger.info('搜索任务失败')
        #     else:
        #         logger.info('搜索任务成功')
        #         d.go_back()
        #
        #     if not return_task_list():
        #         logger.info('返回任务列表失败，请重新运行')
        #         exit(0)
        #     else:
        #         logger.info('返回成功，进行下一个任务')
        #         continue
        # else:
        #     logger.info('没有搜索任务')
        #     noTime15SearchTaskFlag = True
        #
        # if find_time_5_task():
        #     logger.info('进行浏览5秒任务，8秒自动返回')
        #     time.sleep(8)
        #
        #     if not return_task_list():
        #         logger.info('返回任务列表失败，请重新运行')
        #         exit(0)
        #     else:
        #         logger.info('返回成功，进行下一个任务')
        #         continue
        # else:
        #     logger.info('没有浏览5秒任务')
        #     noTime5TaskFlag = True

        if no_view_task:
            logger.info('没有任务了')
            break

    end_red = get_red()
    logger.info('本次运行共获得 {} 推红包次数'.format(end_red - start_red))

    logger.info('运行结束')
    return end_red - start_red


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

    else:
        logger.debug('DEBUG RUN')
        # get_red()
        d.xpath('//*[@text="赚红包"]/../../../../*[2]').click()
        # do_time_task()
        # do_search_task()
        # get_coin()
        # logger.info(find_time_15_task())
        # logger.info(find_time_15_search_task())

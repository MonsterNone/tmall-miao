import json
import logging
import re
import time

from modules.utils import open_taobao_search, find_timeout_xpath, logger, find_timeout_re, mute


# 检查是否在任务列表并返回
def return_task_list(d):
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
def get_coin(d):
    logger.info('获取当前体力')
    j = d.dump_hierarchy()
    coin = re.findall(r'剩余 (\d*) 体力', json.dumps(j, ensure_ascii=False))[0]
    coin = int(coin)
    logger.info('当前共有 {} 体力'.format(coin))
    return coin


# 任务名为浏览15秒
def find_time_15_task(d):
    logger.info('寻找浏览15秒任务')
    xpath = "//*[@text='去完成'][..//*[contains(@text, '浏览15')]]"
    if d.xpath_exists(xpath):
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览15秒，搜索任务
def find_time_15_search_task(d):
    logger.info('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜一搜')]] ]"
    if d.xpath_exists(xpath):
        d.xpath(xpath).click()
        return True
    else:
        return False


# 任务名为浏览5秒，且不是搜索
def find_time_5_task(d):
    logger.info('寻找浏览5秒任务')
    xpath = "//*[@text='去完成'][..//*[contains(@text, '浏览5秒')]]"
    if d.xpath_exists(xpath):
        d.xpath(xpath).click()
        return True
    else:
        return False


def do_task(d):
    """执行浏览/搜索任务，自动判断页面标识"""
    logger.info('等待进入任务页面')

    result = find_timeout_re(d, '搜索发现|310x310xzq90|浏览15[秒s]"[\s\S]+?得', 10)
    logger.debug(result)
    if not result:
        logger.info('进入任务失败，未检测到任何标识')
        return False

    matched = result[0]
    if matched == '搜索发现':
        logger.info('检测到搜索标识，进行搜索任务')
        if d.device_type == 'hmdriver2':
            d.xpath('//*[@text="搜索发现"]/parent::*/list/listItem[1]').click()
            if not find_timeout_re(d, '310x310xzq90', 10):
                logger.info('搜索任务失败，未检测到310x310xzq90标识')
                return False
            d.xpath('//*[contains(@text, "310x310xzq90")]').click()
        else:
            d.xpath('//*[@text="搜索发现"]/following-sibling::*[1]/*[1]').click()
            if not d.xpath('//*[contains(@text, "310x310xzq90")]').click_exists(timeout=10):
                logger.info('搜索任务失败，未检测到310x310xzq90标识')
                return False
    elif '浏览15' in matched:
        logger.info('检测到沉浸浏览标识，进行浏览任务')
    else:
        logger.info('检测到浏览标识，进行浏览任务')
        d.xpath('//*[contains(@text, "310x310xzq90")]').click()

    logger.info('浏览中 等待18秒返回')
    time.sleep(18)
    logger.info('返回')
    d.go_back()
    if matched == '搜索发现':
        time.sleep(1)
        logger.info('再次返回')
        d.go_back()
    logger.info('任务已完成')
    return True


def run(d):

    logger.info('开始运行...')

    startCoin = 0
    endCoin = 0

    logger.info('首先关闭音量')
    mute(d)

    # 选择启动模式
    print()
    print("╔══════════════════════════════════════════╗")
    print("║          请选择启动模式                  ║")
    print("╠══════════════════════════════════════════╣")
    print("║ 1. 自动打开活动（默认）                  ║")
    print("║ 2. 手动打开活动（适用于淘宝分身）        ║")
    print("╚══════════════════════════════════════════╝")
    while True:
        mode = input("请选择 (1-2，默认1): ").strip()
        if mode == '' or mode == '1':
            logger.info('使用自动模式')
            open_taobao_search(d, '618赢20亿')
            logger.info('等待活动打开...')
            if not find_timeout_re(d, '赚体力', 30):
                logger.info('未检测到活动页，退出')
                raise RuntimeError('未检测到活动页')
            logger.info('活动已打开')
            break
        elif mode == '2':
            logger.info('使用手动模式，请手动打开淘宝分身并进入活动页面')
            input("请手动打开淘宝分身并进入活动页面，完成后按回车继续...")
            logger.info('等待检测活动页...')
            if not find_timeout_re(d, '赚体力', 10):
                logger.info('未检测到活动页，退出')
                raise RuntimeError('未检测到活动页，请确认已进入活动页面')
            logger.info('检测到活动页面')
            break
        else:
            print("无效选择，请输入1或2")

    logger.info('开始任务')

    startCoin = get_coin(d)

    logger.info('打开任务列表')
    time.sleep(5)
    d(text="赚体力").click()
    logger.info('等待任务列表')
    if find_timeout_re(d, '累计任务奖励', 10):
        logger.info('任务列表打开成功')
    else:
        logger.info('任务列表打开失败，退出')
        return False

    # 任务统计
    done_count = 0

    while True:
        no_time_15_task_flag = False
        no_time_5_task_flag = False

        logger.info('等待任务列表刷新')
        time.sleep(5)

        if find_time_15_task(d):
            logger.info('进行浏览任务')
            if not do_task(d):
                logger.info('浏览任务失败')
            else:
                done_count += 1
                logger.info('浏览任务成功')

            time.sleep(3)

            if not return_task_list(d):
                logger.info('返回任务列表失败，请重新运行')
                raise RuntimeError('返回任务列表失败')
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览15秒任务')
            no_time_15_task_flag = True

        # if find_time_15_search_task(d):
        #     logger.info('进行搜索任务')
        #     if not do_task(d):
        #         logger.info('搜索任务失败')
        #     else:
        #         done_count += 1
        #         logger.info('搜索任务成功')
        #         d.go_back()

        #     if not return_task_list(d):
        #         logger.info('返回任务列表失败，请重新运行')
        #         raise RuntimeError('返回任务列表失败')
        #     else:
        #         logger.info('返回成功，进行下一个任务')
        #         continue
        # else:
        #     logger.info('没有搜索任务')
        #     no_time_15_search_task_flag = True

        if find_time_5_task(d):
            logger.info('进行浏览5秒任务，8秒自动返回')
            time.sleep(8)
            done_count += 1

            if not return_task_list(d):
                logger.info('返回任务列表失败，请重新运行')
                raise RuntimeError('返回任务列表失败')
            else:
                logger.info('返回成功，进行下一个任务')
                continue
        else:
            logger.info('没有浏览5秒任务')
            no_time_5_task_flag = True

        if no_time_15_task_flag and no_time_5_task_flag:
            logger.info('没有任务了')
            break

    logger.info('领取累计任务奖励')
    for i in find_timeout_re(d, '立即领取', 1):
        logger.info('领取')
        d.click_if_exists(text='立即领取')
        time.sleep(0.5)

    endCoin = get_coin(d)
    logger.info('本次运行共完成 {} 任务，获得 {} 体力'.format(done_count, endCoin - startCoin))

    logger.info('运行结束')

    return endCoin - startCoin

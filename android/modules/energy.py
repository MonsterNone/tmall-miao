
import logging
import re
import time

import uiautomator2 as u2

from modules.utils import find_timeout_xpath, open_taobao_search, logger, find_timeout_re, mute


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
    if d(text='O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256').exists:
        logger.info('已在活动页')
        return True
    logger.info('已点击返回，检测是否成功')
    d.press('back')
    if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
        logger.info('返回失败，再次返回重试')
        d.press('back')
        if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 5):
            return False
    return True


# 关闭弹窗
def close_popup():
    logger.info('关闭弹窗，检测3次')
    for i in range(3):
        # Android 版 dump_hierarchy 返回 XML，text 在属性中
        r = find_timeout_re(d, r'text="((TB16l86YLb2gK0jSZK9XXaEgFXa.*?jpg_)|开奖即同意)"', 5)
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


# 获取当前能量值
def get_coin():
    logger.info('获取当前体力')
    # 使用 u2 xpath 获取匹配元素的 lxml Element，直接读 attrib
    elems = d.xpath('//*[@text="我的能量值"]/../*').all()
    if len(elems) >= 3:
        coin = int(elems[2].attrib.get('text', '0'))
    else:
        logger.warning('未能解析能量值，设为0')
        coin = 0
    logger.info('当前共有 {} 能量'.format(coin))
    return coin


# 查找浏览15秒任务
def find_time_15_task():
    logger.info('寻找浏览15秒任务')
    xpath1 = "//*[@text='去浏览'][parent::*[not(.//*[contains(@text, '10个商品')]) and not(.//*[contains(@text, '搜索')])] ]"
    xpath2 = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and not(.//*[contains(@text, '搜索')])] ]"
    if xp_exists(d, xpath1):
        xp_click(d, xpath1)
        return True
    elif xp_exists(d, xpath2):
        xp_click(d, xpath2)
        return True
    return False


# 查找浏览15秒搜索任务
def find_time_15_search_task():
    logger.info('寻找浏览15秒的搜索任务')
    xpath = "//*[@text='去完成'][parent::*[.//*[contains(@text, '浏览15秒')] and .//*[contains(@text, '搜索')]] ]"
    if xp_exists(d, xpath):
        xp_click(d, xpath)
        return True
    return False


# 查找浏览10个商品任务
def find_item_10_task():
    logger.info('寻找浏览10个商品任务')
    xpath = "//*[@text='去浏览'][parent::*[.//*[contains(@text, '10个商品')]] ]"
    if xp_exists(d, xpath):
        xp_click(d, xpath)
        return True
    return False


# 执行浏览15秒任务
def do_time_task_energy():
    logger.info('等待进入')
    if not find_timeout_re(d, '下滑浏览15秒', 5):
        logger.info('未能检测到进入任务，退出')
        exit(0)
    n = 0
    logger.info('进行任务')
    while True:
        if not d.xpath('//*[contains(@text, "下滑浏览15秒")]').exists and not d.xpath(
                '//*[contains(@text, "已浏览") and contains(@text, "秒")]').exists:
            logger.info('浏览完成')
            break
        if n > 15:
            logger.info('任务循环过长，终止')
            break
        w, h = d.window_size()
        d.swipe(x1=w / 2, y1=h - 300, x2=w / 2 + 100, y2=h - 600)
        n += 1

    if n > 15:
        return False

    logger.info('任务已完成')
    return True


# 执行浏览15秒搜索任务
def do_search_task_energy():
    logger.info('等待进入')
    if not find_timeout_xpath(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]', 10):
        logger.info('进入任务失败')
        return False
    logger.info('进入任务成功，进行商品搜索')
    xp_click(d, '//*[@text="搜索发现"]/parent::*/list/listItem[1]')
    f = do_time_task_energy()
    if f:
        d.press('back')
    return f


# 执行浏览10个商品任务
def do_10_item_task():
    logger.info('等待进入')
    if not find_timeout_re(d, '已浏览商品', 5):
        logger.info('未能检测到进入任务，退出')
        exit(0)
    already = []
    while True:
        logger.info('搜索商品')
        t = d.dump_hierarchy()  # XML 字符串
        # 匹配 text 属性中的 O1..._560x560q75...
        r = re.findall(r'text="(O1[^"]*?_560x560q75[^"]*?)"', t)
        if len(r) == 0:
            logger.info('未能找到商品。退出')
            exit(0)
        for i in r:
            if i in already:
                continue
            logger.info('点击浏览')
            d(text=i).click()
            already.append(i)
            logger.info('等待8秒自动返回')
            time.sleep(8)
            if not d.xpath('//*[contains(@text, "_560x560q75")]').exists:
                logger.info('返回')
                d.press('back')
            else:
                logger.info('未进入商品，不返回')
            time.sleep(1)
            if not d(text='已浏览商品').exists:
                logger.info('已完成')
                return True
        d.swipe_ext('up')


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
    if not find_timeout_re(d, 'O1CN013Lp0e21GnX8El4YEd_!!6000000000667-1-tps-256-256', 30):
        logger.info('未检测到活动页，退出')
        exit(0)
    logger.info('活动已打开，开始任务')

    logger.info('首先关闭弹窗')
    if d(text='我的能量值').exists:
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
            if not do_10_item_task():
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
        close_popup()

import json
import logging
import math
import random
import re
import time

from hmdriver2._xpath import _XPath


# 模拟滑动
def human_swipe(d, x1, y1, x2, y2, base_speed=0.5, wave_range=30):
    # 计算滑动方向向量
    dx = x2 - x1
    dy = y2 - y1
    distance = math.hypot(dx, dy)

    # 随机分段（5~10段）
    num_steps = random.randint(5, 10)
    step_length = distance / num_steps

    # 生成波动轨迹
    points = [(x1, y1)]
    for i in range(1, num_steps):
        # 计算当前步的基准坐标
        progress = i / num_steps
        current_x = x1 + dx * progress
        current_y = y1 + dy * progress

        # 添加正弦波动（模拟手指抖动）
        wave = wave_range * math.sin(2 * math.pi * progress)
        angle = math.atan2(dy, dx) + math.pi / 2  # 垂直方向波动
        offset_x = int(wave * math.cos(angle))
        offset_y = int(wave * math.sin(angle))

        points.append((
            current_x + offset_x + random.randint(-5, 5),
            current_y + offset_y + random.randint(-5, 5)
        ))
    points.append((x2, y2))

    g = d.gesture
    g.start(x1, y1, interval=base_speed)

    # 执行分段滑动
    for i in range(1, len(points)):
        start_x, start_y = points[i]
        g.move(start_x, start_y)
        g.pause(interval=random.uniform(0, 0.1))

    g.action()


# 通过xpath超时寻找，找到返回true，找不到返回false
def find_timeout_xpath(d, xpath, timeout):
    flag = False
    for i in range(timeout):
        if not d.xpath(xpath).exists():
            time.sleep(0.8)
            continue
        flag = True
        break
    return flag


# 通过正则寻找，找到返回[result]，找不到返回[]
def find_timeout_re(d, reg, timeout):
    for i in range(timeout):
        t = d.dump_hierarchy()
        t = json.dumps(t, ensure_ascii=False)
        r = re.findall(reg, t)
        if not r and i != timeout:
            logger.debug('搜索 {} 次'.format(i + 1))
            time.sleep(0.8)
            continue
        return r
    return []


def open_taobao_search(d, text):
    logger.info('首先关闭淘宝App')
    d.stop_app('com.taobao.taobao4hmos')
    time.sleep(3)
    logger.info('打开淘宝App')
    d.start_app('com.taobao.taobao4hmos')
    logger.info('等待淘宝首页加载...')
    if not find_timeout_re(d, 'searchBg', 10):
        logger.info('未能检测到淘宝首页，退出')
        exit(0)
    d.xpath('//*[@id="searchBg"]/Stack[3]').click()
    logger.info('等待淘宝搜索页加载...')
    if not find_timeout_re(d, '搜索', 10):
        logger.info('未能检测到淘宝搜索页，退出')
        exit(0)
    logger.info('进入活动')
    d.input_text(text)
    d(text='搜索').click()


def open_jd_search(d, text):
    logger.info('首先关闭京东App')
    d.stop_app('com.jd.hm.mall')
    time.sleep(3)
    logger.info('打开京东App')
    d.start_app('com.jd.hm.mall')
    logger.info('等待京东首页加载...')
    if not find_timeout_re(d, '搜索', 10):
        logger.info('未能检测到京东首页，退出')
    d.xpath('//*[@text="搜索"]/../Row').click()
    logger.info('等待京东搜索页加载...')
    if not find_timeout_re(d, '搜索', 10):
        logger.info('未能检测到京东搜索页，退出')
    logger.info('进入活动')
    d.input_text(text)
    d(text='搜索').click()


def json2xml(hierarchy):
    return _XPath._json2xml(hierarchy)

def mute(d):
    for i in range(10):
        d.shell("uitest uiInput keyEvent 17")  # 点击音量减少

logging.basicConfig(format='%(asctime)s %(levelname)-8s [%(filename)-9s:%(lineno)-3d] %(message)s',
                    datefmt='%Y-%m-%d:%H:%M:%S')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

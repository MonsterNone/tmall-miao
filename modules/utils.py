import json
import logging
import math
import random
import re
import time


# 生成拟人波动轨迹点（公共逻辑）
def _generate_swipe_points(x1, y1, x2, y2, wave_range=30):
    dx = x2 - x1
    dy = y2 - y1
    num_steps = random.randint(5, 10)

    points = [(x1, y1)]
    for i in range(1, num_steps):
        progress = i / num_steps
        current_x = x1 + dx * progress
        current_y = y1 + dy * progress

        wave = wave_range * math.sin(2 * math.pi * progress)
        angle = math.atan2(dy, dx) + math.pi / 2
        offset_x = int(wave * math.cos(angle))
        offset_y = int(wave * math.sin(angle))

        points.append((
            current_x + offset_x + random.randint(-5, 5),
            current_y + offset_y + random.randint(-5, 5)
        ))
    points.append((x2, y2))
    return points


# 模拟滑动（仅hmdriver2支持gesture，uiautomator2使用swipe_points）
def human_swipe(d, x1, y1, x2, y2, base_speed=0.5, wave_range=30):
    points = _generate_swipe_points(x1, y1, x2, y2, wave_range)

    if d.device_type == 'hmdriver2':
        g = d.gesture
        g.start(x1, y1, interval=base_speed)

        for i in range(1, len(points)):
            start_x, start_y = points[i]
            g.move(start_x, start_y)
            g.pause(interval=random.uniform(0, 0.1))

        g.action()
    else:
        # uiautomator2: 使用swipe_points实现，坐标需为整数
        int_points = [(int(x), int(y)) for x, y in points]
        d.device.swipe_points(int_points, duration=0.3)


# 通过xpath超时寻找，找到返回true，找不到返回false
def find_timeout_xpath(d, xpath_str, timeout):
    flag = False
    for i in range(timeout):
        if not d.xpath_exists(xpath_str):
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


# 获取淘宝包名
def _get_taobao_pkg(d):
    if d.device_type == 'hmdriver2':
        return 'com.taobao.taobao4hmos'
    else:
        return 'com.taobao.taobao'


# 获取京东包名
def _get_jd_pkg(d):
    if d.device_type == 'hmdriver2':
        return 'com.jd.hm.mall'
    else:
        return 'com.jingdong.app.mall'


def open_taobao_search(d, text):
    pkg = _get_taobao_pkg(d)
    logger.info('首先关闭淘宝App')
    d.stop_app(pkg)
    time.sleep(3)
    logger.info('打开淘宝App')
    d.start_app(pkg)
    logger.info('等待淘宝首页加载...')

    # 检测首页并点击搜索入口
    if d.device_type == 'hmdriver2':
        if not find_timeout_re(d, 'searchBg', 10):
            raise RuntimeError('未能检测到淘宝首页')
        d.xpath('//*[@id="searchBg"]/Stack[3]').click()
    elif d.device_type == 'uiautomator2':
        # 安卓淘宝可能没有searchBg，尝试直接找搜索框
        if not d.xpath('//*[@content-desc="搜索栏"]').click_exists(timeout=10):
            raise RuntimeError('未能检测到淘宝首页')
    else:
        raise RuntimeError('未能检测到淘宝首页')

    logger.info('等待淘宝搜索页加载...')
    if not find_timeout_re(d, '"搜索"', 10):
        raise RuntimeError('未能检测到淘宝搜索页')
    logger.info('进入活动')
    if d.device_type == 'hmdriver2':
        d.input_text(text)
    elif d.device_type == 'uiautomator2':
        d(resourceId='com.taobao.taobao:id/searchEdit').set_text(text)

    d(text='搜索').click()


def open_jd_search(d, text):
    pkg = _get_jd_pkg(d)
    logger.info('首先关闭京东App')
    d.stop_app(pkg)
    time.sleep(3)
    logger.info('打开京东App')
    d.start_app(pkg)
    logger.info('等待京东首页加载...')
    if not find_timeout_re(d, '搜索', 10):
        raise RuntimeError('未能检测到京东首页')
    d.xpath('//*[@text="搜索"]/../Row').click()
    logger.info('等待京东搜索页加载...')
    if not find_timeout_re(d, '搜索', 10):
        logger.info('未能检测到京东搜索页，退出')
    logger.info('进入活动')
    d.input_text(text)
    d(text='搜索').click()


def json2xml(d, hierarchy):
    """将hierarchy转为XML字符串（用于xpath查找）"""
    return d.json2xml(hierarchy)


def mute(d):
    """静音"""
    d.mute()


logger = logging.getLogger(__name__)

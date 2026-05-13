"""
Android (uiautomator2) 适配版工具函数
与原 hmdriver2 版本的差异：
  - dump_hierarchy() 返回 XML 字符串而非 JSON，不再需要 json.dumps 和 json2xml
  - d(text='xx').exists 是属性而非方法
  - d.go_back() → d.press('back')
  - d.input_text() → d.send_keys()
  - d.start_app() / d.stop_app() → d.app_start() / d.app_stop()
  - d.display_size → d.window_size()
  - 手势 API 从 d.gesture 改为 d.touch
  - 包名使用 Android 版本
"""

import logging
import math
import random
import re
import time

from lxml import etree


# ======================== lxml XPath 工具（替代 uiautomator2 的简化 xpath） ========================
# uiautomator2 的 d.xpath() 不支持 parent::*, contains(), last() 等高级特性
# 以下函数用 lxml 在 dump_hierarchy() XML 上直接执行完整 XPath 查询

def xp_find(d, xpath):
    """用 lxml + XPath 查找元素，返回 lxml Element 列表"""
    xml = d.dump_hierarchy()
    root = etree.fromstring(xml.encode('utf-8'))
    return root.xpath(xpath)


def xp_exists(d, xpath):
    """用 lxml + XPath 检查元素是否存在"""
    return len(xp_find(d, xpath)) > 0


def xp_click(d, xpath):
    """用 lxml + XPath 定位并点击第一个匹配元素"""
    matches = xp_find(d, xpath)
    if not matches:
        return False
    elem = matches[0]
    bounds_str = elem.get('bounds', '')
    m = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds_str)
    if not m:
        return False
    x1, y1, x2, y2 = int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4))
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    d.click(cx, cy)
    return True


def xp_click_if_exists(d, xpath):
    """如果存在则点击"""
    if xp_exists(d, xpath):
        return xp_click(d, xpath)
    return False


def xp_get_text(d, xpath):
    """获取匹配元素的 text 属性"""
    matches = xp_find(d, xpath)
    if not matches:
        return None
    return matches[0].get('text', '')


# ======================== 手势操作 ========================

def human_swipe(d, x1, y1, x2, y2, base_speed=0.5, wave_range=30):
    """模拟人类滑动轨迹（uiautomator2 版本，使用 touch API）"""
    dx = x2 - x1
    dy = y2 - y1
    distance = math.hypot(dx, dy)

    num_steps = random.randint(5, 10)
    step_length = distance / num_steps

    # 生成波动轨迹
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

    # uiautomator2 touch API
    d.touch.down(x1, y1)
    for i in range(1, len(points)):
        px, py = points[i]
        d.touch.move(px, py)
        time.sleep(random.uniform(0.005, 0.015))
    d.touch.up(x2, y2)


# ======================== 元素查找 ========================

def find_timeout_xpath(d, xpath, timeout):
    """通过 xpath 超时寻找，找到返回 True，找不到返回 False（使用 lxml 完整 XPath）"""
    for i in range(timeout):
        if xp_exists(d, xpath):
            return True
        time.sleep(0.8)
    return False


def find_timeout_re(d, reg, timeout):
    """
    通过正则寻找，找到返回 [result]，找不到返回 []
    uiautomator2 的 dump_hierarchy() 返回 XML 字符串，直接正则匹配
    """
    for i in range(timeout):
        t = d.dump_hierarchy()  # Android 版返回 XML 字符串
        r = re.findall(reg, t)
        if r:
            return r
        if i < timeout - 1:
            logger.debug('搜索 {} 次'.format(i + 1))
            time.sleep(0.8)
    return []


# ======================== 应用操作 ========================

# Android 应用包名
TAOBAO_PACKAGE = 'com.taobao.taobao'
JD_PACKAGE = 'com.jingdong.app.mall'


def enter_taobao_coin(d):
    """通过淘宝首页「领淘金币」入口进入淘金币活动页（Android 版）"""
    logger.info('首先关闭淘宝App')
    d.app_stop(TAOBAO_PACKAGE)
    time.sleep(3)
    logger.info('打开淘宝App')
    d.app_start(TAOBAO_PACKAGE)
    logger.info('等待淘宝首页加载...')
    time.sleep(10)

    logger.info('寻找并点击「领淘金币」入口')
    # 用 lxml xpath 找 clickable 的领淘金币元素
    if xp_click(d, '//node[@content-desc="领淘金币" and @clickable="true"]'):
        logger.info('通过 content-desc 点击领淘金币')
    elif d(description='领淘金币').exists:
        d(description='领淘金币').click()
        logger.info('通过 selector 点击领淘金币')
    else:
        logger.info('未找到领淘金币入口，尝试搜索方式...')
        # fallback: 搜索
        open_taobao_search(d, '618赢20亿')
        return

    logger.info('等待活动页加载...')
    time.sleep(8)


def open_taobao_search(d, text):
    """打开淘宝并搜索进入活动（Android 版 fallback）"""
    logger.info('首先关闭淘宝App')
    d.app_stop(TAOBAO_PACKAGE)
    time.sleep(3)
    logger.info('打开淘宝App')
    d.app_start(TAOBAO_PACKAGE)
    logger.info('等待淘宝首页加载...')
    time.sleep(10)

    clicked = False
    if d(resourceId='com.taobao.taobao:id/search_bg_view').exists:
        d(resourceId='com.taobao.taobao:id/search_bg_view').click()
        clicked = True
        logger.info('通过 search_bg_view 点击搜索框')
    elif d(resourceId='com.taobao.taobao:id/search_bar_container').exists:
        d(resourceId='com.taobao.taobao:id/search_bar_container').click()
        clicked = True
        logger.info('通过 search_bar_container 点击搜索框')
    else:
        w, h = d.window_size()
        d.click(w // 2, 180)
        clicked = True
        logger.info('通过坐标点击搜索框')

    logger.info('等待淘宝搜索页加载...')
    time.sleep(3)

    logger.info('输入搜索关键词')
    d.send_keys(text)
    time.sleep(1)

    logger.info('点击搜索按钮')
    if d(description='搜索').exists:
        d(description='搜索').click()
    elif d(text='搜索').exists:
        d(text='搜索').click()
    else:
        d.press('enter')


def open_jd_search(d, text):
    """打开京东并搜索进入活动（Android 版）"""
    logger.info('首先关闭京东App')
    d.app_stop(JD_PACKAGE)
    time.sleep(3)
    logger.info('打开京东App')
    d.app_start(JD_PACKAGE)
    logger.info('等待京东首页加载...')
    time.sleep(8)

    # Android 京东搜索框定位（尝试多种方式）
    clicked = False
    if d.xpath('//*[contains(@content-desc, "搜索")]').exists:
        d.xpath('//*[contains(@content-desc, "搜索")]').click()
        clicked = True
        logger.info('通过 content-desc 点击搜索框')
    elif d(text='搜索').exists:
        d(text='搜索').click()
        clicked = True
        logger.info('通过 text 点击搜索框')
    elif d.xpath('//*[contains(@resource-id, "search")]').exists:
        d.xpath('//*[contains(@resource-id, "search")]').click()
        clicked = True
        logger.info('通过 resource-id 点击搜索框')

    if not clicked:
        logger.info('未能找到搜索框，请运行 diagnose.py 排查')
        exit(0)

    logger.info('等待京东搜索页加载...')
    if not find_timeout_re(d, '搜索', 10):
        logger.info('未能检测到京东搜索页，退出')
        exit(0)
    logger.info('进入活动')
    time.sleep(1)
    d.send_keys(text)
    time.sleep(0.5)
    d(text='搜索').click()


# ======================== 杂项 ========================

def mute(d):
    """关闭音量"""
    for i in range(10):
        d.press('volume_down')


# ======================== 日志 ========================

logging.basicConfig(
    format='%(asctime)s %(levelname)-8s [%(filename)-9s:%(lineno)-3d] %(message)s',
    datefmt='%Y-%m-%d:%H:%M:%S'
)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

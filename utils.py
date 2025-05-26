import math
import random
import time


# 模拟滑动
def human_swipe(d, x1, y1, x2, y2, base_speed=0.5, wave_range=30):
    """
    拟人化滑动（带随机波动和变速）

    :param d: uiautomator2 设备对象
    :param x1: 起点X坐标
    :param y1: 起点Y坐标
    :param x2: 终点X坐标
    :param y2: 终点Y坐标
    :param base_speed: 基础滑动速度（单位：秒，值越小越快）
    :param wave_range: 轨迹波动幅度（像素）
    """
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


# 超时寻找
def find_timeout(selector, timeout):
    flag = False
    for i in range(timeout * 2):
        if not selector.exists():
            time.sleep(0.3)
            continue
        flag = True
        break
    return flag

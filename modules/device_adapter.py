"""
设备适配器层 - 统一hmdriver2和uiautomator2的API

通过此适配器，业务代码无需关心底层驱动差异，
使用统一的API操作鸿蒙(HarmonyOS)和安卓(Android)设备。
"""
import logging
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)


class DeviceAdapter:
    """设备适配器，统一HarmonyOS和Android的UI自动化接口"""

    def __init__(self, device_type, serial=None):
        """
        初始化设备适配器

        Args:
            device_type: 'hmdriver2' 或 'uiautomator2'（必填）
            serial: 设备序列号或无线连接地址（如 '192.168.1.100:5555'）
        """
        self.device_type = device_type
        self.serial = serial
        self._device = None
        self._last_xml = None  # 缓存uiautomator2的原始XML，避免json2xml重复调用
        self._init_device()

    def _init_device(self):
        """初始化底层设备驱动"""
        if self.device_type == 'hmdriver2':
            import hmdriver2
            from hmdriver2.driver import Driver
            hmdriver2.driver.logger.disabled = False
            if self.serial:
                # 无线连接：先通过 hdc tconn 连接远程设备
                import subprocess
                logger.info(f'通过WiFi连接鸿蒙设备: {self.serial}')
                result = subprocess.run(
                    ['hdc', 'tconn', self.serial],
                    capture_output=True, text=True, timeout=10
                )
                if 'Connect OK' not in result.stdout and result.returncode != 0:
                    raise ConnectionError(
                        f'hdc tconn {self.serial} 失败: {result.stderr or result.stdout}\n'
                        f'请确保: 1. 先用USB执行 hdc tmode port 5555 开启TCP模式\n'
                        f'        2. 设备与电脑在同一局域网'
                    )
                logger.info(f'WiFi连接成功: {self.serial}')
            self._device = Driver()
        elif self.device_type == 'uiautomator2':
            import uiautomator2 as u2
            # 设置HTTP超时（模块级常量）
            u2.HTTP_TIMEOUT = 20
            if self.serial:
                # serial 可以是 IP:PORT（无线）或设备序列号（USB）
                logger.info(f'连接安卓设备: {self.serial}')
                self._device = u2.connect(self.serial)
            else:
                self._device = u2.connect()
            # 设置默认等待超时
            self._device.settings['wait_timeout'] = 3
            self._device.settings['operation_delay'] = (0.1, 0.1)
        else:
            raise ValueError(f"不支持的设备类型: {self.device_type}")

    @property
    def device(self):
        """获取底层设备对象"""
        return self._device

    def xpath(self, xpath_str):
        """XPath定位，返回兼容的选择器对象"""
        return self._device.xpath(xpath_str)

    def xpath_exists(self, xpath_str):
        """
        XPath判断元素是否存在（兼容hmdriver2和uiautomator2）

        hmdriver2: d.xpath('xxx').exists() 是方法调用
        uiautomator2: d.xpath('xxx').exists 是属性（bool值）
        """
        if self.device_type == 'hmdriver2':
            return self._device.xpath(xpath_str).exists()
        else:
            return self._device.xpath(xpath_str).exists

    def __call__(self, **kwargs):
        """选择器定位，支持 text, resourceId, className 等"""
        return self._device(**kwargs)

    def click_if_exists(self, **kwargs):
        """
        如果元素存在则点击（兼容hmdriver2和uiautomator2）

        hmdriver2的selector有click_if_exists()方法
        uiautomator2的selector没有，需先exists()再click()
        """
        if self.device_type == 'hmdriver2':
            self._device(**kwargs).click_if_exists()
        else:
            obj = self._device(**kwargs)
            if obj.exists():
                obj.click()

    def click(self, x, y):
        """点击坐标"""
        self._device.click(x, y)

    def swipe(self, x1, y1, x2, y2, duration=0.5):
        """滑动"""
        if self.device_type == 'hmdriver2':
            self._device.swipe(x1=x1, y1=y1, x2=x2, y2=y2)
        else:
            # uiautomator2: swipe(fx, fy, tx, ty, duration)
            self._device.swipe(x1, y1, x2, y2, duration=duration)

    def swipe_ext(self, direction, box=None):
        """方向滑动"""
        if box:
            self._device.swipe_ext(direction, box=box)
        else:
            self._device.swipe_ext(direction)

    def go_back(self):
        """返回"""
        if self.device_type == 'hmdriver2':
            self._device.go_back()
        else:
            self._device.press("back")

    def go_home(self):
        """回到主页"""
        if self.device_type == 'hmdriver2':
            self._device.go_home()
        else:
            self._device.press("home")

    def input_text(self, text):
        """输入文本"""
        if self.device_type == 'hmdriver2':
            self._device.input_text(text)
        else:
            self._device.send_keys(text)

    def clear_text(self):
        """清除文本"""
        if self.device_type == 'hmdriver2':
            self._device.input_text("")
        else:
            self._device.clear_text()

    def start_app(self, package_name, activity=None):
        """启动应用"""
        if self.device_type == 'hmdriver2':
            self._device.start_app(package_name)
        else:
            self._device.app_start(package_name, activity=activity)

    def stop_app(self, package_name):
        """停止应用"""
        if self.device_type == 'hmdriver2':
            self._device.stop_app(package_name)
        else:
            self._device.app_stop(package_name)

    def shell(self, cmd):
        """执行shell命令"""
        if self.device_type == 'hmdriver2':
            return self._device.shell(cmd)
        else:
            if isinstance(cmd, str):
                cmd = cmd.split()
            return self._device.shell(cmd)

    def dump_hierarchy(self):
        """
        获取UI层级结构，统一返回JSON dict

        hmdriver2 原生返回 JSON dict
        uiautomator2 返回 XML string，需转换为 JSON dict（属性名映射为兼容格式）
        """
        if self.device_type == 'hmdriver2':
            return self._device.dump_hierarchy()
        else:
            # uiautomator2 返回XML，缓存原始XML并转为兼容JSON
            self._last_xml = self._device.dump_hierarchy()
            return self._xml_to_json(self._last_xml)

    # XML属性名到hmdriver2 JSON key的映射
    _XML_ATTR_MAP = {
        'resource-id': 'id',
        'class': 'type',
        'content-desc': 'description',
        'long-clickable': 'longClickable',
        'scrollable': 'scrollable',
        'password': 'password',
    }

    def _xml_to_json(self, xml_str):
        """将uiautomator2的XML层级转为与hmdriver2兼容的JSON格式"""
        root = ET.fromstring(xml_str)
        return self._xml_element_to_dict(root)

    def _xml_element_to_dict(self, element):
        """递归将XML元素转为dict，属性名映射为hmdriver2兼容格式"""
        result = {}
        # 将XML属性映射为dict的key（兼容hmdriver2的JSON格式）
        for key, value in element.attrib.items():
            mapped_key = self._XML_ATTR_MAP.get(key, key)
            result[mapped_key] = value

        # 递归处理子元素
        children = list(element)
        if children:
            result['children'] = [self._xml_element_to_dict(child) for child in children]

        return result

    @property
    def display_size(self):
        """获取屏幕尺寸 (width, height)"""
        if self.device_type == 'hmdriver2':
            return self._device.display_size
        else:
            w, h = self._device.window_size()
            return (w, h)

    @property
    def gesture(self):
        """手势操作（仅hmdriver2支持）"""
        if self.device_type == 'hmdriver2':
            return self._device.gesture
        else:
            raise NotImplementedError("uiautomator2不支持gesture API，请使用swipe方法")

    def press(self, key):
        """按键"""
        if self.device_type == 'hmdriver2':
            if key == 'back':
                self._device.go_back()
            elif key == 'home':
                self._device.go_home()
            else:
                self._device.press_key(key)
        else:
            self._device.press(key)

    def mute(self):
        """静音：多次按音量减"""
        if self.device_type == 'hmdriver2':
            for _ in range(10):
                self._device.shell("uitest uiInput keyEvent 17")
        else:
            for _ in range(10):
                self._device.press("volume_down")

    def json2xml(self, hierarchy):
        """
        将hierarchy转为XML字符串（用于xpath查找）

        hmdriver2: 使用内置_XPath._json2xml
        uiautomator2: 使用缓存的原始XML，避免重复RPC调用
        """
        if self.device_type == 'hmdriver2':
            from hmdriver2._xpath import _XPath
            return _XPath._json2xml(hierarchy)
        else:
            # 优先使用缓存的XML，避免再次调用dump_hierarchy
            if self._last_xml is not None:
                return self._last_xml
            return self._device.dump_hierarchy()

    def __repr__(self):
        conn = f", serial={self.serial}" if self.serial else ""
        return f"DeviceAdapter(type={self.device_type}{conn})"


def create_device(device_type, serial=None):
    """工厂函数，创建设备适配器"""
    return DeviceAdapter(device_type, serial)

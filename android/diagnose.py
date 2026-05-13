"""
诊断脚本：抓取当前手机页面的控件树，用于适配 UI 选择器
运行方式：python diagnose.py
"""
import uiautomator2 as u2
import time
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def dump_and_save(d, filename):
    """dump 控件树并保存到文件"""
    xml = d.dump_hierarchy()
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(xml)
    print(f'[OK] 控件树已保存到: {path}')
    # 同时提取所有 text 和 resource-id，方便快速查看
    import re
    texts = set(re.findall(r'text="([^"]*)"', xml))
    ids = set(re.findall(r'resource-id="([^"]*)"', xml))
    descs = set(re.findall(r'content-desc="([^"]*)"', xml))
    print(f'  找到 {len(texts)} 个 text, {len(ids)} 个 resource-id, {len(descs)} 个 content-desc')
    print(f'  text 列表: {sorted([t for t in texts if t])[:30]}')
    print(f'  resource-id 含 search 的: {[i for i in sorted(ids) if "search" in i.lower()][:10]}')
    return xml

def main():
    print('连接设备...')
    d = u2.connect()
    print(f'设备信息: {d.info}')
    
    # 1. 先抓淘宝首页
    print('\n' + '='*60)
    print('请确保淘宝已关闭，等待脚本自动打开淘宝...')
    d.app_stop('com.taobao.taobao')
    time.sleep(2)
    d.app_start('com.taobao.taobao')
    print('等待淘宝首页加载 (10秒)...')
    time.sleep(10)
    dump_and_save(d, 'taobao_home.xml')
    
    # 2. 点击搜索框进入搜索页
    print('\n' + '='*60)
    print('尝试点击搜索框...')
    # 尝试多种方式定位搜索框
    clicked = False
    if d(description='搜索').exists:
        d(description='搜索').click()
        clicked = True
        print('通过 content-desc 点击搜索框')
    elif d(text='搜索').exists:
        d(text='搜索').click()
        clicked = True
        print('通过 text 点击搜索框')
    elif d.xpath('//*[contains(@content-desc, "搜索")]').exists:
        d.xpath('//*[contains(@content-desc, "搜索")]').click()
        clicked = True
        print('通过 xpath content-desc 点击搜索框')
    elif d.xpath('//*[contains(@text, "搜索")]').exists:
        d.xpath('//*[contains(@text, "搜索")]').click()
        clicked = True
        print('通过 xpath text 点击搜索框')
    else:
        print('未能自动定位搜索框，请手动点击搜索框，然后等待...')
    
    if clicked:
        time.sleep(3)
    
    print('等待搜索页加载 (5秒)...')
    time.sleep(5)
    dump_and_save(d, 'taobao_search.xml')
    
    print('\n' + '='*60)
    print('诊断完成！请将生成的 XML 文件发给我来分析。')
    print('生成的文件:')
    print(f'  {os.path.join(OUTPUT_DIR, "taobao_home.xml")}')
    print(f'  {os.path.join(OUTPUT_DIR, "taobao_search.xml")}')

if __name__ == '__main__':
    main()

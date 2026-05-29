# -*- mode: python ; coding: utf-8 -*-

import os

block_cipher = None

# hdc 路径（DevEco Studio 自带）
hdc_dir = r'E:\DevEco Studio\sdk\default\openharmony\toolchains'

# adb 路径（adbutils 自带）
adb_dir = os.path.join(os.path.dirname(os.path.abspath('.')),
                       'tmall-hmdriver', '.venv', 'Lib', 'site-packages', 'adbutils', 'binaries')
# 用绝对路径
adb_dir = os.path.join(os.getcwd(), '.venv', 'Lib', 'site-packages', 'adbutils', 'binaries')

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('version.json', '.'),
        # 打包 hdc 及其依赖到 tools/
        (os.path.join(hdc_dir, 'hdc.exe'), 'tools'),
        # 打包 adb 及其依赖到 tools/
        (os.path.join(adb_dir, 'adb.exe'), 'tools'),
        (os.path.join(adb_dir, 'AdbWinApi.dll'), 'tools'),
        (os.path.join(adb_dir, 'AdbWinUsbApi.dll'), 'tools'),
        # uiautomator2 运行时资源
        (os.path.join('.venv', 'Lib', 'site-packages', 'uiautomator2', 'assets'), os.path.join('uiautomator2', 'assets')),
        # hmdriver2 运行时资源
        (os.path.join('.venv', 'Lib', 'site-packages', 'hmdriver2', 'assets'), os.path.join('hmdriver2', 'assets')),
    ],
    hiddenimports=[
        'hmdriver2',
        'uiautomator2',
        'adbutils',
        'lxml',
        'lxml.etree',
        'lxml._elementpath',
        'requests',
        'urllib3',
        'certifi',
        'charset_normalizer',
        'idna',
        'PIL',
        'retry',
        'decorator',
        'logzero',
        'click',
        'pydantic',
        'simplejson',
        'construct',
        'tabulate',
        'colored',
        'colorama',
        'tornado',
        'tornado.ioloop',
        'tornado.web',
        'tornado.httpserver',
        'uvicorn',
        'starlette',
        'h11',
        'asgiref',
        'uiviewer',
        'simple_tornado',
        'cached_property',
        'wrapt',
        'deprecated',
        'six',
        'modules.device_adapter',
        'modules.taobao',
        'modules.energy',
        'modules.jd_hb',
        'modules.jd_push',
        'modules.utils',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='喵币助手',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

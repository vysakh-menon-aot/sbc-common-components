from setuptools import setup

'''
sbc-common-components
-----------------

This extension provides simple integration of SBC common components application.
'''


def read(filepath):
    """
    Read the contents from a file.
    :param str filepath: path to the file to be read
    :return: file contents
    :rtype: str
    """
    with open(filepath, 'r') as file_handle:
        content = file_handle.read()
    return content


version = open('VERSION').read()
setup(
    name='sbc-common-components',
    version=version,
    include_package_data=True,
    license=read('LICENSE'),
    long_description=read('README.md'),
    zip_safe=False,
    packages=['flask_opentracing', 'tests'],
    platforms='any',
    install_requires=['Flask-OpenTracing==1.0.0', 'opentracing>=2.0,<2.1'],
    dependency_links=[
        "git+https://github.com/pwei1018/jaeger-client-python.git@186f14e14758273ed108508c0d388a4f4de5c75b#egg=jaeger-client"
    ],
    extras_require={'tests': []},
)

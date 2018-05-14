# encoding: utf-8
"""
The default routes to redirect to the UI
"""
from . import default


@default.route('/')
@default.route('/calendar')
@default.route('/orders')
@default.route('/customers')
def home():
    """This default route wires the root folder to the UI served by Angular.
    Note that it will break the default flask restplus' documentation route."""
    return default.send_static_file('index.html')


@default.route('/orders/', defaults={'path':''})
@default.route('/orders/<path:path>')
@default.route('/customers/', defaults={'path': ''})
@default.route('/customers/<path:path>')
def homeWithPath(path):
    return default.send_static_file('index.html')

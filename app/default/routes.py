from . import default


@default.route('/')
@default.route('/calendar')
@default.route('/orders')
@default.route('/customers')
def home():
    '''This default route wires the root folder to the UI served by Angular.
    Note that it will break the default flask restplus' documentation route.'''
    return default.send_static_file('index.html')

@default.route('/test')    
def test():
    return "Hello, World!"
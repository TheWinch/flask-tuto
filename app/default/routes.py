from . import default

@default.route('/')
def home():
    '''This default route wires the root folder to the UI served by Angular.
    Note that it will break the default flask restplus' documentation route.'''
    return default.send_static_file('index.html')
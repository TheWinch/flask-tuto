import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')

class Config:
	SECRET_KEY = os.environ.get('SECRET_KEY')
	STATIC_FOLDER = os.path.join(os.pardir, 'static/dist')

class DevelopmentConfig(Config):
	DEBUG = True
	SECRET_KEY = os.environ.get('SECRET_KEY') or 'secret_key_here'
	SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
		'sqlite:///' + os.path.join(basedir, 'data-dev.sqlite')

class TestingConfig (Config):
	TESTING = True
	SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
		'sqlite:///' + os.path.join(basedir, 'data-test.sqlite')

class ProductionConfig(Config):
	SQLALCHEMY_DATABASE_URI = os.environ.get('PRODUCTION_DATABASE_URL') or \
		'sqlite:///' + os.path.join(basedir, 'data.sqlite')

config = {
	'development': DevelopmentConfig,
	'testing':	TestingConfig,
	'production': ProductionConfig,
	'default': DevelopmentConfig
}
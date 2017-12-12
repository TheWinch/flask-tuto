#!flask/bin/python
import os
from app import create_app, db

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
with app.app_context():
    db.init_app(app)
app.run(debug=True)
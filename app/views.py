from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
    """Displays the root page of the application"""
    user = {'nickname': 'Vincent'}  # fake user
    return render_template('index.html',
                           title='Home',
                           user=user)

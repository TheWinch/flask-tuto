# flask-tuto

This project reflects my trials with the Flask Mega-Tutorial by Miguel Grinberg. Full text of the tutorial can be found at
https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world.

## How to use

* activate the venv if you are on Windows:
  `flask\Scripts\activate`
* export `FLASK_APP="app.factory:create_app()"`
* initialize the database with this command (install also the default data set):

  `python db.py create
   python db.py migrate
   python db.py populate`
   
* run the server
  `python -m flask run`
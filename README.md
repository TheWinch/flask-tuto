# OSC Manager

## Description
A minimal, free sport lessons shop manager. The aim is to manage the basic activity of a sport shop (such as a ski school
or a surf school), by providing an integrated solution to manage customers, lesson slots and orders.

The project is for the moment written in French and completely bond to the surf shop model. Extensions will gradually
follow.

## Features
OSC Manager supports at present the following features:
* Create your timeslots for lessons by visually drawing them on a calendar
* Manage your customers
* Take orders

## How to run the development version

### Technologies ###
* The back-end is an API served by Flask-restplus.
* The front-end is an Angular 5 + Bootstrap 4 project. It is generated into the `app/static/dist`

### Preparing the development environment ###
Prepare the Python development environment for the back-end:
* Install [Python 3](https://www.python.org/downloads/)
* Create and activate a venv where you checked out the code
  * On Windows:
  ```batch
  $ python -m venv flask
  $ .\flask\Scripts\activate
  (flask) $ _
  ```
  * On Linux / MacOS:
  ```bash
  $ python3 -m venv flask
  $ source ./flask/bin/activate
  (flask) $ _
  ```
* Install the necessary Python dependencies:
  ```bash
  $ pip install -r requirements.txt
  ```

Prepare the Angular development environment:
* Install [NodeJS](https://nodejs.org/)
* Install [Angular CLI](https://angular.io/guide/quickstart)
* Install all needed dependencies:
  ```bash
  $ cd front
  $ npm install
  ```

### Running everything from the Flask server ###
In this mode, we will generate the Angular 5 UI into `app/static/dist` and serve it from the Flask server:
  ```bash
  $ cd front
  $ ng build --prod --aot
  ```
Then run the flask server (use `set` instead of `export` if you are on Windows):
  ```bash
  $ cd <root directory>
  $ export FLASK_APP=run.py
  $ flask run 
    * Serving Flask app "run"                                 
    * Forcing debug mode on                                   
    * Restarting with stat                                    
    * Debugger is active!                                     
    * Debugger PIN: 822-718-223                               
    * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit) 
  ```

> :warning:: The *first time you run*, you will need to generate a development database before running:
>   ```bash
>   $ cd <root directory>
>   $ export FLASK_APP=run.py
>   $ flask db init
>   $ flask db update
>   $ flask populate_samples # if you want the sample data
>   ```

Visit then the website at http://127.0.0.1:5000/ to use the application.

### Running the Angular UI alone ###
This is standard Angular workflow. Go to the `front` folder and use angular as usual:
```bash
$ cd front
$ ng serve --aot
```

## Packaging as a single executable

https://elc.github.io/posts/executable-flask-pyinstaller/: how to package flask
https://github.com/cdrx/docker-pyinstaller/blob/master/README.md: how to use pyinstaller from Docker
https://pyinstaller.readthedocs.io/en/v3.3.1/operating-mode.html: pyinstaller manual 

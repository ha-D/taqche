from flask import Flask
from flask_cors import CORS

from .db import init_db, set_db
from . import settings

def create_app(settings=settings, db=None):
    app = Flask(__name__)
    CORS(app)
    
    if db:
        set_db(db)
    else:
        app.config['MONGO_URI'] = f'mongodb://{settings.DATABASE["host"]}:{settings.DATABASE["port"]}/{settings.DATABASE["name"]}'
        init_db(app)

    from . import routes
    app.register_blueprint(routes.bp)

    return app
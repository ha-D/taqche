from flask_pymongo import PyMongo

db = None


def init_db(app):
    global db
    mongo = PyMongo(app)
    db = mongo.db


def set_db(new_db):
    global db
    db = new_db


def get_db():
    return db


__all__ = ('init_db', 'get_db')
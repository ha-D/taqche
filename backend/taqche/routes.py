from flask import Flask, request, Blueprint
from marshmallow import EXCLUDE
from marshmallow.exceptions import ValidationError
from pymongo import ReturnDocument
from datetime import datetime
import pytz
import string
import random

from .schema import MarkSchema, MarkCreateSchema, MarkUpdateSchema, MarkAddTagSchema, MarkAddLabelSchema, MarkListQuerySchema
from .db import get_db
from . import settings

MARK_ID_SPACE = string.ascii_lowercase + string.digits

bp = Blueprint('main', __name__, url_prefix='/')

bp.register_error_handler(ValidationError, lambda e: (e.messages, 400))


class DB:
    def __getattribute__(self, key):
        return getattr(get_db(), key)
db = DB()

@bp.route('/marks/', methods=['POST'])
def create_mark():
    data = MarkCreateSchema().load(request.json or {})
    data['id'] = ''.join(random.choices(MARK_ID_SPACE, k=5))
    data['created_at'] = datetime.now(pytz.timezone(settings.TIMEZONE))
    db.marks.insert_one(data)
    return MarkSchema().dump(data), 201


@bp.route('/mark/<mark_id>/', methods=['POST'])
def update_mark(mark_id):
    data = MarkUpdateSchema().load(request.json or {})
    mark = db.marks.find_one_and_update(
        {'id': mark_id}, 
        {'$set': data}, 
        return_document=ReturnDocument.AFTER
    )
    return MarkSchema().dump(mark)


@bp.route('/mark/<mark_id>/tag/<action>', methods=['POST'])
def add_or_remove_tag(mark_id, action):
    if action not in ['add', 'delete']:
        return 'Invalid action', 404
    tag = MarkAddTagSchema().load(request.json or {})['tag']
    mark = db.marks.find_one_and_update(
        {'id': mark_id},
        {('$push' if action == 'add' else '$pull'): {'tags': tag}},
        return_document=ReturnDocument.AFTER
    )
    return MarkSchema().dump(mark)


@bp.route('/mark/<mark_id>/label/<action>', methods=['POST'])
def add_or_remove_label(mark_id, action):
    if action not in ['add', 'delete']:
        return 'Invalid action', 404
    label = MarkAddLabelSchema().load(request.json or {})['label']
    mark = db.marks.find_one_and_update(
        {'id': mark_id},
        {('$push' if action == 'add' else '$pull'): {'labels': label}},
        return_document=ReturnDocument.AFTER
    )
    return MarkSchema().dump(mark)


@bp.route('/marks/', methods=['GET'])
def get_marks():
    query_schema = MarkListQuerySchema()
    query = query_schema.load(request.args)
    marks = db.marks.find(query_schema.dump(query))
    return {
        'count': marks.count(),
        'results': MarkSchema(many=True, unknown=EXCLUDE).dump(marks)
    }

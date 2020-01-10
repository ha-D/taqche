from marshmallow import Schema, fields, EXCLUDE, pre_load
from datetime import datetime


class MarkSchema(Schema):
    id = fields.Str()
    platform = fields.Str(required=True)
    source_id = fields.Str(required=True)
    title = fields.Str(required=True)
    channel = fields.Str(default=None)
    start = fields.Int(default=None)
    end = fields.Int(default=None)
    tags = fields.List(fields.Str(), default=[])
    labels = fields.List(fields.Str(), default=[])
    created_at = fields.DateTime(format='iso')

    @pre_load
    def fix_datetime(self, data, *args, **kwargs):
        if 'created_at' in data and type(data['created_at']) is not str:
            data['created_at'] = data['created_at'].isoformat()
        return data


class MarkCreateSchema(MarkSchema):
    class Meta:
        exclude = ('id', 'created_at')


class MarkUpdateSchema(MarkSchema):
    platform = fields.Str()
    source_id = fields.Str()
    title = fields.Str()

    class Meta:
        exclude = ('id', 'created_at')


class MarkAddTagSchema(Schema):
    tag = fields.Str(required=True)


class MarkAddLabelSchema(Schema):
    label = fields.Str(required=True)


class MarkListQuerySchema(Schema):
    platform = fields.Str()
    source_id = fields.Str()

    class Meta:
        uknown = EXCLUDE
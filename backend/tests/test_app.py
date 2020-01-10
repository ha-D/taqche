import pytest
import mongomock
from copy import deepcopy

from taqche import create_app, settings

@pytest.fixture
def app():
    mongo = mongomock.MongoClient()
    app = create_app({}, db=mongo.db)
    app.db = mongo.db
    
    return app

@pytest.fixture
def client(app):
    client = app.test_client()
    client.db = app.db
    return client


sample_request = {
    'platform': 'youtube',
    'source_id': 'yudvsa',
    'channel': 'WSH',
    'tags': ['tag1', 'tag2'],
    'labels': ['label1', 'label2']
}


def test_create_mark(client):
    resp = client.post('/marks/', json=sample_request)
    assert resp.status_code == 201
    assert resp.json['id']
    assert resp.json['created_at']

    mark = client.db.marks.find_one({'id': resp.json['id']})
    assert mark is not None
    assert all(sample_request[k] == mark[k] for k in sample_request)


def test_create_platform_required(client):
    data = {k: sample_request[k] for k in sample_request if k != 'platform'}
    resp = client.post('/marks/', json=data)
    assert resp.status_code == 400


def test_create_source_id_required(client):
    data = {k: sample_request[k] for k in sample_request if k != 'source_id'}
    resp = client.post('/marks/', json=data)
    assert resp.status_code == 400


def test_create_optional_fields(client):
    data = {k: sample_request[k] for k in sample_request if k == 'source_id' or k == 'platform'}
    resp = client.post('/marks/', json=data)
    assert resp.status_code == 201


def test_update_mark(client):
    data = deepcopy(sample_request)
    data['id'] = 'mark1'
    client.db.marks.insert_one(deepcopy(data))

    new_data = deepcopy(data)
    new_data['channel'] = 'PBS'
    new_data['tags'] = ['gat1', 'gat2']
    del new_data['id']
    resp = client.post('/mark/mark1/', json=new_data)
    assert resp.status_code == 200

    mark = client.db.marks.find_one({'id': 'mark1'})
    assert mark
    assert all(new_data[k] == mark[k] for k in new_data)


def test_add_tag(client):
    data = deepcopy(sample_request)
    data['id'] = 'mark1'
    client.db.marks.insert_one(deepcopy(data))

    resp = client.post('/mark/mark1/tag', json={'tag': 'tag3'})
    assert resp.status_code == 200

    new_data = deepcopy(data)
    new_data['tags'].append('tag3')
    mark = client.db.marks.find_one({'id': 'mark1'})
    assert all(new_data[k] == mark[k] for k in new_data)


def test_add_label(client):
    data = deepcopy(sample_request)
    data['id'] = 'mark1'
    client.db.marks.insert_one(deepcopy(data))

    resp = client.post('/mark/mark1/label', json={'label': 'label3'})
    assert resp.status_code == 200

    new_data = deepcopy(data)
    new_data['labels'].append('label3')
    mark = client.db.marks.find_one({'id': 'mark1'})
    assert all(new_data[k] == mark[k] for k in new_data)


def test_delete_tag(client):
    data = deepcopy(sample_request)
    data['id'] = 'mark1'
    client.db.marks.insert_one(deepcopy(data))

    resp = client.delete('/mark/mark1/tag', json={'tag': 'tag2'})
    assert resp.status_code == 200

    new_data = deepcopy(data)
    new_data['tags'].pop()
    mark = client.db.marks.find_one({'id': 'mark1'})
    assert all(new_data[k] == mark[k] for k in new_data)


def test_delete_label(client):
    data = deepcopy(sample_request)
    data['id'] = 'mark1'
    client.db.marks.insert_one(deepcopy(data))

    resp = client.delete('/mark/mark1/label', json={'label': 'label2'})
    assert resp.status_code == 200

    new_data = deepcopy(data)
    new_data['labels'].pop()
    mark = client.db.marks.find_one({'id': 'mark1'})
    assert all(new_data[k] == mark[k] for k in new_data)


def test_get_marks(client):
    data1 = deepcopy(sample_request)
    data2 = deepcopy(sample_request)
    data2['source_id'] = 'fdfafd'
    data2['tags'] = []

    client.db.marks.insert_one(deepcopy(data1))
    client.db.marks.insert_one(deepcopy(data2))

    resp = client.get('/marks/').json

    assert resp['count'] == 2
    assert len(resp['results']) == 2
    assert all(data1[k] == resp['results'][0][k] for k in data1)
    assert all(data2[k] == resp['results'][1][k] for k in data2)

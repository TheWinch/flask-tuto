import unittest

from flask import json

from app import factory, db


class FlaskTestCase():
    """A base class that encapsulates setting up the application and test database"""
    def setup(self):
        self.osc = factory.create_app('testing')
        self.osc.config['WTF_CSRF_ENABLED'] = False
        self.osc.testing = True
        self.osc.config['DEBUG'] = True
        self.osc.app_context().push()
        self.app = self.osc.test_client(self)
        db.drop_all()
        db.create_all()

        assert self.osc.debug is True

    def teardown(self):
        try:
            db.session.rollback()
        except Exception:
            pass


class BasicAPITester:
    """Basic CRUD tests Mixin for REST API test. This is designed to be added to a :class:`FlaskTestCase` instance.

    This mixin requires an `api_endpoint` object that gives the base endpoint of the api, an `item_cls` object that gives
    the persistence class of the items under test, and the dictionaries `reference_item`, `alternate_item` and
    `json_to_db` to provide data to the test.
    """

    def test_can_get_empty_list(self):
        response = self.app.get(self.api_endpoint)

        assert response.status_code == 200, 'Should receive 200 OK while getting an empty collection'
        assert response.data == b'[]\n', 'Should receive an empty JSON array when getting empty collection'
        assert response.mimetype == 'application/json'

    def create_in_db(self, model):
        item = self.item_cls(**model)
        item.create()
        return item

    def test_can_list_items(self):
        item = self.create_in_db(self.reference_item)

        response = self.app.get(self.api_endpoint)

        assert response.status_code == 200
        assert response.mimetype == 'application/json'
        assert json.loads(response.data) == [self.enrich_with_id(self._to_api(self.reference_item), item.id)]

    def test_can_create_then_read_back_item(self):
        items = self.item_cls.load_all()
        assert len(items) == 0
        d = self._to_api(self.alternate_item)

        response = self.app.post(self.api_endpoint, data=json.dumps(d), content_type='application/json')

        assert response.status_code == 201, 'Should receive 201 CREATED after a successful POST to collection'

        items = self.item_cls.load_all()
        assert 1 == len(items), 'Item should have been created in database'
        assert 'http://localhost'+self.api_endpoint+str(items[0].id) == response.headers['Location'], 'Response headers should link to the created item\'s URI'

        returned_item = json.loads(response.data)
        assert self.enrich_with_id(d, items[0].id) == returned_item, 'Should receive the create resource in the response'

    def test_cannot_create_same_item_twice(self):
        """Verifies that items with unique keys cannot be created twice"""
        self.create_in_db(self.reference_item)
        d = self._to_api(self.reference_item)

        response = self.app.post(self.api_endpoint, data=json.dumps(d), content_type='application/json')

        assert response.status_code == 409, 'Should return 409 Conflict when an identical resource already exists'

    def test_can_query_individual_item(self):
        item = self.create_in_db(self.reference_item)

        response = self.app.get(self.api_endpoint + str(item.id))

        assert response.status_code == 200, 'Should receive 200 OK while getting an existing item'
        assert response.mimetype == 'application/json'
        assert json.loads(response.data) == self.enrich_with_id(self._to_api(self.reference_item), item.id), 'Should receive a JSON object matching the DB content'

    def test_receives_404_if_item_unknown(self):
        response = self.app.get(self.api_endpoint + '666')

        assert response.status_code == 404, 'Should receive 200 OK while getting a missing item'

    def test_can_delete_an_existing_item(self):
        item = self.create_in_db(self.reference_item)
        items = self.item_cls.load_all()
        assert len(items) == 1

        response = self.app.delete(self.api_endpoint + str(item.id))

        assert response.status_code == 204, 'Should receive 204 DELETED while deleting an existing item'
        assert response.data == b'', 'Response should contain no data'

        customers = self.item_cls.load_all()
        assert 0 == len(customers), 'Item should have been deleted from DB'

    def test_receives_404_when_deleting_missing_item(self):
        self.create_in_db(self.reference_item)

        response = self.app.delete(self.api_endpoint + '666')

        assert response.status_code == 404, 'Should receive a 404 NOT FOUND when deleting a missing item'
        assert response.data.strip() == b'""', 'Response should contain no data'

        customers = self.item_cls.load_all()
        assert 1 == len(customers), 'Nothing should have been deleted from DB'

    def enrich_with_id(self, data, id_):
        id_definition = dict(id=id_, uri=self.api_endpoint + str(id_))
        return {**data, **id_definition}

    def _to_api(self, db_model):
        result = {}
        for key_json, field in self.json_to_db.items():
            if not key_json in ['id', 'uri']:
                thefield = field() if isinstance(field, type) else field
                result[key_json] = thefield.format(thefield.output(key=key_json, obj=db_model))
        return result


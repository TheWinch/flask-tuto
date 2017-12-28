import unittest

from flask import json

from apis.customer_api import customer_model
from app.models import Customer
from app.tests.base import FlaskTestCase, BasicAPITester


class CustomerApiTest(FlaskTestCase, BasicAPITester):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_endpoint = '/api/customers/'
        self.item_cls = Customer
        self.reference_item = dict(firstname='Vincent', lastname='Girard-Reydet', email='vgr@test.com', phone='0102030405')
        self.alternate_item = dict(firstname='Toto', lastname='Bozo', email='toto@bozo.com', phone='0123456789')
        self.json_to_db = customer_model

    def test_can_filter_customers_by_name(self):
        reference = self.create_in_db(self.reference_item)
        self.create_in_db(self.alternate_item)

        response = self.app.get(self.api_endpoint + '?name=Girard')
        self.assertEqual(response.status_code, 200, 'Should be able to filter by valid part of last name')
        self.assertListEqual(json.loads(response.data),
                             [self.enrich_with_id(self._to_api(self.reference_item), reference.id)],
                             'Should receive a JSON array with a unique element matching the DB content')

    def test_can_pass_non_matching_filter(self):
        self.create_in_db(self.reference_item)
        self.create_in_db(self.alternate_item)

        response = self.app.get(self.api_endpoint + '?name=invalid_part')
        self.assertEqual(response.status_code, 200, 'Should be able to filter by invalid part of last name')
        self.assertListEqual(json.loads(response.data), [])

    def test_conversion(self):
        for key, field in customer_model.items():
            if not key in ['id', 'uri']:
                thefield = field() if isinstance(field, type) else field
                print(key + ' => ' + str(thefield.format(thefield.output(key=key, obj=self.reference_item))))

if __name__ == "__main__":
    unittest.main()

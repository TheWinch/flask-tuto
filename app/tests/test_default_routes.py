import unittest

from app.tests.base import FlaskTestCase


class DefaultRoutesTest(FlaskTestCase):
    def test_can_get_root_documentation(self):
        response = self.app.get('/api/doc', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

    def test_index(self):
        """This will fail if you didn't generate the front end with 'cd front && ng build' beforehand"""
        response = self.app.get('/', content_type='html/text')
        self.assertEqual(response.status_code, 200)

    def test_calendar_redirect(self):
        """This will fail if you didn't generate the front end with 'cd front && ng build' beforehand"""
        response = self.app.get('/calendar', content_type='html/text')
        self.assertEqual(response.status_code, 200)

    def test_orders_redirect(self):
        """This will fail if you didn't generate the front end with 'cd front && ng build' beforehand"""
        response = self.app.get('/orders', content_type='html/text')
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()
from datetime import datetime

from app.apis.timeslot_api import timeslot_model
from app.models import TimeSlot
from tests.base import FlaskTestCase, BasicAPITester


class TimeSlotApiTest(FlaskTestCase, BasicAPITester):
    def setup(self, *args, **kwargs):
        FlaskTestCase.setup(self)
        self.api_endpoint = '/api/timeslots/'
        self.item_cls = TimeSlot
        self.reference_item = dict(start=datetime(2017,11,1,12,5,3), duration=7200, trainers='Germain,JP', capacity=8,
                                    free_capacity=8)
        self.alternate_item = dict(start=datetime(2017,12,1,12,5,3), duration=7200, trainers='Germain,JP', capacity=8,
                                    free_capacity=8)
        self.json_to_db = timeslot_model

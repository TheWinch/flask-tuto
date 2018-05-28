import * as moment from 'moment';

export class Event {
  id: number;
  title?: string;
  start: moment.Moment;
  end?: moment.Moment;
  capacity?: number;
  used?: number;
}

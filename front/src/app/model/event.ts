
export class Event {
  id: number;
  title?: string;
  start: string | Date;
  end?: string | Date;
  capacity?: number;
  used?: number;
}

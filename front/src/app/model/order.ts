export class Appointment {
  id?: number;
  customerId: number;
  orderId?: number;
  slotId: number;
  start?: string;
}

export class Order {
  id?: number;
  title: string;
  contact?: string;
  contactId?: number;
  appointments?: Appointment[];
}


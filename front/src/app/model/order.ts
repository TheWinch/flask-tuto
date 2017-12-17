export class ProtoAppointment {
  customerId: number;
  timeSlotId: number;
}

export class Appointment extends ProtoAppointment {
  id: number;
  orderId: number;
}

export class ProtoOrder {
  payerId: number;
  appointments: ProtoAppointment[];
}

export class Order extends ProtoOrder {
  id: number;
}

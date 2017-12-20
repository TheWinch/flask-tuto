import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class Appointment {
    id?: number;
    customerId: number;
    orderId: number;
    slotId: number;
    start?: string | Date;
}

export abstract class AppointmentService {
    abstract getAppointments(): Observable<Appointment[]>;
    abstract getAppointmentsByCustomer(start: Date, end: Date, customerId: number): Observable<Appointment[]>;
    abstract createAppointments(model: Appointment[]): Observable<Appointment[]>;
}

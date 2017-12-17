export class ProtoTimeSlot {
    start: Date;
    duration: number;
    notes: string;
}
export class TimeSlot extends ProtoTimeSlot {
    id: number;
}

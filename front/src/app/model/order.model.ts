import { Customer } from './customer';
import { CustomerSelection, EventChoice } from './customer-choices';
import { Event } from './event';
import { Order, Appointment } from './order';
import { DatePipe } from '@angular/common';
import { ImmutableArrays } from './immutable-arrays';

export class CustomerSelectionResult {
    unselectedEventIds: number[];
    selectedEventIds: number[];
}

export enum EventFlipResult {
    SELECT,
    UNSELECT,
    NONE
}

export class OrderModel {
    private _orderId: number = null;
    private _contactId: number = null;
    private _currentCustomer: Customer = null;
    private _selections: CustomerSelection[] = [];

    private eventsForCustomer(customer: Customer): EventChoice[] {
        if (customer == null) {
            return [];
        }
        return this._selections
            .find(selection => selection.customer.id === customer.id)
            .choices;
    }

    constructor(order: Order, customers: Customer[]) {
        let appointments;
        if (order == null) {
            this._orderId = null;
            this._contactId = null;
            appointments = [];
        } else {
            this._orderId = order.id;
            this._contactId = order.contactId;
            appointments = order.appointments;
        }
        this._selections = customers.map(customer => new CustomerSelection(
            customer,
            appointments
                .filter(appointment => appointment.customerId === customer.id)
                // TODO - use event's start date instead
                .map(appointment => new EventChoice(appointment.slotId, new Date(appointment.start)))
        ));
    }

    get selections(): CustomerSelection[] {
        return this._selections;
    }

    get currentCustomer(): Customer {
        return this._currentCustomer;
    }

    get currentCustomerEvents(): EventChoice[] {
        return this.eventsForCustomer(this._currentCustomer);
    }

    buildOrder(): Order {
        const self = this;
        const selectionToAppointments = function (appointments: Appointment[], selection: CustomerSelection): Appointment[] {
            const mapped: Appointment[] = selection.choices.map(choice => {
                return {
                    customerId: selection.customer.id,
                    slotId: choice.id,
                    orderId: self._orderId
                };
            }, this);
            appointments.push(...mapped);
            return appointments;
        };

        return {
            id: this._orderId,
            title: new DatePipe('fr').transform(new Date(), 'full'),
            contactId: this._contactId,
            appointments: this._selections.reduce(selectionToAppointments.bind(this), [])
        };
    }

    /**
     * Sets the active customer for order edition, and returns the events that need updates.
     */
    setCurrentCustomer(nextCustomer: Customer): CustomerSelectionResult {
        const unselectedEventIds = this.eventsForCustomer(this._currentCustomer).map(choice => choice.id);
        const selectedEventIds = this.eventsForCustomer(nextCustomer).map(choice => choice.id);
        this._currentCustomer = nextCustomer;

        return {
            unselectedEventIds: unselectedEventIds,
            selectedEventIds: selectedEventIds
        };
    }

    /**
     * Add a new customer to this order. The customer is NOT selected.
     */
    addCustomer(customer: Customer) {
        if (this.containsCustomer(customer)) {
            return;
        }
        this._selections = ImmutableArrays.append(this._selections, new CustomerSelection(customer, []));
        if (this._contactId == null) {
            this._contactId = customer.id;
        }
    }

    containsCustomer(customer: Customer): boolean {
        return this._selections.some(selection => selection.customer.id === customer.id);
    }

    containsEvent(id: number): boolean {
        return this._selections.some(selection => selection.containsEvent(id));
    }

    isNewOrder(): boolean {
        return this._orderId == null;
    }

    /**
     * Update the selection status of an event for the currently selected customer.
     */
    flipEvent(event: Event): EventFlipResult {
        if (this._currentCustomer == null) {
            return EventFlipResult.NONE;
        }

        const oldSelection: CustomerSelection = this._selections.find(ca => ca.customer.id === this._currentCustomer.id);
        let newSelection: CustomerSelection = null;
        const hadChosenEvent = oldSelection.containsEvent(event.id);
        if (hadChosenEvent) {
            newSelection = oldSelection.removeEvent(event);
            this._selections = ImmutableArrays.replaceElement(this._selections, oldSelection, newSelection);
            return EventFlipResult.UNSELECT;
        } else if (event.capacity > 0) {
            newSelection = oldSelection.addEvent(event);
            this._selections = ImmutableArrays.replaceElement(this._selections, oldSelection, newSelection);
            return EventFlipResult.SELECT;
        } else {
            return EventFlipResult.NONE;
        }
    }
}

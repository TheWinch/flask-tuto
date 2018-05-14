import { Customer } from './customer';
import { ImmutableArrays } from './immutable-arrays';

/**
 * A single choice of date by a customer.
 */
export class EventChoice {
  start: string | Date;
  id: number;

  constructor(id: number, start: string | Date) {
    this.start = start;
    this.id = id;
  }
}

/**
 * The choices a customer has made for an order
 */
export class CustomerSelection {
  readonly customer: Customer;
  private _choices: EventChoice[];

  /**
   * Choices sorted by ascending date.
   */
  get sorted_choices(): EventChoice[] {
    return this._choices.sort((a, b) => a.start < b.start ? -1 : 1);
  }

  get choices(): EventChoice[] {
    return this._choices;
  }

  containsEvent(id: number): boolean {
    return this._choices.some(choice => choice.id === id);
  }

  addEvent(event: EventChoice): CustomerSelection {
    if (this.containsEvent(event.id)) {
      return this;
    }
    const newChoices = ImmutableArrays.append(this._choices, {start: event.start, id: event.id});
    return new CustomerSelection(this.customer, newChoices);
  }

  removeEvent(event: EventChoice): CustomerSelection {
    const choices = ImmutableArrays.removeMatching(this._choices, choice => choice.id === event.id);
    return new CustomerSelection(this.customer, choices);
  }

  constructor(customer: Customer, choices: EventChoice[]) {
      this.customer = customer;
      this._choices = choices;
  }
}

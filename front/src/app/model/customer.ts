/**
 * The prototype of a Customer, used for creating.
 */
export class ProtoCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
/**
 * A complete customer.
 */
export class Customer extends ProtoCustomer {
  id: number;
}

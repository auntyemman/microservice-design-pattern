import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderConfirmedEvent,
} from '../interfaces';

export class OrderCreated {
  constructor(public readonly data: OrderCreatedEvent) {}
}

export class OrderUpdated {
  constructor(public readonly data: OrderUpdatedEvent) {}
}

export class OrderConfirmed {
  constructor(public readonly data: OrderConfirmedEvent) {}
}

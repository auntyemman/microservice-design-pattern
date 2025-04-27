import { UserCreatedEvent, UserUpdatedEvent } from '../interfaces';

export class UserCreated {
  constructor(public readonly data: UserCreatedEvent) {}
}

export class UserUpdated {
  constructor(public readonly data: UserUpdatedEvent) {}
}

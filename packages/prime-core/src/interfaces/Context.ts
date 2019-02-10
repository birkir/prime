import { User } from '@accounts/typeorm';
import { Ability } from '@casl/ability';
import { ContainerInstance } from 'typedi';

export interface Context {
  requestId: number;
  user: User;
  container: ContainerInstance;
  ability: Ability;
}

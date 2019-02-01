import { User } from '@accounts/typeorm';
import { ContainerInstance } from 'typedi';

export interface Context {
  requestId: number;
  user: User;
  container: ContainerInstance;
}

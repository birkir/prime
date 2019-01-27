import { Connection } from 'typeorm';

export interface ServerConfig {
  port: number;
  connection: Connection;
}

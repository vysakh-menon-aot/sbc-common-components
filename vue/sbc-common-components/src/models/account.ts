import { Member } from './member';

export interface Account {
  id: number
  name: string
}

export interface Accounts {
  orgs: Account[]
}

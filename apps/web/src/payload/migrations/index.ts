import * as migration_20260528_174955_initial from './20260528_174955_initial';

export const migrations = [
  {
    up: migration_20260528_174955_initial.up,
    down: migration_20260528_174955_initial.down,
    name: '20260528_174955_initial'
  },
];

import * as migration_20260528_174955_initial from './20260528_174955_initial';
import * as migration_20260530_090650_p0a_media from './20260530_090650_p0a_media';

export const migrations = [
  {
    up: migration_20260528_174955_initial.up,
    down: migration_20260528_174955_initial.down,
    name: '20260528_174955_initial',
  },
  {
    up: migration_20260530_090650_p0a_media.up,
    down: migration_20260530_090650_p0a_media.down,
    name: '20260530_090650_p0a_media'
  },
];

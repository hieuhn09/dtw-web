import * as migration_20260528_174955_initial from './20260528_174955_initial';
import * as migration_20260530_090650_p0a_media from './20260530_090650_p0a_media';
import * as migration_20260531_094311_pillar_heading from './20260531_094311_pillar_heading';
import * as migration_20260605_000000_engine_provenance from './20260605_000000_engine_provenance';
import * as migration_20260622_000000_pin_to_latest from './20260622_000000_pin_to_latest';

export const migrations = [
  {
    up: migration_20260528_174955_initial.up,
    down: migration_20260528_174955_initial.down,
    name: '20260528_174955_initial',
  },
  {
    up: migration_20260530_090650_p0a_media.up,
    down: migration_20260530_090650_p0a_media.down,
    name: '20260530_090650_p0a_media',
  },
  {
    up: migration_20260531_094311_pillar_heading.up,
    down: migration_20260531_094311_pillar_heading.down,
    name: '20260531_094311_pillar_heading'
  },
  {
    up: migration_20260605_000000_engine_provenance.up,
    down: migration_20260605_000000_engine_provenance.down,
    name: '20260605_000000_engine_provenance'
  },
  {
    up: migration_20260622_000000_pin_to_latest.up,
    down: migration_20260622_000000_pin_to_latest.down,
    name: '20260622_000000_pin_to_latest'
  },
];

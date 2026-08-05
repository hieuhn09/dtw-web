import * as migration_20260528_174955_initial from './20260528_174955_initial';
import * as migration_20260530_090650_p0a_media from './20260530_090650_p0a_media';
import * as migration_20260531_094311_pillar_heading from './20260531_094311_pillar_heading';
import * as migration_20260605_000000_engine_provenance from './20260605_000000_engine_provenance';
import * as migration_20260622_000000_pin_to_latest from './20260622_000000_pin_to_latest';
import * as migration_20260706_022942_add_paywall_settings_global from './20260706_022942_add_paywall_settings_global';
import * as migration_20260706_030547_add_newsletters_collection from './20260706_030547_add_newsletters_collection';
import * as migration_20260731_025433_ai_leaderboard_llmstats from './20260731_025433_ai_leaderboard_llmstats';
import * as migration_20260805_000000_pinned_until from './20260805_000000_pinned_until';

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
    name: '20260531_094311_pillar_heading',
  },
  {
    up: migration_20260605_000000_engine_provenance.up,
    down: migration_20260605_000000_engine_provenance.down,
    name: '20260605_000000_engine_provenance',
  },
  {
    up: migration_20260622_000000_pin_to_latest.up,
    down: migration_20260622_000000_pin_to_latest.down,
    name: '20260622_000000_pin_to_latest',
  },
  {
    up: migration_20260706_022942_add_paywall_settings_global.up,
    down: migration_20260706_022942_add_paywall_settings_global.down,
    name: '20260706_022942_add_paywall_settings_global',
  },
  {
    up: migration_20260706_030547_add_newsletters_collection.up,
    down: migration_20260706_030547_add_newsletters_collection.down,
    name: '20260706_030547_add_newsletters_collection',
  },
  {
    up: migration_20260731_025433_ai_leaderboard_llmstats.up,
    down: migration_20260731_025433_ai_leaderboard_llmstats.down,
    name: '20260731_025433_ai_leaderboard_llmstats'
  },
  {
    up: migration_20260805_000000_pinned_until.up,
    down: migration_20260805_000000_pinned_until.down,
    name: '20260805_000000_pinned_until',
  },
];

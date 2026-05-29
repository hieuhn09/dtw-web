// @dtw/db — shared Drizzle schema + client.
//
// Two entry points:
//   - `@dtw/db`         → schema barrel (types + table objects)
//   - `@dtw/db/client`  → the Drizzle db instance for queries
//
// The split keeps server-only code (`postgres()` connection) out of the schema
// barrel so frontend types can be imported without dragging in the driver.
//
// See process/context/database/all-database.md for the conflict-resolution model
// and process/features/engine-integration/_GUIDE.md for the invariants this
// package must enforce.

export * from "./schema/index";

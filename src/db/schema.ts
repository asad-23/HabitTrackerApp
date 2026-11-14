import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  fullVersion: text('full_version').notNull(),
  minVersion: text('min_version').notNull(),
  cue: text('cue').notNull(),
  identity: text('identity').notNull(),
  /** Local "HH:mm", or null to follow the default reminder time. */
  reminderTime: text('reminder_time'),
  /** Bitmask, Monday = bit 0 … Sunday = bit 6. */
  repeatMask: integer('repeat_mask').notNull().default(127),
  /** Local YYYY-MM-DD. */
  startDate: text('start_date').notNull(),
  createdAt: text('created_at').notNull(),
  archivedAt: text('archived_at'),
  /** Local YYYY-MM-DD of the archive action. */
  archivedOn: text('archived_on'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const checkIns = sqliteTable(
  'check_ins',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    /** Local YYYY-MM-DD. */
    date: text('date').notNull(),
    status: text('status', { enum: ['full', 'minimum', 'skipped'] }).notNull(),
    note: text('note'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('check_ins_habit_date_idx').on(table.habitId, table.date)],
);

export const reflections = sqliteTable(
  'reflections',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** Local Monday YYYY-MM-DD. */
    weekStart: text('week_start').notNull(),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    reasonTag: text('reason_tag', {
      enum: ['tired', 'busy', 'forgot', 'unmotivated', 'sick', 'other'],
    }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [uniqueIndex('reflections_week_habit_idx').on(table.weekStart, table.habitId)],
);

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
export type CheckInStatus = CheckIn['status'];
export type Reflection = typeof reflections.$inferSelect;
export type NewReflection = typeof reflections.$inferInsert;
export type ReasonTag = Reflection['reasonTag'];

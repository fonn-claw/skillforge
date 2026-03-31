import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  real,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["learner", "mentor", "admin"]);

export const masteryLevelEnum = pgEnum("mastery_level", [
  "locked",
  "novice",
  "apprentice",
  "journeyman",
  "expert",
  "master",
]);

export const challengeTypeEnum = pgEnum("challenge_type", [
  "quiz",
  "project_submission",
]);

export const archetypeNameEnum = pgEnum("archetype_name", [
  "builder",
  "analyst",
  "explorer",
  "collaborator",
]);

// ─── Archetypes ──────────────────────────────────────────────────────────────

export const archetypes = pgTable("archetypes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  iconKey: text("icon_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: roleEnum("role").notNull().default("learner"),
  archetypeId: uuid("archetype_id").references(() => archetypes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Skill Nodes ─────────────────────────────────────────────────────────────

export const skillNodes = pgTable("skill_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconKey: text("icon_key"),
  positionX: real("position_x").notNull(),
  positionY: real("position_y").notNull(),
  branchName: text("branch_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Node Edges (prerequisite DAG) ──────────────────────────────────────────

export const nodeEdges = pgTable("node_edges", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceNodeId: uuid("source_node_id")
    .notNull()
    .references(() => skillNodes.id, { onDelete: "cascade" }),
  targetNodeId: uuid("target_node_id")
    .notNull()
    .references(() => skillNodes.id, { onDelete: "cascade" }),
  requiredMasteryLevel: masteryLevelEnum("required_mastery_level")
    .notNull()
    .default("novice"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Challenges ──────────────────────────────────────────────────────────────

export const challenges = pgTable("challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeId: uuid("node_id")
    .notNull()
    .references(() => skillNodes.id, { onDelete: "cascade" }),
  masteryLevel: masteryLevelEnum("mastery_level").notNull(),
  type: challengeTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: jsonb("content"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── User Node Mastery (learner progress) ────────────────────────────────────

export const userNodeMastery = pgTable(
  "user_node_mastery",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => skillNodes.id, { onDelete: "cascade" }),
    currentLevel: masteryLevelEnum("current_level").notNull().default("novice"),
    xpCurrent: integer("xp_current").notNull().default(0),
    xpRequired: integer("xp_required").notNull().default(100),
    unlockedAt: timestamp("unlocked_at").defaultNow(),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
  },
  (table) => [uniqueIndex("user_node_unique").on(table.userId, table.nodeId)]
);

// ─── Challenge Submissions ───────────────────────────────────────────────────

export const challengeSubmissions = pgTable("challenge_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  response: jsonb("response"),
  score: integer("score"),
  mentorId: uuid("mentor_id").references(() => users.id),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

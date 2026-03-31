# SkillForge — Learning Gamification & Skill Progression Platform

## The Problem
Online courses and learning platforms have 50-90% dropout rates. Users sign up motivated, complete the first few lessons, then vanish. The content isn't the problem — the structure is. Linear progress bars and completion percentages don't create the pull that keeps learners coming back.

What works in games — branching skill trees, mastery levels, applied challenges, archetype-based learning paths — is completely absent from most EdTech. "Knowing the answer isn't the same as knowing how to use it. We need to move from static recall to Behavioral Intelligence."

From a learning app builder: "We need Behavioral Intelligence... identify your archetype (Architect, Storyteller, Visualizer, Builder)... applied learning wins because if you can't apply it, you won't retain it."

From the data: Duolingo proved that gamification drives 10x+ engagement in language learning. But most learning platforms still treat gamification as a badge on the side, not the core progression system.

What doesn't work: "Completion certificates nobody cares about, quizzes that feel like tests, progress bars that make 70% feel like failure instead of celebrating how far you've come."

## The Domain
Learning and skill development — specifically the progression and engagement layer. This isn't a course platform (no video hosting, no content authoring). It's the gamification engine that wraps around learning — the thing that makes a learner think "I need to unlock that next node" instead of "I should probably finish chapter 4."

A learner's journey:
1. Take a short quiz to discover their learner archetype (Builder, Analyst, Explorer, Collaborator)
2. See their personalized skill tree — nodes representing skills, connected by prerequisite paths
3. Each node has a mastery level (Novice → Apprentice → Journeyman → Expert → Master)
4. Complete challenges to level up a node — not just quizzes, but applied tasks ("build something with this concept")
5. Unlock new branches as prerequisites are met — the tree grows
6. See how their skill profile compares to peers and mentors
7. Earn mastery badges that actually mean something — not just "you showed up"

The psychology: skill trees create visible pathways ("I can see where I'm going"), mastery levels create depth ("I know this, but I could know it better"), branching creates agency ("I choose my path"), and archetypes create identity ("I'm a Builder, I learn by making things").

## Visual Identity — IMPORTANT
This should feel like an RPG character skill screen. Think Path of Exile's passive skill tree, Diablo's skill system, or Civilization's tech tree — but approachable and modern, not intimidating.

The skill tree is the HERO — a visual, interactive, zoomable graph of nodes and connections. Not a list. Not a grid. A tree you navigate.

Rich, deep colors — think enchanted forest meets digital academy. Glowing node connections, mastery level indicators that feel like power-ups, archetype badges that feel like character classes.

NOT a corporate LMS. NOT a progress bar dashboard. The tree IS the experience.

## Users & What They Need

### The Learner (primary user)
- Needs to see their entire skill landscape — what they know, what's next, what's locked
- Needs to feel agency — choose which branch to pursue, not follow a linear path
- Needs mastery depth — not just "done/not done" but levels of expertise per skill
- Needs applied challenges — "use this skill to build/solve/create something"
- Needs their archetype to feel meaningful — learning recommendations adapt to how they learn
- Needs social proof — see how peers are progressing, what paths top learners took

### The Mentor / Instructor
- Needs to see learner progress across the skill tree — who's stuck, who's advancing
- Needs to identify skill gaps in their cohort — which nodes have low mastery
- Needs to assign targeted challenges to specific learners
- Needs to validate mastery — review applied challenge submissions

### The Platform Admin
- Needs to configure the skill tree — add nodes, set prerequisites, define mastery criteria
- Needs engagement analytics — which paths are popular, where do learners drop off
- Needs to manage archetypes and their learning style recommendations

## Demo Data
A coding academy called "CodeForge Academy" teaching web development.

Skill tree structure:
- Root: "Web Fundamentals" (HTML, CSS, JavaScript basics)
- Branch 1: "Frontend" → React → State Management → Testing → Performance
- Branch 2: "Backend" → Node.js → Databases → APIs → Authentication
- Branch 3: "DevOps" → Git → CI/CD → Cloud → Monitoring
- Each node has 5 mastery levels with increasing difficulty challenges

Active scenario:
- 20 learners at various points in the tree
- 1 advanced learner deep in the Frontend branch (Expert in React, Journeyman in Testing)
- 1 beginner just starting (completed archetype quiz, 2 nodes unlocked)
- 3 learners stuck at the same node (Database mastery — instructor should notice)
- 2 mentors reviewing challenge submissions
- 4 learner archetypes represented: Builder, Analyst, Explorer, Collaborator

### Demo Accounts
- learner@skillforge.app / demo1234 — Advanced learner (deep Frontend progress, multiple mastery levels)
- mentor@skillforge.app / demo1234 — Mentor view (cohort progress, challenge reviews)
- admin@skillforge.app / demo1234 — Admin (tree configuration, analytics)

## Tech Stack
- Next.js with App Router
- Neon Postgres (NOT SQLite)
- Drizzle ORM
- Deploy to Vercel

## Notes
- The skill tree visualization is the core — consider React Flow, D3, or custom SVG/Canvas for the interactive graph
- Nodes should be clickable — show mastery level, challenges, description
- Connections between nodes should glow or animate when prerequisites are met
- Archetype quiz should be engaging — 5-7 questions, visual results, not a boring form
- Mastery levels need visual distinction — color intensity, size, glow, or icon evolution
- Challenge types: quiz, code exercise, project submission, peer review
- The tree should be zoomable/pannable — learners need to explore it spatially

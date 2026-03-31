/**
 * SkillForge seed script -- CodeForge Academy demo data.
 * Run: npx tsx db/seed.ts
 *
 * Creates: 4 archetypes, 23 users, 15 skill nodes, 14 edges,
 * challenges at multiple mastery levels, learner progression, and submissions.
 */

import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  archetypes,
  users,
  skillNodes,
  nodeEdges,
  challenges,
  userNodeMastery,
  challengeSubmissions,
} from "./schema";
import { validateDAG } from "../lib/dag";

async function seed() {
  console.log("Seeding SkillForge database...\n");

  // ─── 1. Clear all tables in reverse dependency order ────────────────────────
  console.log("Clearing existing data...");
  await db.delete(challengeSubmissions);
  await db.delete(userNodeMastery);
  await db.delete(challenges);
  await db.delete(nodeEdges);
  await db.delete(skillNodes);
  await db.delete(users);
  await db.delete(archetypes);

  // ─── 2. Insert archetypes ──────────────────────────────────────────────────
  console.log("Inserting archetypes...");
  const [builderArch, analystArch, explorerArch, collaboratorArch] = await db
    .insert(archetypes)
    .values([
      {
        name: "builder",
        description:
          "You learn by making things. Hands-on projects and building real applications drive your understanding.",
        color: "#FF6B35",
        iconKey: "icon-archetype-builder",
      },
      {
        name: "analyst",
        description:
          "You learn by understanding systems. Breaking down complex concepts and finding patterns is your strength.",
        color: "#38BDF8",
        iconKey: "icon-archetype-analyst",
      },
      {
        name: "explorer",
        description:
          "You learn by discovering. You follow curiosity, try new approaches, and connect unexpected ideas.",
        color: "#34D399",
        iconKey: "icon-archetype-explorer",
      },
      {
        name: "collaborator",
        description:
          "You learn by teaching and sharing. Discussion, pair work, and explaining concepts cement your understanding.",
        color: "#A78BFA",
        iconKey: "icon-archetype-collaborator",
      },
    ])
    .returning();

  const archByName: Record<string, string> = {
    builder: builderArch.id,
    analyst: analystArch.id,
    explorer: explorerArch.id,
    collaborator: collaboratorArch.id,
  };

  // ─── 3. Insert users ──────────────────────────────────────────────────────
  console.log("Inserting users...");
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Demo accounts
  const [demoLearner] = await db
    .insert(users)
    .values({
      email: "learner@skillforge.app",
      passwordHash,
      displayName: "Alex Chen",
      role: "learner",
      archetypeId: archByName.builder,
    })
    .returning();

  const [demoMentor] = await db
    .insert(users)
    .values({
      email: "mentor@skillforge.app",
      passwordHash,
      displayName: "Dr. Sarah Kim",
      role: "mentor",
    })
    .returning();

  const [demoAdmin] = await db
    .insert(users)
    .values({
      email: "admin@skillforge.app",
      passwordHash,
      displayName: "Jordan Taylor",
      role: "admin",
    })
    .returning();

  // 20 additional learners
  const learnerNames = [
    "Maya Rodriguez",
    "Ethan Park",
    "Sofia Nguyen",
    "Liam O'Brien",
    "Ava Patel",
    "Noah Kim",
    "Isabella Torres",
    "James Wright",
    "Mia Johansson",
    "Oliver Dubois",
    "Charlotte Lee",
    "Benjamin Santos",
    "Amelia Fischer",
    "Lucas Andersen",
    "Harper Volkov",
    "Alexander Diaz",
    "Evelyn Tanaka",
    "William Okafor",
    "Abigail Murphy",
    "Henry Larsson",
  ];

  const archetypeRotation = ["builder", "analyst", "explorer", "collaborator"];

  const learnerRows = learnerNames.map((name, i) => ({
    email: `learner${String(i + 1).padStart(2, "0")}@demo.app`,
    passwordHash,
    displayName: name,
    role: "learner" as const,
    archetypeId: archByName[archetypeRotation[i % 4]],
  }));

  const insertedLearners = await db
    .insert(users)
    .values(learnerRows)
    .returning();

  const learnerById: Record<string, string> = {};
  insertedLearners.forEach((l, i) => {
    learnerById[`learner${String(i + 1).padStart(2, "0")}`] = l.id;
  });

  // ─── 4. Insert skill nodes ────────────────────────────────────────────────
  console.log("Inserting skill nodes...");
  const nodeData = [
    {
      name: "Web Fundamentals",
      description:
        "The bedrock of web development. Understand how the internet works, HTTP protocols, and the client-server model that powers every website.",
      iconKey: "icon-node-web",
      positionX: 0,
      positionY: 0,
      branchName: null,
    },
    // Frontend branch
    {
      name: "HTML & CSS",
      description:
        "Structure and style the web. Master semantic HTML for content and CSS for layout, typography, and responsive design.",
      iconKey: "icon-node-html",
      positionX: 200,
      positionY: -150,
      branchName: "frontend",
    },
    {
      name: "JavaScript Basics",
      description:
        "The language of the web. Learn variables, functions, DOM manipulation, events, and asynchronous programming with promises.",
      iconKey: "icon-node-js",
      positionX: 400,
      positionY: -200,
      branchName: "frontend",
    },
    {
      name: "React",
      description:
        "Build dynamic user interfaces with components. Learn JSX, props, state, hooks, and the React component lifecycle.",
      iconKey: "icon-node-react",
      positionX: 600,
      positionY: -180,
      branchName: "frontend",
    },
    {
      name: "State Management",
      description:
        "Tame application complexity. Master global state patterns with Context API, reducers, and external state libraries.",
      iconKey: "icon-node-state",
      positionX: 800,
      positionY: -220,
      branchName: "frontend",
    },
    {
      name: "Frontend Testing",
      description:
        "Write tests that give you confidence. Unit tests with Jest, component tests with Testing Library, and end-to-end tests.",
      iconKey: "icon-node-testing",
      positionX: 1000,
      positionY: -180,
      branchName: "frontend",
    },
    {
      name: "Performance",
      description:
        "Make it fast. Learn code splitting, lazy loading, memoization, web vitals, and profiling tools to optimize user experience.",
      iconKey: "icon-node-perf",
      positionX: 1200,
      positionY: -200,
      branchName: "frontend",
    },
    // Backend branch
    {
      name: "Node.js",
      description:
        "JavaScript on the server. Build web servers, handle file I/O, use npm packages, and understand the event loop.",
      iconKey: "icon-node-nodejs",
      positionX: 200,
      positionY: 50,
      branchName: "backend",
    },
    {
      name: "Databases",
      description:
        "Store and retrieve data efficiently. Learn SQL fundamentals, schema design, indexing, and the basics of PostgreSQL.",
      iconKey: "icon-node-db",
      positionX: 400,
      positionY: 80,
      branchName: "backend",
    },
    {
      name: "REST APIs",
      description:
        "Design and build web APIs. Master HTTP methods, status codes, request/response patterns, and RESTful conventions.",
      iconKey: "icon-node-api",
      positionX: 600,
      positionY: 60,
      branchName: "backend",
    },
    {
      name: "Authentication",
      description:
        "Secure your applications. Implement login systems, JWT tokens, password hashing, role-based access, and session management.",
      iconKey: "icon-node-auth",
      positionX: 800,
      positionY: 80,
      branchName: "backend",
    },
    // DevOps branch
    {
      name: "Git & Version Control",
      description:
        "Track every change. Learn branching, merging, pull requests, and collaborative workflows with Git and GitHub.",
      iconKey: "icon-node-git",
      positionX: 200,
      positionY: 250,
      branchName: "devops",
    },
    {
      name: "CI/CD",
      description:
        "Automate your pipeline. Set up continuous integration with automated tests and continuous deployment to production.",
      iconKey: "icon-node-cicd",
      positionX: 400,
      positionY: 280,
      branchName: "devops",
    },
    {
      name: "Cloud Deployment",
      description:
        "Ship to the world. Deploy applications to cloud platforms, configure domains, SSL, and understand serverless architectures.",
      iconKey: "icon-node-cloud",
      positionX: 600,
      positionY: 260,
      branchName: "devops",
    },
    {
      name: "Monitoring",
      description:
        "Know before your users do. Set up logging, error tracking, performance monitoring, and alerting for production systems.",
      iconKey: "icon-node-monitor",
      positionX: 800,
      positionY: 280,
      branchName: "devops",
    },
  ];

  const insertedNodes = await db
    .insert(skillNodes)
    .values(nodeData)
    .returning();

  const nodeByName: Record<string, string> = {};
  insertedNodes.forEach((n) => {
    nodeByName[n.name] = n.id;
  });

  // ─── 5. Insert edges (prerequisites) ──────────────────────────────────────
  console.log("Inserting edges...");
  const edgeData: {
    sourceNodeId: string;
    targetNodeId: string;
    requiredMasteryLevel:
      | "locked"
      | "novice"
      | "apprentice"
      | "journeyman"
      | "expert"
      | "master";
  }[] = [
    // Root -> first nodes of each branch
    {
      sourceNodeId: nodeByName["Web Fundamentals"],
      targetNodeId: nodeByName["HTML & CSS"],
      requiredMasteryLevel: "novice",
    },
    {
      sourceNodeId: nodeByName["Web Fundamentals"],
      targetNodeId: nodeByName["Node.js"],
      requiredMasteryLevel: "novice",
    },
    {
      sourceNodeId: nodeByName["Web Fundamentals"],
      targetNodeId: nodeByName["Git & Version Control"],
      requiredMasteryLevel: "novice",
    },
    // Frontend chain
    {
      sourceNodeId: nodeByName["HTML & CSS"],
      targetNodeId: nodeByName["JavaScript Basics"],
      requiredMasteryLevel: "novice",
    },
    {
      sourceNodeId: nodeByName["JavaScript Basics"],
      targetNodeId: nodeByName["React"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["React"],
      targetNodeId: nodeByName["State Management"],
      requiredMasteryLevel: "journeyman",
    },
    {
      sourceNodeId: nodeByName["State Management"],
      targetNodeId: nodeByName["Frontend Testing"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["Frontend Testing"],
      targetNodeId: nodeByName["Performance"],
      requiredMasteryLevel: "journeyman",
    },
    // Backend chain
    {
      sourceNodeId: nodeByName["Node.js"],
      targetNodeId: nodeByName["Databases"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["Databases"],
      targetNodeId: nodeByName["REST APIs"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["REST APIs"],
      targetNodeId: nodeByName["Authentication"],
      requiredMasteryLevel: "journeyman",
    },
    // DevOps chain
    {
      sourceNodeId: nodeByName["Git & Version Control"],
      targetNodeId: nodeByName["CI/CD"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["CI/CD"],
      targetNodeId: nodeByName["Cloud Deployment"],
      requiredMasteryLevel: "apprentice",
    },
    {
      sourceNodeId: nodeByName["Cloud Deployment"],
      targetNodeId: nodeByName["Monitoring"],
      requiredMasteryLevel: "journeyman",
    },
  ];

  // Validate DAG before inserting
  const dagResult = validateDAG(edgeData);
  if (!dagResult.valid) {
    throw new Error(
      `Cycle detected in skill tree! Nodes involved: ${dagResult.cycle?.join(", ")}`
    );
  }
  console.log("  DAG validated -- no cycles detected.");

  await db.insert(nodeEdges).values(edgeData);

  // ─── 6. Insert challenges ─────────────────────────────────────────────────
  console.log("Inserting challenges...");

  type ChallengeInsert = {
    nodeId: string;
    masteryLevel:
      | "locked"
      | "novice"
      | "apprentice"
      | "journeyman"
      | "expert"
      | "master";
    type: "quiz" | "project_submission";
    title: string;
    description: string;
    content: unknown;
    sortOrder: number;
  };

  const allChallenges: ChallengeInsert[] = [];

  // Helper to create quiz challenges
  function quiz(
    nodeId: string,
    level: ChallengeInsert["masteryLevel"],
    title: string,
    description: string,
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
    }[],
    sortOrder: number
  ): ChallengeInsert {
    return {
      nodeId,
      masteryLevel: level,
      type: "quiz",
      title,
      description,
      content: { questions },
      sortOrder,
    };
  }

  function project(
    nodeId: string,
    level: ChallengeInsert["masteryLevel"],
    title: string,
    description: string,
    sortOrder: number
  ): ChallengeInsert {
    return {
      nodeId,
      masteryLevel: level,
      type: "project_submission",
      title,
      description,
      content: {
        prompt: description,
        submissionType: "url",
      },
      sortOrder,
    };
  }

  // --- Web Fundamentals ---
  const wf = nodeByName["Web Fundamentals"];
  allChallenges.push(
    quiz(wf, "novice", "How the Web Works", "Test your understanding of web basics.", [
      { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Transmission Process", "Home Tool Transfer Protocol"], correctIndex: 0 },
      { question: "What is the role of a web server?", options: ["Display web pages", "Store user passwords", "Respond to HTTP requests with resources", "Compile JavaScript code"], correctIndex: 2 },
      { question: "Which protocol ensures encrypted communication?", options: ["FTP", "HTTPS", "SMTP", "TCP"], correctIndex: 1 },
    ], 1),
    quiz(wf, "apprentice", "Client-Server Architecture", "Deepen your understanding of the request-response cycle.", [
      { question: "What is a DNS server responsible for?", options: ["Serving web pages", "Translating domain names to IP addresses", "Encrypting data", "Storing cookies"], correctIndex: 1 },
      { question: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], correctIndex: 2 },
      { question: "What does the browser send to initiate a page load?", options: ["A response", "An HTTP request", "A cookie", "A DNS record"], correctIndex: 1 },
    ], 1),
    quiz(wf, "journeyman", "Web Protocols Deep Dive", "Advanced concepts in web communication.", [
      { question: "What is the difference between HTTP/1.1 and HTTP/2?", options: ["HTTP/2 is text-based", "HTTP/2 supports multiplexing", "HTTP/1.1 is faster", "There is no difference"], correctIndex: 1 },
      { question: "What does CORS stand for?", options: ["Cross-Origin Resource Sharing", "Client-Origin Request System", "Cross-Output Response Service", "Central Origin Routing Schema"], correctIndex: 0 },
      { question: "Which header controls caching behavior?", options: ["Content-Type", "Cache-Control", "Authorization", "Accept"], correctIndex: 1 },
    ], 1)
  );

  // --- HTML & CSS ---
  const hc = nodeByName["HTML & CSS"];
  allChallenges.push(
    quiz(hc, "novice", "HTML Basics", "Fundamental HTML elements and structure.", [
      { question: "What does HTML stand for?", options: ["Hyper Trainer Marking Language", "HyperText Markup Language", "HyperText Marketing Language", "HyperTool Markup Language"], correctIndex: 1 },
      { question: "Which tag is used for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correctIndex: 2 },
      { question: "What is the correct HTML element for inserting a line break?", options: ["<break>", "<lb>", "<br>", "<newline>"], correctIndex: 2 },
    ], 1),
    quiz(hc, "apprentice", "CSS Layout", "Test your CSS layout skills.", [
      { question: "Which CSS property is used to change text color?", options: ["font-color", "text-color", "color", "foreground"], correctIndex: 2 },
      { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correctIndex: 1 },
      { question: "Which display value makes an element a flex container?", options: ["block", "inline", "flex", "grid"], correctIndex: 2 },
      { question: "What unit is relative to the viewport width?", options: ["px", "em", "vw", "rem"], correctIndex: 2 },
    ], 1),
    quiz(hc, "journeyman", "Responsive Design", "Master responsive web design techniques.", [
      { question: "What does a media query allow you to do?", options: ["Play media files", "Apply styles based on device conditions", "Query a database", "Load external scripts"], correctIndex: 1 },
      { question: "Which meta tag is essential for mobile responsiveness?", options: ["<meta charset>", "<meta viewport>", "<meta description>", "<meta keywords>"], correctIndex: 1 },
      { question: "What is the mobile-first approach?", options: ["Building for desktop first", "Designing for mobile screens first then scaling up", "Using only mobile frameworks", "Ignoring desktop users"], correctIndex: 1 },
    ], 1)
  );

  // --- JavaScript Basics ---
  const js = nodeByName["JavaScript Basics"];
  allChallenges.push(
    quiz(js, "novice", "JS Fundamentals", "Variables, types, and basic operations.", [
      { question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "function", "define"], correctIndex: 1 },
      { question: "What type does typeof null return?", options: ["null", "undefined", "object", "boolean"], correctIndex: 2 },
      { question: "Which method adds an element to the end of an array?", options: [".push()", ".pop()", ".shift()", ".unshift()"], correctIndex: 0 },
    ], 1),
    quiz(js, "apprentice", "Functions & Scope", "Understand closures, hoisting, and scope.", [
      { question: "What is a closure?", options: ["A way to close a browser tab", "A function with access to its outer scope's variables", "A CSS property", "A type of loop"], correctIndex: 1 },
      { question: "What does 'hoisting' mean in JavaScript?", options: ["Moving elements on a page", "Variable and function declarations are moved to the top of their scope", "Importing modules", "Error handling"], correctIndex: 1 },
      { question: "What is the output of: typeof (() => {})?", options: ["arrow", "object", "function", "undefined"], correctIndex: 2 },
    ], 1),
    quiz(js, "journeyman", "Async JavaScript", "Promises, async/await, and the event loop.", [
      { question: "What does a Promise represent?", options: ["A guaranteed value", "A value that may be available now, later, or never", "A synchronous operation", "A DOM element"], correctIndex: 1 },
      { question: "What keyword pauses execution until a Promise resolves?", options: ["wait", "pause", "await", "defer"], correctIndex: 2 },
      { question: "In the event loop, which queue has higher priority?", options: ["Macrotask queue", "Microtask queue", "Render queue", "They have equal priority"], correctIndex: 1 },
      { question: "What does Promise.all() do if one promise rejects?", options: ["Ignores the rejection", "Returns partial results", "Rejects immediately", "Retries the failed promise"], correctIndex: 2 },
    ], 1)
  );

  // --- React ---
  const react = nodeByName["React"];
  allChallenges.push(
    quiz(react, "novice", "React Basics", "Components, JSX, and props.", [
      { question: "What is JSX?", options: ["A database query language", "A syntax extension for JavaScript that looks like HTML", "A CSS framework", "A testing library"], correctIndex: 1 },
      { question: "How do you pass data to a child component?", options: ["Using state", "Using props", "Using refs", "Using context"], correctIndex: 1 },
      { question: "What does React.createElement return?", options: ["A DOM element", "A React element (virtual DOM node)", "A string", "An HTML template"], correctIndex: 1 },
    ], 1),
    quiz(react, "apprentice", "Hooks & State", "useState, useEffect, and custom hooks.", [
      { question: "Which hook manages local component state?", options: ["useEffect", "useState", "useContext", "useRef"], correctIndex: 1 },
      { question: "When does useEffect run by default?", options: ["Only on mount", "After every render", "Only on unmount", "Never automatically"], correctIndex: 1 },
      { question: "What is the rule about calling hooks?", options: ["Only in class components", "Only at the top level of a function component", "Only inside useEffect", "Only in event handlers"], correctIndex: 1 },
      { question: "What does useRef return?", options: ["A state variable", "A mutable object with a .current property", "A callback function", "A DOM node directly"], correctIndex: 1 },
    ], 1),
    quiz(react, "journeyman", "Advanced React Patterns", "Render props, HOCs, and performance.", [
      { question: "What does React.memo do?", options: ["Memoizes a function", "Prevents re-render if props haven't changed", "Creates a memo component", "Stores data in memory"], correctIndex: 1 },
      { question: "When should you use useMemo?", options: ["For every calculation", "For expensive calculations that depend on specific inputs", "For DOM manipulation", "For event handlers"], correctIndex: 1 },
      { question: "What is the purpose of a key prop in lists?", options: ["Styling", "Helping React identify which items changed", "Sorting items", "Filtering items"], correctIndex: 1 },
    ], 1),
    project(react, "journeyman", "Build a Todo App", "Build a fully functional todo app with React hooks. Implement add, toggle complete, delete, and filter (all/active/completed). Use useState for state management and proper key props for list rendering.", 2),
    quiz(react, "expert", "React Internals", "Fiber, reconciliation, and concurrent features.", [
      { question: "What is React Fiber?", options: ["A CSS framework", "React's reconciliation algorithm implementation", "A state management library", "A testing framework"], correctIndex: 1 },
      { question: "What does Suspense enable?", options: ["Error handling", "Declarative loading states for async operations", "State management", "Routing"], correctIndex: 1 },
      { question: "What is the purpose of React's virtual DOM?", options: ["To replace the real DOM", "To batch and minimize actual DOM updates", "To render on the server", "To handle events"], correctIndex: 1 },
    ], 1)
  );

  // --- State Management ---
  const sm = nodeByName["State Management"];
  allChallenges.push(
    quiz(sm, "novice", "State Concepts", "Understanding when and why to manage state.", [
      { question: "What is 'state' in a web application?", options: ["The URL", "Data that can change and affects the UI", "CSS styles", "HTML structure"], correctIndex: 1 },
      { question: "When should you lift state up?", options: ["Always", "When sibling components need to share data", "When state is too large", "Never"], correctIndex: 1 },
      { question: "What is prop drilling?", options: ["A testing technique", "Passing props through many intermediate components", "A performance optimization", "A CSS pattern"], correctIndex: 1 },
    ], 1),
    quiz(sm, "apprentice", "Context & Reducers", "React Context API and useReducer.", [
      { question: "What does useReducer return?", options: ["[state, setState]", "[state, dispatch]", "[action, reducer]", "[context, provider]"], correctIndex: 1 },
      { question: "When is useContext preferable to prop drilling?", options: ["Always", "When data needs to be accessed by many components at different nesting levels", "For form inputs", "For animations"], correctIndex: 1 },
      { question: "What is the role of a reducer function?", options: ["Reduce array size", "Take current state and an action, return new state", "Reduce component renders", "Filter data"], correctIndex: 1 },
    ], 1),
    quiz(sm, "journeyman", "Advanced State Patterns", "Selectors, middleware, and derived state.", [
      { question: "What is a selector?", options: ["A CSS class", "A function that derives data from state", "An HTML attribute", "A React component"], correctIndex: 1 },
      { question: "Why should state be normalized?", options: ["For better CSS", "To avoid data duplication and update anomalies", "For faster rendering", "It shouldn't be"], correctIndex: 1 },
      { question: "What is optimistic UI?", options: ["UI that always shows success", "Updating UI before server confirmation", "A design pattern for forms", "A testing strategy"], correctIndex: 1 },
    ], 1)
  );

  // --- Frontend Testing ---
  const ft = nodeByName["Frontend Testing"];
  allChallenges.push(
    quiz(ft, "novice", "Testing Basics", "Why and how to test frontend code.", [
      { question: "What is a unit test?", options: ["Testing the entire app", "Testing a small, isolated piece of code", "Testing UI layout", "Testing server performance"], correctIndex: 1 },
      { question: "What does 'assertion' mean in testing?", options: ["A guess", "A statement that checks expected vs actual values", "A console.log", "A type annotation"], correctIndex: 1 },
      { question: "What is the testing pyramid?", options: ["A physical structure", "A model showing many unit tests, fewer integration tests, fewest E2E tests", "A React component", "A CSS framework"], correctIndex: 1 },
    ], 1),
    quiz(ft, "apprentice", "Testing Library", "Component testing with React Testing Library.", [
      { question: "What philosophy does Testing Library follow?", options: ["Test implementation details", "Test the way users interact with your app", "Test every line of code", "Test only edge cases"], correctIndex: 1 },
      { question: "Which query should you prefer?", options: ["getByTestId", "getByRole", "querySelector", "getByClassName"], correctIndex: 1 },
      { question: "What does fireEvent simulate?", options: ["A database query", "User interactions like clicks and typing", "A network request", "A state change"], correctIndex: 1 },
    ], 1),
    quiz(ft, "journeyman", "E2E & Integration Testing", "End-to-end testing strategies.", [
      { question: "What is an integration test?", options: ["Testing CSS styles", "Testing how multiple units work together", "Testing a single function", "Testing the database"], correctIndex: 1 },
      { question: "When are E2E tests most valuable?", options: ["For every component", "For critical user flows like login and checkout", "For utility functions", "Never"], correctIndex: 1 },
      { question: "What is test flakiness?", options: ["A naming convention", "Tests that pass or fail inconsistently", "A testing framework", "A type of assertion"], correctIndex: 1 },
    ], 1)
  );

  // --- Performance ---
  const perf = nodeByName["Performance"];
  allChallenges.push(
    quiz(perf, "novice", "Performance Basics", "Understanding web performance metrics.", [
      { question: "What is LCP?", options: ["Largest Contentful Paint", "Last CSS Property", "Linear Code Path", "Layout Change Percentage"], correctIndex: 0 },
      { question: "Why does page load speed matter?", options: ["It doesn't", "Users abandon slow sites and search engines rank faster sites higher", "Only for mobile", "Only for images"], correctIndex: 1 },
      { question: "What tool can measure Core Web Vitals?", options: ["npm", "Lighthouse", "ESLint", "Prettier"], correctIndex: 1 },
    ], 1),
    quiz(perf, "apprentice", "Optimization Techniques", "Code splitting, lazy loading, and caching.", [
      { question: "What is code splitting?", options: ["Dividing CSS files", "Breaking a bundle into smaller chunks loaded on demand", "Splitting a team", "Using multiple servers"], correctIndex: 1 },
      { question: "What does React.lazy() enable?", options: ["Lazy state updates", "Dynamic import of components", "Slower rendering", "Delayed effects"], correctIndex: 1 },
      { question: "What is memoization?", options: ["Writing memos", "Caching function results based on inputs", "Memory management", "A React hook"], correctIndex: 1 },
    ], 1),
    quiz(perf, "journeyman", "Advanced Performance", "Profiling, budgets, and architecture.", [
      { question: "What is a performance budget?", options: ["Money for servers", "Limits on metrics like bundle size and load time", "A React library", "A CSS property"], correctIndex: 1 },
      { question: "What does tree-shaking eliminate?", options: ["DOM nodes", "Unused code from bundles", "Test files", "Comments"], correctIndex: 1 },
      { question: "When should you virtualize a list?", options: ["Always", "When rendering hundreds or thousands of items", "For 5-10 items", "Never"], correctIndex: 1 },
    ], 1)
  );

  // --- Node.js ---
  const node = nodeByName["Node.js"];
  allChallenges.push(
    quiz(node, "novice", "Node.js Basics", "The runtime, modules, and npm.", [
      { question: "What is Node.js?", options: ["A frontend framework", "A JavaScript runtime built on Chrome's V8 engine", "A database", "A CSS preprocessor"], correctIndex: 1 },
      { question: "What command initializes a new npm project?", options: ["npm start", "npm install", "npm init", "npm run"], correctIndex: 2 },
      { question: "What is package.json?", options: ["A CSS file", "A project manifest with dependencies and scripts", "A database config", "An HTML template"], correctIndex: 1 },
    ], 1),
    quiz(node, "apprentice", "Modules & Async I/O", "CommonJS, ES modules, and file system.", [
      { question: "What is the difference between require and import?", options: ["No difference", "require is CommonJS, import is ES modules", "import is older", "require is faster"], correctIndex: 1 },
      { question: "Why is Node.js good for I/O-heavy tasks?", options: ["It uses multiple threads", "It uses a non-blocking event-driven architecture", "It compiles to native code", "It caches everything"], correctIndex: 1 },
      { question: "What does fs.readFile do?", options: ["Creates a file", "Reads a file's contents asynchronously", "Deletes a file", "Renames a file"], correctIndex: 1 },
    ], 1),
    quiz(node, "journeyman", "Server Architecture", "Express patterns, middleware, and error handling.", [
      { question: "What is middleware in Express?", options: ["A database layer", "Functions that process requests between receiving and responding", "A frontend library", "A testing tool"], correctIndex: 1 },
      { question: "How do you handle errors in Express?", options: ["Try/catch only", "Error-handling middleware with 4 parameters (err, req, res, next)", "Ignore them", "Use console.log"], correctIndex: 1 },
      { question: "What is the event loop?", options: ["A for loop", "The mechanism that handles async callbacks in Node.js", "A React feature", "A database query"], correctIndex: 1 },
    ], 1)
  );

  // --- Databases ---
  const dbs = nodeByName["Databases"];
  allChallenges.push(
    quiz(dbs, "novice", "SQL Fundamentals", "Basic queries and data types.", [
      { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Question Language", "Server Query Logic", "Standard Query Lib"], correctIndex: 0 },
      { question: "Which clause filters rows in a SELECT?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], correctIndex: 2 },
      { question: "What is a primary key?", options: ["The first column", "A unique identifier for each row", "A foreign key", "An index"], correctIndex: 1 },
    ], 1),
    quiz(dbs, "apprentice", "Schema Design", "Normalization, relationships, and constraints.", [
      { question: "What is database normalization?", options: ["Making data normal", "Organizing data to reduce redundancy", "Compressing data", "Encrypting data"], correctIndex: 1 },
      { question: "What does a foreign key do?", options: ["Encrypts data", "References a primary key in another table", "Creates an index", "Deletes rows"], correctIndex: 1 },
      { question: "What is a one-to-many relationship?", options: ["One table to many databases", "One record in table A relates to many records in table B", "Many records map to one column", "One column has many types"], correctIndex: 1 },
      { question: "What is an index?", options: ["A table of contents", "A data structure that speeds up queries", "A type of join", "A backup"], correctIndex: 1 },
    ], 1),
    quiz(dbs, "journeyman", "Advanced Queries", "Joins, subqueries, and transactions.", [
      { question: "What does a LEFT JOIN return?", options: ["Only matching rows", "All rows from left table plus matching rows from right", "All rows from both tables", "Only unmatched rows"], correctIndex: 1 },
      { question: "What is a transaction?", options: ["A payment", "A sequence of operations that succeed or fail as a unit", "A query", "A table"], correctIndex: 1 },
      { question: "What does ACID stand for?", options: ["Atomicity, Consistency, Isolation, Durability", "Add, Create, Insert, Delete", "Automatic, Complete, Indexed, Durable", "Access, Control, Identity, Data"], correctIndex: 0 },
    ], 1),
    project(dbs, "journeyman", "Design a Blog Schema", "Design a PostgreSQL schema for a blog platform with users, posts, comments, and tags. Include proper foreign keys, indexes, and at least one many-to-many relationship. Submit your SQL CREATE TABLE statements.", 2),
    quiz(dbs, "expert", "Performance & Optimization", "Query plans, indexing strategies, and scaling.", [
      { question: "What does EXPLAIN ANALYZE show?", options: ["Table structure", "The actual execution plan with timing for a query", "Database size", "User permissions"], correctIndex: 1 },
      { question: "When is a full table scan acceptable?", options: ["Never", "When the table is small or you need most rows", "Always", "Only with indexes"], correctIndex: 1 },
    ], 1)
  );

  // --- REST APIs ---
  const api = nodeByName["REST APIs"];
  allChallenges.push(
    quiz(api, "novice", "REST Basics", "HTTP methods and resource-based URLs.", [
      { question: "What HTTP method retrieves a resource?", options: ["POST", "PUT", "GET", "DELETE"], correctIndex: 2 },
      { question: "What does REST stand for?", options: ["Representational State Transfer", "Remote Execution Standard Transfer", "Request-Server Technology", "Resource State Transaction"], correctIndex: 0 },
      { question: "What status code indicates success for a POST request?", options: ["200", "201", "204", "301"], correctIndex: 1 },
    ], 1),
    quiz(api, "apprentice", "API Design", "Endpoints, pagination, and error handling.", [
      { question: "How should you handle API errors?", options: ["Return 200 with error message", "Return appropriate HTTP status code with error details", "Crash the server", "Log and ignore"], correctIndex: 1 },
      { question: "What is pagination used for?", options: ["Styling pages", "Returning large datasets in manageable chunks", "Authentication", "Caching"], correctIndex: 1 },
      { question: "Which HTTP method is idempotent for updates?", options: ["POST", "PUT", "PATCH", "DELETE"], correctIndex: 1 },
      { question: "What Content-Type header is used for JSON?", options: ["text/html", "application/json", "text/plain", "multipart/form-data"], correctIndex: 1 },
    ], 1),
    quiz(api, "journeyman", "Advanced API Patterns", "Versioning, rate limiting, and auth.", [
      { question: "Why version your API?", options: ["For fun", "To allow breaking changes without disrupting existing clients", "To track user versions", "For SEO"], correctIndex: 1 },
      { question: "What is rate limiting?", options: ["Limiting page load speed", "Restricting the number of API requests per time period", "Limiting database size", "Reducing code size"], correctIndex: 1 },
      { question: "What is the purpose of an API key?", options: ["Encryption", "Identifying and authenticating the calling application", "Database access", "Styling"], correctIndex: 1 },
    ], 1),
    project(api, "journeyman", "Build a CRUD API", "Build a RESTful CRUD API for a resource of your choice (e.g., bookmarks, recipes, tasks). Implement GET (list + single), POST, PUT, and DELETE endpoints with proper status codes, input validation, and error handling.", 2),
    quiz(api, "expert", "API Security & Scale", "OAuth, GraphQL, and microservices.", [
      { question: "What is the difference between authentication and authorization?", options: ["No difference", "Authentication verifies identity, authorization verifies permissions", "Authorization comes first", "They are the same thing"], correctIndex: 1 },
      { question: "What is a JWT?", options: ["A Java tool", "A self-contained token encoding claims as JSON", "A JavaScript test", "A database format"], correctIndex: 1 },
    ], 1)
  );

  // --- Authentication ---
  const auth = nodeByName["Authentication"];
  allChallenges.push(
    quiz(auth, "novice", "Auth Concepts", "Understanding authentication basics.", [
      { question: "What is the purpose of password hashing?", options: ["Make passwords shorter", "Store passwords securely so they can't be read if the database is compromised", "Encrypt network traffic", "Speed up login"], correctIndex: 1 },
      { question: "What is a session?", options: ["A browser tab", "A period of interaction tracked by the server", "A database table", "A CSS property"], correctIndex: 1 },
      { question: "Why should you never store plaintext passwords?", options: ["They take too much space", "A database breach would expose all user credentials", "They're hard to type", "Hashing is required by HTML"], correctIndex: 1 },
    ], 1),
    quiz(auth, "apprentice", "JWT & Cookies", "Token-based authentication patterns.", [
      { question: "What are the three parts of a JWT?", options: ["Header, Body, Footer", "Header, Payload, Signature", "Token, Session, Cookie", "Key, Value, Hash"], correctIndex: 1 },
      { question: "What does httpOnly on a cookie prevent?", options: ["Server access", "JavaScript access to the cookie", "Cookie expiration", "Cross-domain sharing"], correctIndex: 1 },
      { question: "What is a refresh token used for?", options: ["Refreshing the page", "Obtaining a new access token without re-authenticating", "Resetting passwords", "Logging out"], correctIndex: 1 },
    ], 1),
    quiz(auth, "journeyman", "Security Best Practices", "RBAC, CSRF, and secure implementation.", [
      { question: "What is RBAC?", options: ["A testing framework", "Role-Based Access Control", "A database type", "A React component"], correctIndex: 1 },
      { question: "What is a CSRF attack?", options: ["Cross-Site Request Forgery -- tricking a user into making unwanted requests", "A SQL injection", "A DDoS attack", "A password guess"], correctIndex: 0 },
      { question: "What is the SameSite cookie attribute for?", options: ["Styling", "Preventing CSRF by controlling when cookies are sent cross-site", "Performance", "Caching"], correctIndex: 1 },
    ], 1)
  );

  // --- Git & Version Control ---
  const git = nodeByName["Git & Version Control"];
  allChallenges.push(
    quiz(git, "novice", "Git Basics", "Init, add, commit, and status.", [
      { question: "What does 'git init' do?", options: ["Downloads a repo", "Creates a new Git repository", "Commits changes", "Pushes to remote"], correctIndex: 1 },
      { question: "What is a commit?", options: ["A promise", "A snapshot of your project at a point in time", "A branch", "A server"], correctIndex: 1 },
      { question: "What does 'git status' show?", options: ["Commit history", "The state of the working directory and staging area", "Remote branches", "File sizes"], correctIndex: 1 },
    ], 1),
    quiz(git, "apprentice", "Branching & Merging", "Working with branches effectively.", [
      { question: "What is a branch in Git?", options: ["A copy of the repo", "A pointer to a specific commit", "A remote server", "A file type"], correctIndex: 1 },
      { question: "What does 'git merge' do?", options: ["Deletes a branch", "Combines changes from one branch into another", "Creates a new branch", "Reverts changes"], correctIndex: 1 },
      { question: "What is a merge conflict?", options: ["An error in Git", "When two branches modify the same part of a file differently", "A network issue", "A permission error"], correctIndex: 1 },
    ], 1),
    quiz(git, "journeyman", "Advanced Git", "Rebasing, cherry-picking, and workflows.", [
      { question: "What is the difference between merge and rebase?", options: ["No difference", "Rebase rewrites commit history to create a linear sequence", "Merge is faster", "Rebase creates merge commits"], correctIndex: 1 },
      { question: "What does 'git cherry-pick' do?", options: ["Picks the best branch", "Applies a specific commit from another branch", "Deletes commits", "Resets the repo"], correctIndex: 1 },
      { question: "What is a pull request?", options: ["Pulling code from remote", "A request to merge changes with code review", "A Git command", "A branch deletion"], correctIndex: 1 },
    ], 1)
  );

  // --- CI/CD ---
  const cicd = nodeByName["CI/CD"];
  allChallenges.push(
    quiz(cicd, "novice", "CI/CD Concepts", "Understanding continuous integration and deployment.", [
      { question: "What does CI stand for?", options: ["Code Integration", "Continuous Integration", "Central Installation", "Complete Import"], correctIndex: 1 },
      { question: "What is the primary benefit of CI?", options: ["Faster computers", "Catching bugs early by automatically testing every change", "Better design", "Cheaper servers"], correctIndex: 1 },
      { question: "What triggers a CI pipeline?", options: ["A manual button", "A code push or pull request", "A server restart", "A cron job only"], correctIndex: 1 },
    ], 1),
    quiz(cicd, "apprentice", "Pipeline Configuration", "Writing CI/CD workflows.", [
      { question: "What is a pipeline stage?", options: ["A physical server", "A group of related jobs like build, test, or deploy", "A Git branch", "A Docker image"], correctIndex: 1 },
      { question: "What is an artifact in CI/CD?", options: ["An old tool", "A file or package produced by a pipeline step", "A commit message", "A test result"], correctIndex: 1 },
      { question: "Why should you run tests in CI?", options: ["To slow down development", "To ensure code quality consistently across all contributions", "For fun", "To use server resources"], correctIndex: 1 },
    ], 1),
    quiz(cicd, "journeyman", "Advanced CI/CD", "Strategies, rollbacks, and environments.", [
      { question: "What is a blue-green deployment?", options: ["A color scheme", "Running two production environments and switching traffic between them", "A testing strategy", "A Git branch pattern"], correctIndex: 1 },
      { question: "What is a canary deployment?", options: ["A bird-themed release", "Gradually rolling out changes to a small subset of users first", "Deploying to a test server", "A rollback strategy"], correctIndex: 1 },
      { question: "Why have separate staging and production environments?", options: ["To use more servers", "To test changes in a production-like setting before real users are affected", "For security", "To store backups"], correctIndex: 1 },
    ], 1)
  );

  // --- Cloud Deployment ---
  const cloud = nodeByName["Cloud Deployment"];
  allChallenges.push(
    quiz(cloud, "novice", "Cloud Basics", "Understanding cloud platforms.", [
      { question: "What is cloud computing?", options: ["Storing files in the sky", "Delivering computing services over the internet", "A weather app", "Local server hosting"], correctIndex: 1 },
      { question: "What is a serverless function?", options: ["A function without a server", "Code that runs on-demand without managing infrastructure", "A frontend function", "A database query"], correctIndex: 1 },
      { question: "What is a CDN?", options: ["Central Data Node", "Content Delivery Network -- serving content from servers close to users", "Cloud Database Network", "Continuous Delivery Node"], correctIndex: 1 },
    ], 1),
    quiz(cloud, "apprentice", "Deployment Platforms", "Vercel, Netlify, and cloud providers.", [
      { question: "What does Vercel specialize in?", options: ["Database hosting", "Frontend and serverless deployment with great Next.js support", "Email services", "Machine learning"], correctIndex: 1 },
      { question: "What is an environment variable?", options: ["A JavaScript variable", "Configuration values set outside the code, available at runtime", "A CSS variable", "A Git branch"], correctIndex: 1 },
      { question: "What is SSL/TLS?", options: ["A programming language", "Encryption protocols that secure data in transit", "A server type", "A database"], correctIndex: 1 },
    ], 1),
    quiz(cloud, "journeyman", "Production Architecture", "Scaling, domains, and infrastructure.", [
      { question: "What is horizontal scaling?", options: ["Making servers bigger", "Adding more server instances to handle load", "Scaling CSS", "Database indexing"], correctIndex: 1 },
      { question: "What is a reverse proxy?", options: ["A backwards server", "A server that forwards client requests to backend servers", "A VPN", "A cache"], correctIndex: 1 },
      { question: "What does DNS do?", options: ["Secures data", "Maps domain names to IP addresses", "Compresses files", "Manages databases"], correctIndex: 1 },
    ], 1)
  );

  // --- Monitoring ---
  const mon = nodeByName["Monitoring"];
  allChallenges.push(
    quiz(mon, "novice", "Monitoring Basics", "Why and what to monitor.", [
      { question: "Why monitor a production application?", options: ["To slow it down", "To detect and diagnose issues before users are significantly impacted", "For compliance only", "To increase costs"], correctIndex: 1 },
      { question: "What are the three pillars of observability?", options: ["HTML, CSS, JS", "Logs, Metrics, Traces", "CPU, Memory, Disk", "Frontend, Backend, Database"], correctIndex: 1 },
      { question: "What is an alert?", options: ["A pop-up ad", "An automated notification when a metric crosses a threshold", "A log entry", "A user complaint"], correctIndex: 1 },
    ], 1),
    quiz(mon, "apprentice", "Logging & Metrics", "Structured logging and metric collection.", [
      { question: "What is structured logging?", options: ["Writing essays", "Logging in a machine-parseable format like JSON", "Logging to a file", "Using console.log"], correctIndex: 1 },
      { question: "What is a p99 latency?", options: ["99th percentile -- 99% of requests are faster than this value", "99 milliseconds", "A protocol version", "A server type"], correctIndex: 0 },
      { question: "What tool category does Prometheus fall into?", options: ["Logging", "Metrics collection and time-series database", "Tracing", "Error tracking"], correctIndex: 1 },
    ], 1),
    quiz(mon, "journeyman", "Advanced Observability", "Distributed tracing and incident response.", [
      { question: "What is distributed tracing?", options: ["Tracing network cables", "Tracking a request across multiple services to identify bottlenecks", "A debugging technique", "A deployment strategy"], correctIndex: 1 },
      { question: "What is an SLO?", options: ["A slow server", "Service Level Objective -- a target for service reliability", "A logging standard", "A security protocol"], correctIndex: 1 },
      { question: "What is the purpose of a runbook?", options: ["A running guide", "Documented steps for responding to specific incidents", "A test script", "A deployment manifest"], correctIndex: 1 },
    ], 1)
  );

  // Insert all challenges
  const insertedChallenges = await db
    .insert(challenges)
    .values(allChallenges)
    .returning();

  // Build lookup for challenge submissions
  const challengeByNodeLevel: Record<string, string> = {};
  insertedChallenges.forEach((c) => {
    const key = `${c.nodeId}:${c.masteryLevel}:${c.type}`;
    challengeByNodeLevel[key] = c.id;
  });

  // Helper to find a challenge
  function findChallenge(
    nodeName: string,
    level: string,
    type: string = "quiz"
  ): string {
    const nodeId = nodeByName[nodeName];
    const key = `${nodeId}:${level}:${type}`;
    const id = challengeByNodeLevel[key];
    if (!id)
      throw new Error(
        `Challenge not found: ${nodeName} / ${level} / ${type}`
      );
    return id;
  }

  // ─── 7. Insert learner progression ────────────────────────────────────────
  console.log("Inserting learner progression...");

  type MasteryInsert = {
    userId: string;
    nodeId: string;
    currentLevel:
      | "locked"
      | "novice"
      | "apprentice"
      | "journeyman"
      | "expert"
      | "master";
    xpCurrent: number;
    xpRequired: number;
    lastActivityAt?: Date;
  };

  const masteryRecords: MasteryInsert[] = [];

  // Alex Chen (learner@skillforge.app) -- advanced Frontend learner
  const alexId = demoLearner.id;
  masteryRecords.push(
    { userId: alexId, nodeId: nodeByName["Web Fundamentals"], currentLevel: "master", xpCurrent: 100, xpRequired: 100 },
    { userId: alexId, nodeId: nodeByName["HTML & CSS"], currentLevel: "expert", xpCurrent: 95, xpRequired: 100 },
    { userId: alexId, nodeId: nodeByName["JavaScript Basics"], currentLevel: "expert", xpCurrent: 88, xpRequired: 100 },
    { userId: alexId, nodeId: nodeByName["React"], currentLevel: "expert", xpCurrent: 90, xpRequired: 100 },
    { userId: alexId, nodeId: nodeByName["State Management"], currentLevel: "apprentice", xpCurrent: 45, xpRequired: 100 },
    { userId: alexId, nodeId: nodeByName["Frontend Testing"], currentLevel: "journeyman", xpCurrent: 50, xpRequired: 100 }
  );

  // learner01 (Maya Rodriguez) -- beginner, only 2 nodes unlocked
  const l01 = learnerById["learner01"];
  masteryRecords.push(
    { userId: l01, nodeId: nodeByName["Web Fundamentals"], currentLevel: "novice", xpCurrent: 30, xpRequired: 100 },
    { userId: l01, nodeId: nodeByName["HTML & CSS"], currentLevel: "novice", xpCurrent: 10, xpRequired: 100 }
  );

  // learner05, learner06, learner07 -- stuck on Database (stale 14+ days ago)
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - 18);

  for (const key of ["learner05", "learner06", "learner07"]) {
    const uid = learnerById[key];
    masteryRecords.push(
      { userId: uid, nodeId: nodeByName["Web Fundamentals"], currentLevel: "apprentice", xpCurrent: 60, xpRequired: 100 },
      { userId: uid, nodeId: nodeByName["Node.js"], currentLevel: "apprentice", xpCurrent: 55, xpRequired: 100 },
      { userId: uid, nodeId: nodeByName["Databases"], currentLevel: "novice", xpCurrent: 15, xpRequired: 100, lastActivityAt: staleDate }
    );
  }

  // Remaining learners with varied progression
  // learner02 -- Frontend focused, mid-level
  const l02 = learnerById["learner02"];
  masteryRecords.push(
    { userId: l02, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 75, xpRequired: 100 },
    { userId: l02, nodeId: nodeByName["HTML & CSS"], currentLevel: "journeyman", xpCurrent: 65, xpRequired: 100 },
    { userId: l02, nodeId: nodeByName["JavaScript Basics"], currentLevel: "apprentice", xpCurrent: 40, xpRequired: 100 },
    { userId: l02, nodeId: nodeByName["React"], currentLevel: "novice", xpCurrent: 20, xpRequired: 100 }
  );

  // learner03 -- Backend focused
  const l03 = learnerById["learner03"];
  masteryRecords.push(
    { userId: l03, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 80, xpRequired: 100 },
    { userId: l03, nodeId: nodeByName["Node.js"], currentLevel: "journeyman", xpCurrent: 70, xpRequired: 100 },
    { userId: l03, nodeId: nodeByName["Databases"], currentLevel: "apprentice", xpCurrent: 45, xpRequired: 100 },
    { userId: l03, nodeId: nodeByName["REST APIs"], currentLevel: "novice", xpCurrent: 15, xpRequired: 100 }
  );

  // learner04 -- DevOps focused
  const l04 = learnerById["learner04"];
  masteryRecords.push(
    { userId: l04, nodeId: nodeByName["Web Fundamentals"], currentLevel: "apprentice", xpCurrent: 50, xpRequired: 100 },
    { userId: l04, nodeId: nodeByName["Git & Version Control"], currentLevel: "journeyman", xpCurrent: 70, xpRequired: 100 },
    { userId: l04, nodeId: nodeByName["CI/CD"], currentLevel: "apprentice", xpCurrent: 35, xpRequired: 100 }
  );

  // learner08 -- broad starter
  const l08 = learnerById["learner08"];
  masteryRecords.push(
    { userId: l08, nodeId: nodeByName["Web Fundamentals"], currentLevel: "apprentice", xpCurrent: 55, xpRequired: 100 },
    { userId: l08, nodeId: nodeByName["HTML & CSS"], currentLevel: "novice", xpCurrent: 25, xpRequired: 100 },
    { userId: l08, nodeId: nodeByName["Node.js"], currentLevel: "novice", xpCurrent: 20, xpRequired: 100 },
    { userId: l08, nodeId: nodeByName["Git & Version Control"], currentLevel: "novice", xpCurrent: 15, xpRequired: 100 }
  );

  // learner09 -- advanced backend
  const l09 = learnerById["learner09"];
  masteryRecords.push(
    { userId: l09, nodeId: nodeByName["Web Fundamentals"], currentLevel: "expert", xpCurrent: 92, xpRequired: 100 },
    { userId: l09, nodeId: nodeByName["Node.js"], currentLevel: "expert", xpCurrent: 85, xpRequired: 100 },
    { userId: l09, nodeId: nodeByName["Databases"], currentLevel: "journeyman", xpCurrent: 60, xpRequired: 100 },
    { userId: l09, nodeId: nodeByName["REST APIs"], currentLevel: "journeyman", xpCurrent: 55, xpRequired: 100 },
    { userId: l09, nodeId: nodeByName["Authentication"], currentLevel: "novice", xpCurrent: 20, xpRequired: 100 }
  );

  // learner10 -- Frontend mid
  const l10 = learnerById["learner10"];
  masteryRecords.push(
    { userId: l10, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 70, xpRequired: 100 },
    { userId: l10, nodeId: nodeByName["HTML & CSS"], currentLevel: "apprentice", xpCurrent: 40, xpRequired: 100 },
    { userId: l10, nodeId: nodeByName["JavaScript Basics"], currentLevel: "novice", xpCurrent: 15, xpRequired: 100 }
  );

  // learner11 -- DevOps advanced
  const l11 = learnerById["learner11"];
  masteryRecords.push(
    { userId: l11, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 72, xpRequired: 100 },
    { userId: l11, nodeId: nodeByName["Git & Version Control"], currentLevel: "expert", xpCurrent: 88, xpRequired: 100 },
    { userId: l11, nodeId: nodeByName["CI/CD"], currentLevel: "journeyman", xpCurrent: 58, xpRequired: 100 },
    { userId: l11, nodeId: nodeByName["Cloud Deployment"], currentLevel: "apprentice", xpCurrent: 30, xpRequired: 100 }
  );

  // learner12 -- early starter
  const l12 = learnerById["learner12"];
  masteryRecords.push(
    { userId: l12, nodeId: nodeByName["Web Fundamentals"], currentLevel: "novice", xpCurrent: 40, xpRequired: 100 }
  );

  // learner13 -- Full-stack progress
  const l13 = learnerById["learner13"];
  masteryRecords.push(
    { userId: l13, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 78, xpRequired: 100 },
    { userId: l13, nodeId: nodeByName["HTML & CSS"], currentLevel: "apprentice", xpCurrent: 50, xpRequired: 100 },
    { userId: l13, nodeId: nodeByName["Node.js"], currentLevel: "apprentice", xpCurrent: 42, xpRequired: 100 },
    { userId: l13, nodeId: nodeByName["Git & Version Control"], currentLevel: "apprentice", xpCurrent: 38, xpRequired: 100 }
  );

  // learner14 -- React focused
  const l14 = learnerById["learner14"];
  masteryRecords.push(
    { userId: l14, nodeId: nodeByName["Web Fundamentals"], currentLevel: "expert", xpCurrent: 90, xpRequired: 100 },
    { userId: l14, nodeId: nodeByName["HTML & CSS"], currentLevel: "expert", xpCurrent: 85, xpRequired: 100 },
    { userId: l14, nodeId: nodeByName["JavaScript Basics"], currentLevel: "journeyman", xpCurrent: 65, xpRequired: 100 },
    { userId: l14, nodeId: nodeByName["React"], currentLevel: "apprentice", xpCurrent: 35, xpRequired: 100 }
  );

  // learner15 -- backend mid
  const l15 = learnerById["learner15"];
  masteryRecords.push(
    { userId: l15, nodeId: nodeByName["Web Fundamentals"], currentLevel: "apprentice", xpCurrent: 55, xpRequired: 100 },
    { userId: l15, nodeId: nodeByName["Node.js"], currentLevel: "novice", xpCurrent: 25, xpRequired: 100 }
  );

  // learner16 -- active everywhere
  const l16 = learnerById["learner16"];
  masteryRecords.push(
    { userId: l16, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 68, xpRequired: 100 },
    { userId: l16, nodeId: nodeByName["HTML & CSS"], currentLevel: "apprentice", xpCurrent: 45, xpRequired: 100 },
    { userId: l16, nodeId: nodeByName["Node.js"], currentLevel: "novice", xpCurrent: 18, xpRequired: 100 },
    { userId: l16, nodeId: nodeByName["Git & Version Control"], currentLevel: "novice", xpCurrent: 22, xpRequired: 100 }
  );

  // learner17 -- early
  const l17 = learnerById["learner17"];
  masteryRecords.push(
    { userId: l17, nodeId: nodeByName["Web Fundamentals"], currentLevel: "novice", xpCurrent: 35, xpRequired: 100 },
    { userId: l17, nodeId: nodeByName["HTML & CSS"], currentLevel: "novice", xpCurrent: 8, xpRequired: 100 }
  );

  // learner18 -- DevOps path
  const l18 = learnerById["learner18"];
  masteryRecords.push(
    { userId: l18, nodeId: nodeByName["Web Fundamentals"], currentLevel: "apprentice", xpCurrent: 52, xpRequired: 100 },
    { userId: l18, nodeId: nodeByName["Git & Version Control"], currentLevel: "apprentice", xpCurrent: 40, xpRequired: 100 }
  );

  // learner19 -- Frontend & Backend
  const l19 = learnerById["learner19"];
  masteryRecords.push(
    { userId: l19, nodeId: nodeByName["Web Fundamentals"], currentLevel: "journeyman", xpCurrent: 73, xpRequired: 100 },
    { userId: l19, nodeId: nodeByName["HTML & CSS"], currentLevel: "journeyman", xpCurrent: 60, xpRequired: 100 },
    { userId: l19, nodeId: nodeByName["JavaScript Basics"], currentLevel: "apprentice", xpCurrent: 38, xpRequired: 100 },
    { userId: l19, nodeId: nodeByName["Node.js"], currentLevel: "apprentice", xpCurrent: 42, xpRequired: 100 }
  );

  // learner20 -- just started
  const l20 = learnerById["learner20"];
  masteryRecords.push(
    { userId: l20, nodeId: nodeByName["Web Fundamentals"], currentLevel: "novice", xpCurrent: 12, xpRequired: 100 }
  );

  await db.insert(userNodeMastery).values(masteryRecords);

  // ─── 8. Insert challenge submissions ──────────────────────────────────────
  console.log("Inserting challenge submissions...");

  const submissionData = [
    // 3 pending quiz submissions
    {
      userId: learnerById["learner02"],
      challengeId: findChallenge("React", "novice", "quiz"),
      status: "pending",
      response: { answers: [1, 1, 0] },
    },
    {
      userId: learnerById["learner03"],
      challengeId: findChallenge("REST APIs", "novice", "quiz"),
      status: "pending",
      response: { answers: [2, 0, 1] },
    },
    {
      userId: learnerById["learner08"],
      challengeId: findChallenge("Web Fundamentals", "novice", "quiz"),
      status: "pending",
      response: { answers: [0, 2, 1] },
    },
    // 2 project submissions in_review assigned to mentor
    {
      userId: alexId,
      challengeId: findChallenge("React", "journeyman", "project_submission"),
      status: "in_review",
      response: { url: "https://github.com/alexchen/todo-react-hooks" },
      mentorId: demoMentor.id,
    },
    {
      userId: learnerById["learner09"],
      challengeId: findChallenge("REST APIs", "journeyman", "project_submission"),
      status: "in_review",
      response: { url: "https://github.com/miajohansson/bookmarks-api" },
      mentorId: demoMentor.id,
    },
    // 2 completed (passed) submissions
    {
      userId: alexId,
      challengeId: findChallenge("JavaScript Basics", "apprentice", "quiz"),
      status: "passed",
      response: { answers: [1, 1, 2] },
      score: 85,
      mentorId: demoMentor.id,
      feedback: "Excellent understanding of closures and scope. Keep it up!",
      reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: learnerById["learner14"],
      challengeId: findChallenge("HTML & CSS", "apprentice", "quiz"),
      status: "passed",
      response: { answers: [2, 1, 2, 2] },
      score: 92,
      mentorId: demoMentor.id,
      feedback: "Great work on CSS layout concepts. Ready for more advanced topics.",
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    // 1 failed submission with feedback
    {
      userId: learnerById["learner05"],
      challengeId: findChallenge("Databases", "novice", "quiz"),
      status: "failed",
      response: { answers: [1, 0, 2] },
      score: 33,
      mentorId: demoMentor.id,
      feedback: "Review the SQL basics section again, particularly SELECT and WHERE clauses. The primary key concept needs more attention.",
      reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ];

  await db.insert(challengeSubmissions).values(submissionData);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log("\nSeed complete:");
  console.log(`  - 4 archetypes`);
  console.log(`  - 23 users (3 demo + 20 learners)`);
  console.log(`  - 15 skill nodes across 3 branches`);
  console.log(`  - 14 edges (DAG validated)`);
  console.log(`  - ${insertedChallenges.length} challenges`);
  console.log(`  - ${masteryRecords.length} mastery records`);
  console.log(`  - ${submissionData.length} challenge submissions`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

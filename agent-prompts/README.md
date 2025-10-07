# Ryan Carson's 3-File System for AI-Assisted Development

A structured approach to building production applications using AI coding assistants like Cursor, Claude, or similar tools.

## Overview

The 3-File System is a methodology designed to reduce bugs and errors when using AI to code. Instead of "vibe coding" without structure, this system uses three markdown files to create a systematic workflow that produces reliable, testable code.

## The Three Files

### 1. **create-prd.md** - Product Requirements Document
**Purpose:** Generate detailed technical specifications for your feature or project.

**What it does:**
- Creates comprehensive requirements with all necessary technical details
- Defines the scope, functionality, and acceptance criteria
- Serves as the single source of truth for what needs to be built

**When to use:** At the start of any new feature or significant change

---

### 2. **generate-tasks.md** - Task Breakdown
**Purpose:** Break the PRD into manageable, atomic tasks.

**What it does:**
- Decomposes the PRD into parent and child tasks
- Creates a linear, step-by-step execution plan
- Organizes work into small, focused units that AI can handle effectively

**When to use:** After completing the PRD and before starting implementation

---

### 3. **process-task-list.md** - Test-Driven Execution
**Purpose:** Execute tasks one at a time with automated tests.

**What it does:**
- Processes a single task from your task list
- Writes automated tests for each task before implementation
- Ensures code quality through test-driven development (TDD)

**When to use:** For each individual task during implementation

---

## The Workflow

```
1. Create PRD → 2. Generate Tasks → 3. Process Each Task (with tests) → Repeat step 3
```

### Step-by-Step Process:

1. **Start with Requirements**
   - Use `create-prd.md` to generate a detailed specification
   - Tag this file in your AI coding assistant
   - Review and refine the output

2. **Break Down into Tasks**
   - Use `generate-tasks.md` with your PRD
   - Get a structured list of parent and child tasks
   - Tasks should be small and atomic

3. **Execute with Tests**
   - Use `process-task-list.md` for ONE task at a time
   - Write tests first, then implementation
   - Complete each task before moving to the next

## Why This System Works

**Reduces AI hallucinations:** By providing clear context and limiting scope to one task at a time

**Enforces best practices:** Test-driven development is built into the workflow

**Creates documentation:** PRDs and task lists serve as project documentation

**Enables iteration:** Small tasks make it easy to review, test, and adjust

**Prevents scope creep:** Linear progression through defined tasks keeps work focused

## Getting Started

1. Download the three template files from [Ryan Carson's GitHub repo](https://github.com/ryancarson/ai-coding-workflow)
2. Place them in your project's `.prompts` or similar directory
3. Configure your AI coding assistant to recognize these files
4. Start with a small feature to learn the workflow

## Best Practices

- **One task at a time:** Don't try to process multiple tasks simultaneously
- **Start small:** Begin with simple features to get comfortable with the system
- **Review AI output:** Always review generated code and tests
- **Commit after tasks:** Commit your code after completing each significant task
- **Iterate on prompts:** Refine the template files to match your team's needs

## Resources

- **Original GitHub Repo:** [github.com/ryancarson/ai-coding-workflow](https://github.com/ryancarson/ai-coding-workflow) (5,000+ stars)
- **Full Tutorial:** [Watch Ryan's interview](https://youtu.be/C5USs51zYu8)
- **Article:** [Read the full breakdown](https://creatoreconomy.so/p/full-tutorial-a-proven-3-file-system-to-vibe-code-production-apps-ryan)

## Questions?

This system is designed to be simple but powerful. Start with small features, get comfortable with the workflow, and gradually take on more complex tasks.

---

*Based on Ryan Carson's proven methodology for building production apps with AI assistance*
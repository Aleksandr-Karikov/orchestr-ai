# Memory Bank - Main Entry Point

Welcome to the Memory Bank! This is the central navigation hub for understanding and working with this project.

## 🗺️ Navigation Guide

### Core Documents (Start Here)

- **[Product Brief](./product_brief.md)** - The WHY: Project vision, goals, and business context
- **[Architecture Design](./architecture_design.md)** - The HOW: High-level system design and components
- **[Tech Stack](./tech_stack.md)** - Technology choices, versions, and rules
- **[Project Context](./project_context.md)** - Quick onboarding and key context
- **[Current Tasks](./current_tasks.md)** - Live project status and active work

### Specialized Sections

#### 📐 Patterns (`/patterns/`)

Key architectural decisions and design patterns:

- [Data Ingestion Flow](./patterns/data_ingestion_flow.md) - How data flows through the system
- [Contract Analysis Rules](./patterns/contract_analysis_rules.md) - Rules for analyzing contracts/APIs
- [Graph Storage Schema](./patterns/graph_storage_schema.md) - Database schema and data modeling

#### 📚 Guides (`/guides/`)

Step-by-step guides for common tasks:

- [Adding New Language](./guides/adding_new_language.md) - How to add support for a new programming language
- [API Extraction Guide](./guides/api_extraction_guide.md) - Extracting and documenting APIs
- [Visualization Engine](./guides/visualization_engine.md) - Working with the visualization system

#### 📋 Specs (`/specs/`)

Technical specifications and requirements:

- [MVP Spec Phase 1](./specs/mvp_spec_phase_1.md) - Minimum viable product specifications
- [LLM Integration Plan](./specs/llm_integration_plan.md) - Future AI/LLM integration strategy
- [Architecture Review & Recommendations](./architecture_review_and_recommendations.md) - Review feedback and improvement suggestions

#### 🔄 Workflows (`/workflows/`)

Agent instructions for specific processes:

- [New Service Analysis](./workflows/new_service_analysis.md) - How to analyze a new service
- [Breaking Change Check](./workflows/breaking_change_check.md) - Process for detecting breaking changes

## 🚀 Quick Start

1. **New to the project?** → Start with [Project Context](./project_context.md)
2. **Understanding the system?** → Read [Architecture Design](./architecture_design.md)
3. **Need to implement something?** → Check [Current Tasks](./current_tasks.md) and relevant [Guides](./guides/)
4. **Making architectural decisions?** → Review [Patterns](./patterns/)

## 🔗 Cross-Reference Map

```
README.md (you are here)
├── product_brief.md
├── architecture_design.md → patterns/, guides/
├── tech_stack.md
├── current_tasks.md → workflows/, specs/
├── project_context.md → architecture_design.md, tech_stack.md
├── patterns/
│   ├── data_ingestion_flow.md → architecture_design.md
│   ├── contract_analysis_rules.md → guides/api_extraction_guide.md
│   └── graph_storage_schema.md → architecture_design.md
├── guides/
│   ├── adding_new_language.md → tech_stack.md, patterns/
│   ├── api_extraction_guide.md → patterns/contract_analysis_rules.md
│   └── visualization_engine.md → architecture_design.md
├── specs/
│   ├── mvp_spec_phase_1.md → architecture_design.md, current_tasks.md
│   └── llm_integration_plan.md → architecture_design.md, patterns/
└── workflows/
    ├── new_service_analysis.md → guides/, patterns/
    └── breaking_change_check.md → patterns/contract_analysis_rules.md
```

## 📝 Maintenance

This memory bank should be kept up-to-date as the project evolves. When making significant changes:

1. Update relevant documentation files
2. Update cross-references if structure changes
3. Update [Current Tasks](./current_tasks.md) to reflect progress

---

_Last updated: [Auto-update on changes]_

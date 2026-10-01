# 📘 Development Rules

**MineralInsight – Project Guidelines for AI & Human Collaborators**

This document defines the development rules, coding standards, and best practices for the **MineralInsight** application. These rules ensure consistency, maintainability, security, and quality. Both AI assistants and human contributors must follow these guidelines.

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritise simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.
- ✅ Never commit secrets — `.env`, `.env.local`, DB URLs, and JWT secrets stay out of Git.
- ✅ Verify with `tsc --noEmit` (0 errors) before considering backend work done.

---

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style:

| Standard | Rule |
| --- | --- |
| 🟦 Language | Use TypeScript everywhere. Avoid `any` unless absolutely necessary. |
| ⚙️ Backend | Follow Express best practices: routes → middleware → controllers → services. |
| ⚛️ Frontend | Use React function components + hooks. Data fetching via react-query hooks in `hooks/`. |
| 🎨 Styling | Use Tailwind CSS and follow the design system in [DESIGN.md](./DESIGN.md). No random hex values. |
| 🗄 Database | All schema changes via Knex migrations in `backend/src/database/migrations/`. Never edit schema manually. |
| 🌱 Seeds | Demo/reference data belongs in seed files `001–009`. Seeds must match what the frontend displays. |
| 🔌 API Contract | Responses use the `{ success, data }` envelope. New endpoints must be added to both Postman collections. |
| 🧯 Resilience | Redis & Socket.io integrations must be fail-soft — the API works without them. |
| 🧪 Linting | Follow ESLint configs in both `backend/` and `frontend/`. No new warnings. |
| 📐 Formatting | Use Prettier. Run `npm run format` before committing. |
| 📦 Dependencies | Use stable, well-maintained packages. Compile-time `@types/*` stay in `dependencies` (Render needs them at build). |
| 📄 File Naming | Use clear, consistent names: `PascalCase.tsx` for components, `camelCase.ts` for modules. |

---

## 3️⃣ Project Structure

Follow the defined folder structure in [ARCHITECTURE.md](./ARCHITECTURE.md). Keep the codebase organised:

- ✅ Reusable UI components go in `frontend/src/components/ui/` (shadcn primitives).
- ✅ Dashboard-specific widgets go in `frontend/src/components/dashboard/`.
- ✅ Page-level code stays in `frontend/src/pages/`; route additions update `App.tsx`.
- ✅ Server-state logic lives in custom hooks (`frontend/src/hooks/`), not inside components.
- ✅ API client and helpers live in `frontend/src/lib/` (`api.ts` owns the `{ success, data }` envelope).
- ✅ Backend business logic belongs in controllers/services — keep route files thin.
- ✅ Types and interfaces should be placed close to where they are used.
- ✅ Do not create new folders without a clear purpose — reuse the existing structure.

---

## 4️⃣ Git & Deployment Rules

- ✅ Commit messages should describe *why* the change was made.
- ✅ Do not push directly to `main` without verifying the build passes.
- ✅ Render build command is fixed: `npm install --include=dev && npm run build` — do not "simplify" it back to `npm install`.
- ✅ `tsc-alias` must run after `tsc` (Node cannot resolve `@/` imports in compiled output).
- ✅ Never set `NODE_ENV=production` in a way that skips devDependencies during install without `--include=dev`.
- ✅ Database migrations/seeds run via `npx tsx src/scripts/run-migrations.ts [migrate|seed|all|verify|rollback]`.
- ✅ Check `GET /health` after every backend deploy.

---

> 📌 Related docs: [PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DESIGN.md](./DESIGN.md)

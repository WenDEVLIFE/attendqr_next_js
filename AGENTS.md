<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Structure & Conventions

### Directory Roles
- **`src/app`**: Entry point, layouts, and initial routing logic (e.g., auth-based redirects).
- **`src/pages`**: Main application views and API routes (using the pages router).
- **`src/components`**: Shared UI components and layouts (e.g., `AdminLayout`, `Sidebar`).
- **`src/lib`**: External library configurations (e.g., Supabase client).
- **`src/services`**: Business logic, data fetching wrappers, and complex state management.
- **`src/hooks`**: Custom React hooks for shared logic.
- **`src/utils`**: Pure utility functions.
- **`src/assets`**: Static assets like icons and images.

### Tech Stack
- **Next.js 16.2.0** (Note the breaking changes in the docs).
- **Supabase** for database and authentication.
- **Tailwind CSS 4** for styling (prioritize utility-first modern design).
- **Framer Motion** for animations and page transitions.
- **Lucide React** for UI icons.

### Design Principles
- **Premium Modern Dark**: Use high-contrast dark themes with glassmorphism (`backdrop-blur-xl`), subtle gradients, and rounded corners (`rounded-3xl` for cards).
- **Animations**: Implement smooth, non-intrusive animations using Framer Motion and Tailwind's `animate-in`.
- **Consistency**: Use existing components like `AdminLayout` for all administrative pages.

---

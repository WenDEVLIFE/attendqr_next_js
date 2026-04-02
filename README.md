# AttendQR Next.js

A premium, modern attendance management system built with Next.js 16.2.0 and Supabase. This project features a high-fidelity dark UI with glassmorphism and smooth animations.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.2.0](https://nextjs.org/) (Custom build)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security**: [BcryptJS](https://github.com/dcodeIO/bcrypt.js)

## 📁 Project Structure

The project follows a modular architecture within the `src` directory:

- **`src/app`**: Root layouts, global styles, and initial routing logic (e.g., redirects).
- **`src/pages`**: Main application views (Admin Dashboard, Auth pages). Uses the Pages Router for view-specific logic.
- **`src/components`**: Reusable UI components (Layouts, Sidebars, Custom Buttons).
- **`src/hooks`**: Custom React hooks for shared state and side effects.
- **`src/services`**: Business logic and data fetching wrappers.
- **`src/lib`**: External library initializations (e.g., Supabase client).
- **`src/utils`**: Pure helper functions and constants.
- **`src/assets`**: Static assets like icons and images.

## 🛠️ Development

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design Principles

- **Glassmorphism**: Use `backdrop-blur-xl` and `bg-white/5` for a premium look.
- **Gradients**: Subtle white-to-transparent or colored gradients for depth.
- **Modern Typography**: Clean, high-contrast headings using Geist/Inter.
- **Smooth Transitions**: Integrated `animate-in` and Framer Motion for page entry.

---

For AI Agents: Refer to `AGENTS.md` for specific coding conventions and directory rules.

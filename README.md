# 🪟 Window Tiler Challenge

## 📌 Overview
The **Window Tiler** project is an interactive web application where users can drag, resize, and snap windows inside a workspace.  
The main goal is to implement **drag interactivity** and handle **data structures** to manage multiple windows efficiently.

---

## 🎯 Features
- Drag and drop windows smoothly.
- Snap windows to edges (left, right, top, bottom, corners).
- Resizable window layout.
- Data structure management for:
  - Tracking window state (position, size, snapped zone).
  - Updating UI dynamically.
- Clean and minimal UI for better usability.

---

## 🛠️ Tech Stack
- **React + TypeScript** → Frontend logic and UI.
- **TailwindCSS** → Styling and responsive design.
- **Framer Motion** → Smooth animations.
- **Custom Data Structures** → Manage window positions & snapping rules.

---

## 📂 Project Structure
```

window-tiler/
│── src/
│   ├── components/       # UI components (Window, Layout, etc.)
│   ├── hooks/            # Custom hooks for drag & snap logic
│   ├── types/            # TypeScript interfaces & types
│   ├── App.tsx           # Main application entry
│   └── index.tsx         # React entry point
│
│── public/               # Static files
│── package.json          # Dependencies & scripts
│── README.md             # Documentation (this file)


### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📸 Demo Preview

Users can drag windows, snap them to different zones, and resize them dynamically.

---

## 📖 How It Works

1. Each window is represented as a data object:

   ```ts
   interface WindowData {
     id: number;
     position: { x: number; y: number };
     snapped: SnapZone;
     size: { width: number; height: number };
   }
   ```
2. When user drags or resizes a window:

   * State updates dynamically.
   * Data structure ensures uniqueness & prevents overlap.
   * Snap logic adjusts final position.


Author
Fariha Afrin Tamanna

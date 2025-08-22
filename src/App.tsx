import React, { useState } from "react";

// Snap zone types
type SnapPosition =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "topleft"
  | "topright"
  | "bottomleft"
  | "bottomright"
  | null;

// Window data structure
interface Window {
  id: number;
  position: { x: number; y: number };
  snapPosition: SnapPosition;
  size: { width: number; height: number };
  color: string;
}

// Random color generator
const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

// Random position generator
const randomPosition = (width: number, height: number) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  return {
    x: Math.floor(Math.random() * (screenWidth - width)),
    y: Math.floor(Math.random() * (screenHeight - height)),
  };
};

// Snap zones definition
const SNAP_ZONES = [
  { name: "left", x: 0, y: 0, w: 0.5, h: 1 },
  { name: "right", x: 0.5, y: 0, w: 0.5, h: 1 },
  { name: "top", x: 0, y: 0, w: 1, h: 0.5 },
  { name: "bottom", x: 0, y: 0.5, w: 1, h: 0.5 },
  { name: "topleft", x: 0, y: 0, w: 0.5, h: 0.5 },
  { name: "topright", x: 0.5, y: 0, w: 0.5, h: 0.5 },
  { name: "bottomleft", x: 0, y: 0.5, w: 0.5, h: 0.5 },
  { name: "bottomright", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
];

const App: React.FC = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [draggingWindowId, setDraggingWindowId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showSnapZones, setShowSnapZones] = useState(false);
  const [hoveredSnapZone, setHoveredSnapZone] = useState<SnapPosition>(null);

  // Arrange windows in a snap zone
  const arrangeWindows = (snapZone: SnapPosition, allWindows: Window[]) => {
    const zone = SNAP_ZONES.find((z) => z.name === snapZone);
    if (!zone) return allWindows;

    const snappedWindows = allWindows.filter((w) => w.snapPosition === snapZone);
    if (snappedWindows.length === 0) return allWindows;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const zoneX = screenWidth * zone.x;
    const zoneY = screenHeight * zone.y;
    const zoneWidth = screenWidth * zone.w;
    const zoneHeight = screenHeight * zone.h;

    // Sides: allow multiple windows, divide zone
    let arranged: Window[];
    if (["left", "right"].includes(snapZone || "")) {
      const eachHeight = zoneHeight / snappedWindows.length;
      arranged = snappedWindows.map((win, i) => ({
        ...win,
        position: { x: zoneX, y: zoneY + i * eachHeight },
        size: { width: zoneWidth, height: eachHeight },
      }));
    } else if (["top", "bottom"].includes(snapZone || "")) {
      const eachWidth = zoneWidth / snappedWindows.length;
      arranged = snappedWindows.map((win, i) => ({
        ...win,
        position: { x: zoneX + i * eachWidth, y: zoneY },
        size: { width: eachWidth, height: zoneHeight },
      }));
    } else {
      // Corners: only one window per zone
      arranged = snappedWindows.map((win) => ({
        ...win,
        position: { x: zoneX, y: zoneY },
        size: { width: zoneWidth, height: zoneHeight },
      }));
    }

    return allWindows.map((w) => {
      const updatedWin = arranged.find((a) => a.id === w.id);
      return updatedWin || w;
    });
  };

  // Add new window
  const addNewWindow = () => {
    const width = 200;
    const height = 150;
    const pos = randomPosition(width, height);
    const newWindow: Window = {
      id: Date.now(),
      position: pos,
      snapPosition: null,
      size: { width, height },
      color: randomColor(),
    };
    setWindows([...windows, newWindow]);
  };

  // Close window
  const closeWindow = (id: number) => {
    const target = windows.find((w) => w.id === id);
    let updatedWindows = windows.filter((w) => w.id !== id);
    if (target?.snapPosition) {
      updatedWindows = arrangeWindows(target.snapPosition, updatedWindows);
    }
    setWindows(updatedWindows);
  };

  // Drag start
  const onDragStart = (e: React.MouseEvent, id: number) => {
    setDraggingWindowId(id);
    setShowSnapZones(true);
    const win = windows.find((w) => w.id === id);
    if (win) {
      setDragOffset({ x: e.clientX - win.position.x, y: e.clientY - win.position.y });
    }
  };

  // Drag end
  const onDragEnd = () => {
    if (draggingWindowId !== null && hoveredSnapZone) {
      let updated = windows.map((w) =>
        w.id === draggingWindowId ? { ...w, snapPosition: hoveredSnapZone } : w
      );
      updated = arrangeWindows(hoveredSnapZone, updated);
      setWindows(updated);
    }
    setDraggingWindowId(null);
    setShowSnapZones(false);
    setHoveredSnapZone(null);
  };

  // Mouse move during drag
  const onMouseMove = (e: React.MouseEvent) => {
    if (draggingWindowId === null) return;

    const margin = 40;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let zone: SnapPosition = null;
    if (e.clientX < margin && e.clientY < margin) zone = "topleft";
    else if (e.clientX > screenW - margin && e.clientY < margin) zone = "topright";
    else if (e.clientX < margin && e.clientY > screenH - margin) zone = "bottomleft";
    else if (e.clientX > screenW - margin && e.clientY > screenH - margin) zone = "bottomright";
    else if (e.clientX < margin) zone = "left";
    else if (e.clientX > screenW - margin) zone = "right";
    else if (e.clientY < margin) zone = "top";
    else if (e.clientY > screenH - margin) zone = "bottom";

    setHoveredSnapZone(zone);

    if (!zone) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setWindows(windows.map((w) =>
        w.id === draggingWindowId
          ? {
              ...w,
              position: { x: newX, y: newY },
              snapPosition: null,
              size: { width: 200, height: 150 },
            }
          : w
      ));
    }
  };

  // Render snap zones
  const renderSnapZones = () => {
    if (!showSnapZones) return null;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return SNAP_ZONES.map((zone) => (
      <div
        key={zone.name}
        className="absolute border-2"
        style={{
          left: screenWidth * zone.x,
          top: screenHeight * zone.y,
          width: screenWidth * zone.w,
          height: screenHeight * zone.h,
          borderColor: hoveredSnapZone === zone.name ? "cyan" : "transparent",
          background: hoveredSnapZone === zone.name
            ? "rgba(0,255,255,0.15)"
            : "rgba(0,0,0,0.05)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />
    ));
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={onDragEnd}
    >
      {renderSnapZones()}

      {/* Add window button */}
      <button
        onClick={addNewWindow}
        className="fixed bottom-6 right-6 px-4 py-2 bg-purple-600 text-white rounded shadow"
      >
        +
      </button>

      {/* Render windows */}
      {windows.map((win, i) => (
        <div
          key={win.id}
          className="absolute border shadow-md"
          style={{
            left: win.position.x,
            top: win.position.y,
            width: win.size.width,
            height: win.size.height,
            background: win.color,
            zIndex: 100,
            transition: win.snapPosition ? "all 0.2s" : undefined,
          }}
        >
          {/* Window bar */}
          <div
            className="flex justify-between items-center px-2 py-1 bg-gray-800 text-white cursor-move"
            onMouseDown={(e) => onDragStart(e, win.id)}
          >
            <span>Window {i + 1}</span>
            <button
              onClick={() => closeWindow(win.id)}
              className="bg-red-500 px-2 py-0.5 rounded text-sm"
            >
              ×
            </button>
          </div>
          {/* Window content */}
          <div className="p-2 text-lg">Node {i + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default App;
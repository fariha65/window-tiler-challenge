import React, { useState } from "react";

// Window ta screen er kon dike snap hote pare ta bole
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

// Prottek window er data structure
interface Window {
  id: number;
  position: { x: number; y: number };
  snapPosition: SnapPosition;
  size: { width: number; height: number };
  color: string;
}

// Random color banano function
const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

// Random position banano screen size ar window size onujayi
const randomPosition = (width: number, height: number) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  return {
    x: Math.floor(Math.random() * (screenWidth - width)),
    y: Math.floor(Math.random() * (screenHeight - height)),
  };
};

// Snap zone gula define kora holo screen er relative part hisebe
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
  // Sob window er data ekhane thakbe
  const [windows, setWindows] = useState<Window[]>([]);
  // Je window drag hocche tar id ekhane thakbe
  const [draggingWindowId, setDraggingWindowId] = useState<number | null>(null);
  // Mouse ar window er moddher distance (dragging somoy)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Drag korle snap zones show korar jonno
  const [showSnapZones, setShowSnapZones] = useState(false);
  // Mouse kon snap zone er upor ase drag er somoy
  const [hoveredSnapZone, setHoveredSnapZone] = useState<SnapPosition>(null);

  // Snap zone onujayi sob window gulo re-arrange korar function
  const arrangeWindows = (snapZone: SnapPosition, allWindows: Window[]) => {
    // Je snap zone ta dibe oi info ber koro
    const zone = SNAP_ZONES.find((z) => z.name === snapZone);
    if (!zone) return allWindows;

    // Oi snap zone e je window gulo ache tader list koro
    const snappedWindows = allWindows.filter((w) => w.snapPosition === snapZone);
    if (snappedWindows.length === 0) return allWindows;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Snap zone er absolute position and size ber koro
    const zoneX = screenWidth * zone.x;
    const zoneY = screenHeight * zone.y;
    const zoneWidth = screenWidth * zone.w;
    const zoneHeight = screenHeight * zone.h;

    // Sob window equal height pabe, width full zone er width
    const eachHeight = zoneHeight / snappedWindows.length;
    const eachWidth = zoneWidth;

    // Sob window er position o size update koro
    const arranged = snappedWindows.map((win, i) => ({
      ...win,
      position: {
        x: zoneX,
        y: zoneY + i * eachHeight,
      },
      size: { width: eachWidth, height: eachHeight },
    }));

    // Sob window er updated list return koro
    return allWindows.map((w) => {
      const updatedWin = arranged.find((a) => a.id === w.id);
      return updatedWin || w;
    });
  };

  // Notun window add korar function
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

  // Window close korar function
  const closeWindow = (id: number) => {
    // Agei jei window close kortesi ta ber koro
    const target = windows.find((w) => w.id === id);
    // Je window close korbo sheta bad diye baki gulo rekhe dao
    let updatedWindows = windows.filter((w) => w.id !== id);
    // Jodi oi window snap kora thake tahole snap layout abar update koro
    if (target?.snapPosition) {
      updatedWindows = arrangeWindows(target.snapPosition, updatedWindows);
    }
    setWindows(updatedWindows);
  };

  // Drag start korar function (mouse down)
  const onDragStart = (e: React.MouseEvent, id: number) => {
    setDraggingWindowId(id);
    setShowSnapZones(true);
    const win = windows.find((w) => w.id === id);
    if (win) {
      setDragOffset({ x: e.clientX - win.position.x, y: e.clientY - win.position.y });
    }
  };

  // Drag sesh korar function (mouse up)
  const onDragEnd = () => {
    if (draggingWindowId !== null && hoveredSnapZone) {
      // Drag kora window ke snap zone e set koro
      let updated = windows.map((w) =>
        w.id === draggingWindowId ? { ...w, snapPosition: hoveredSnapZone } : w
      );
      // Layout update koro snap zone onujayi
      updated = arrangeWindows(hoveredSnapZone, updated);
      setWindows(updated);
    }
    setDraggingWindowId(null);
    setShowSnapZones(false);
    setHoveredSnapZone(null);
  };

  // Mouse move function drag somoy window move korar jonno
  const onMouseMove = (e: React.MouseEvent) => {
    if (draggingWindowId === null) return;

    const margin = 40;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Mouse kothay ase (snap zone detect kora)
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

    // Jodi kono snap zone na thake tahole free move koro
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

  // Screen e snap zone gula highlight korar jonno div create kora hocche
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

      {/* Notun window add korar button */}
      <button
        onClick={addNewWindow}
        className="fixed bottom-6 right-6 px-4 py-2 bg-purple-600 text-white rounded shadow"
      >
        +
      </button>

      {/* Sob window render kora hocche */}
      {windows.map((win, i) => (
        <div
          key={win.id}
          className="absolute border shadow-md"git remote add submission ssh://git@git.innovation-at-pathao.com:12004/submission_03eft3b2pjwi7197xcsa2mzh5_window-tiler.git

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
          {/* Window er title bar jekhane drag o close button ache */}
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

          {/* Window er content */}
          <div className="p-2 text-lg">Node {i + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default App;

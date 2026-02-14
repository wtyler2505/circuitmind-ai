import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── Constants ───
const GRID = 10;
const SNAP = (v) => Math.round(v / GRID) * GRID;
const PIN_COLORS = {
  power: "#e74c3c", ground: "#7f8c8d", digital: "#3498db",
  analog: "#9b59b6", bus: "#e67e22", nc: "#4a5568", signal: "#2ecc71",
};
const PACKAGE_TYPES = [
  "DIP", "SOP", "QFP", "QFN", "BGA", "SOT-23", "TO-220", "TO-92",
  "SOIC", "TSSOP", "0402", "0603", "0805", "1206", "custom",
];
const COMP_TYPES = [
  "microcontroller", "sensor", "actuator", "passive", "connector",
  "power", "ic", "discrete", "module", "other",
];

// ─── Preset Library (detailed, accurate components) ───
const PRESETS = {
  "arduino-nano": {
    name: "Arduino Nano", description: "ATmega328P-based dev board with USB Mini-B",
    type: "microcontroller", package: "DIP", manufacturer: "Arduino", partNumber: "A000005",
    datasheetUrl: "https://docs.arduino.cc/hardware/nano",
    tags: ["arduino", "atmega328p", "dev-board", "usb"],
    width: 180, height: 70,
    shapes: [
      { id: "pcb", type: "rect", x: 0, y: 0, w: 180, h: 70, fill: "#1a5c3a", stroke: "#0d3321", strokeWidth: 2, rx: 3 },
      { id: "ic", type: "rect", x: 60, y: 20, w: 44, h: 30, fill: "#1a1a2e", stroke: "#333", strokeWidth: 1, rx: 1 },
      { id: "notch", type: "circle", x: 60, y: 35, r: 4, fill: "none", stroke: "#555", strokeWidth: 1 },
      { id: "usb", type: "rect", x: -4, y: 18, w: 18, h: 34, fill: "#c0c0c0", stroke: "#888", strokeWidth: 1.5, rx: 2 },
      { id: "usb-inner", type: "rect", x: 0, y: 24, w: 10, h: 22, fill: "#2a2a2a", stroke: "none", strokeWidth: 0, rx: 1 },
      { id: "xtal", type: "rect", x: 115, y: 28, w: 14, h: 8, fill: "#c0c0c0", stroke: "#999", strokeWidth: 0.5, rx: 1 },
      { id: "reset", type: "circle", x: 40, y: 35, r: 5, fill: "#c0c0c0", stroke: "#888", strokeWidth: 1 },
      { id: "led-pwr", type: "circle", x: 30, y: 15, r: 3, fill: "#2ecc71", stroke: "none", strokeWidth: 0 },
      { id: "led-tx", type: "circle", x: 42, y: 15, r: 2.5, fill: "#e74c3c", stroke: "none", strokeWidth: 0 },
      { id: "led-rx", type: "circle", x: 50, y: 15, r: 2.5, fill: "#2ecc71", stroke: "none", strokeWidth: 0 },
      { id: "label", type: "text", x: 90, y: 12, text: "NANO", fill: "#ffffff55", fontSize: 7 },
    ],
    pins: [
      { id: "D13", label: "D13", fn: "digital", type: "through-hole", x: 10, y: 0, side: "top" },
      { id: "3V3", label: "3V3", fn: "power", type: "through-hole", x: 20, y: 0, side: "top" },
      { id: "AREF", label: "AREF", fn: "analog", type: "through-hole", x: 30, y: 0, side: "top" },
      { id: "A0", label: "A0", fn: "analog", type: "through-hole", x: 40, y: 0, side: "top" },
      { id: "A1", label: "A1", fn: "analog", type: "through-hole", x: 50, y: 0, side: "top" },
      { id: "A2", label: "A2", fn: "analog", type: "through-hole", x: 60, y: 0, side: "top" },
      { id: "A3", label: "A3", fn: "analog", type: "through-hole", x: 70, y: 0, side: "top" },
      { id: "A4", label: "A4", fn: "analog", type: "through-hole", x: 80, y: 0, side: "top" },
      { id: "A5", label: "A5", fn: "analog", type: "through-hole", x: 90, y: 0, side: "top" },
      { id: "A6", label: "A6", fn: "analog", type: "through-hole", x: 100, y: 0, side: "top" },
      { id: "A7", label: "A7", fn: "analog", type: "through-hole", x: 110, y: 0, side: "top" },
      { id: "5V", label: "5V", fn: "power", type: "through-hole", x: 120, y: 0, side: "top" },
      { id: "RST1", label: "RST", fn: "digital", type: "through-hole", x: 130, y: 0, side: "top" },
      { id: "GND1", label: "GND", fn: "ground", type: "through-hole", x: 140, y: 0, side: "top" },
      { id: "VIN", label: "VIN", fn: "power", type: "through-hole", x: 150, y: 0, side: "top" },
      { id: "D12", label: "D12", fn: "digital", type: "through-hole", x: 10, y: 70, side: "bottom" },
      { id: "D11", label: "D11", fn: "digital", type: "through-hole", x: 20, y: 70, side: "bottom" },
      { id: "D10", label: "D10", fn: "digital", type: "through-hole", x: 30, y: 70, side: "bottom" },
      { id: "D9", label: "D9", fn: "digital", type: "through-hole", x: 40, y: 70, side: "bottom" },
      { id: "D8", label: "D8", fn: "digital", type: "through-hole", x: 50, y: 70, side: "bottom" },
      { id: "D7", label: "D7", fn: "digital", type: "through-hole", x: 60, y: 70, side: "bottom" },
      { id: "D6", label: "D6", fn: "digital", type: "through-hole", x: 70, y: 70, side: "bottom" },
      { id: "D5", label: "D5", fn: "digital", type: "through-hole", x: 80, y: 70, side: "bottom" },
      { id: "D4", label: "D4", fn: "digital", type: "through-hole", x: 90, y: 70, side: "bottom" },
      { id: "D3", label: "D3", fn: "digital", type: "through-hole", x: 100, y: 70, side: "bottom" },
      { id: "D2", label: "D2", fn: "digital", type: "through-hole", x: 110, y: 70, side: "bottom" },
      { id: "GND2", label: "GND", fn: "ground", type: "through-hole", x: 120, y: 70, side: "bottom" },
      { id: "RST2", label: "RST", fn: "digital", type: "through-hole", x: 130, y: 70, side: "bottom" },
      { id: "RX", label: "RX/D0", fn: "digital", type: "through-hole", x: 140, y: 70, side: "bottom" },
      { id: "TX", label: "TX/D1", fn: "digital", type: "through-hole", x: 150, y: 70, side: "bottom" },
    ],
  },
  "led-5mm": {
    name: "LED 5mm", description: "Standard 5mm through-hole LED, diffused red",
    type: "discrete", package: "custom", manufacturer: "", partNumber: "",
    datasheetUrl: "", tags: ["led", "indicator", "through-hole"],
    width: 50, height: 60,
    shapes: [
      { id: "lens", type: "circle", x: 25, y: 22, r: 18, fill: "#e74c3c33", stroke: "#e74c3c88", strokeWidth: 2 },
      { id: "glow", type: "circle", x: 25, y: 22, r: 10, fill: "#e74c3c55", stroke: "none", strokeWidth: 0 },
      { id: "hot", type: "circle", x: 25, y: 20, r: 4, fill: "#e74c3c99", stroke: "none", strokeWidth: 0 },
      { id: "flat", type: "line", x1: 8, y1: 38, x2: 42, y2: 38, stroke: "#e74c3c66", strokeWidth: 2 },
      { id: "lead-a", type: "line", x1: 20, y1: 38, x2: 20, y2: 58, stroke: "#c0c0c0", strokeWidth: 1.5 },
      { id: "lead-k", type: "line", x1: 30, y1: 38, x2: 30, y2: 55, stroke: "#c0c0c0", strokeWidth: 1.5 },
    ],
    pins: [
      { id: "anode", label: "A (+)", fn: "power", type: "through-hole", x: 20, y: 58, side: "bottom" },
      { id: "cathode", label: "K (−)", fn: "ground", type: "through-hole", x: 30, y: 55, side: "bottom" },
    ],
  },
  "resistor-10k": {
    name: "10kΩ Resistor", description: "1/4W carbon film — Brown Black Orange Gold",
    type: "passive", package: "custom", manufacturer: "", partNumber: "",
    datasheetUrl: "", tags: ["resistor", "passive", "10k", "through-hole"],
    width: 90, height: 28,
    shapes: [
      { id: "lead-l", type: "line", x1: 0, y1: 14, x2: 18, y2: 14, stroke: "#c0c0c0", strokeWidth: 1.5 },
      { id: "body", type: "rect", x: 18, y: 4, w: 54, h: 20, fill: "#d4a574", stroke: "#b8956a", strokeWidth: 1, rx: 10 },
      { id: "lead-r", type: "line", x1: 72, y1: 14, x2: 90, y2: 14, stroke: "#c0c0c0", strokeWidth: 1.5 },
      { id: "b1", type: "rect", x: 26, y: 4, w: 4, h: 20, fill: "#8B4513", stroke: "none", strokeWidth: 0, rx: 0 },
      { id: "b2", type: "rect", x: 34, y: 4, w: 4, h: 20, fill: "#1a1a1a", stroke: "none", strokeWidth: 0, rx: 0 },
      { id: "b3", type: "rect", x: 42, y: 4, w: 4, h: 20, fill: "#e67e22", stroke: "none", strokeWidth: 0, rx: 0 },
      { id: "b4", type: "rect", x: 56, y: 4, w: 4, h: 20, fill: "#d4a017", stroke: "none", strokeWidth: 0, rx: 0 },
    ],
    pins: [
      { id: "lead1", label: "1", fn: "signal", type: "through-hole", x: 0, y: 14, side: "left" },
      { id: "lead2", label: "2", fn: "signal", type: "through-hole", x: 90, y: 14, side: "right" },
    ],
  },
  "esp32-devkit": {
    name: "ESP32-S3 DevKit", description: "Espressif ESP32-S3 with WiFi + BLE",
    type: "microcontroller", package: "DIP", manufacturer: "Espressif", partNumber: "ESP32-S3-DevKitC-1",
    datasheetUrl: "https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/",
    tags: ["esp32", "wifi", "bluetooth", "iot"],
    width: 200, height: 80,
    shapes: [
      { id: "pcb", type: "rect", x: 0, y: 0, w: 200, h: 80, fill: "#1a1a2e", stroke: "#2d2d4a", strokeWidth: 2, rx: 3 },
      { id: "wifi", type: "rect", x: 6, y: 6, w: 36, h: 30, fill: "#c0c0c0", stroke: "#999", strokeWidth: 1, rx: 2 },
      { id: "antenna", type: "rect", x: 6, y: 0, w: 20, h: 8, fill: "#1a1a2e", stroke: "#ffd700", strokeWidth: 1.5, rx: 1 },
      { id: "usbc", type: "rect", x: 185, y: 28, w: 18, h: 24, fill: "#c0c0c0", stroke: "#888", strokeWidth: 1.5, rx: 3 },
      { id: "soc", type: "rect", x: 70, y: 22, w: 36, h: 36, fill: "#0a0a15", stroke: "#444", strokeWidth: 0.5, rx: 0 },
      { id: "soc-label", type: "text", x: 76, y: 44, text: "S3", fill: "#ffffff44", fontSize: 8 },
      { id: "boot", type: "rect", x: 130, y: 32, w: 10, h: 8, fill: "#f5f5dc", stroke: "#999", strokeWidth: 0.5, rx: 1 },
      { id: "rst", type: "rect", x: 150, y: 32, w: 10, h: 8, fill: "#f5f5dc", stroke: "#999", strokeWidth: 0.5, rx: 1 },
      { id: "led-pwr", type: "circle", x: 170, y: 20, r: 2.5, fill: "#2ecc71", stroke: "none", strokeWidth: 0 },
    ],
    pins: (() => {
      const l = ["3V3","EN","4","5","6","7","15","16","17","18","8","19","20","3V3.1","RST","5V","GND1","TX","RX","GND2"];
      const r = ["43","44","1","2","42","41","40","39","38","37","36","35","0","45","46","9","10","11","12","13"];
      const fl = ["power","digital","digital","digital","digital","digital","digital","digital","digital","digital","digital","digital","digital","power","digital","power","ground","digital","digital","ground"];
      return [
        ...l.map((lb, i) => ({ id: `L${i}`, label: lb, fn: fl[i], type: "through-hole", x: 10 + i * 10, y: 0, side: "top" })),
        ...r.map((lb, i) => ({ id: `R${i}`, label: lb, fn: "digital", type: "through-hole", x: 10 + i * 10, y: 80, side: "bottom" })),
      ];
    })(),
  },
  blank: {
    name: "New Part", description: "", type: "other", package: "custom",
    manufacturer: "", partNumber: "", datasheetUrl: "", tags: [],
    width: 100, height: 60,
    shapes: [{ id: "body", type: "rect", x: 0, y: 0, w: 100, h: 60, fill: "#2a2a3e", stroke: "#4a4a6a", strokeWidth: 1.5, rx: 3 }],
    pins: [],
  },
};

// ─── SVG Renderers ───
function RenderShape({ shape, selected, onClick }) {
  const sel = selected ? { stroke: "#fbbf24", strokeWidth: Math.max(shape.strokeWidth || 1, 2), filter: "url(#sel-glow)" } : {};
  const click = (e) => { e.stopPropagation(); onClick?.(shape.id); };
  const base = { cursor: "pointer", ...sel };
  switch (shape.type) {
    case "rect": return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx||0} fill={shape.fill} stroke={sel.stroke||shape.stroke||"none"} strokeWidth={sel.strokeWidth||shape.strokeWidth||0} filter={sel.filter} onClick={click} style={{cursor:"pointer"}} />;
    case "circle": return <circle cx={shape.x} cy={shape.y} r={shape.r} fill={shape.fill} stroke={sel.stroke||shape.stroke||"none"} strokeWidth={sel.strokeWidth||shape.strokeWidth||0} filter={sel.filter} onClick={click} style={{cursor:"pointer"}} />;
    case "line": return <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={sel.stroke||shape.stroke||"#ccc"} strokeWidth={sel.strokeWidth||shape.strokeWidth||1} filter={sel.filter} onClick={click} style={{cursor:"pointer"}} />;
    case "text": return <text x={shape.x} y={shape.y} fill={shape.fill||"#ccc"} fontSize={shape.fontSize||10} fontFamily="'IBM Plex Mono',monospace" onClick={click} style={{cursor:"pointer",userSelect:"none"}} stroke={sel.stroke||"none"} strokeWidth={sel.stroke?0.5:0}>{shape.text}</text>;
    default: return null;
  }
}

function RenderPin({ pin, selected, onClick, showLabels }) {
  const color = PIN_COLORS[pin.fn] || PIN_COLORS.signal;
  return (
    <g onClick={(e) => { e.stopPropagation(); onClick?.(pin.id); }} style={{ cursor: "pointer" }}>
      {selected && <circle cx={pin.x} cy={pin.y} r={7} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.8} />}
      <circle cx={pin.x} cy={pin.y} r={4.5} fill="#c8a84e11" stroke="#c8a84e44" strokeWidth={0.5} />
      {pin.type === "smd" || pin.type === "pad" ? (
        <rect x={pin.x-3} y={pin.y-2} width={6} height={4} rx={0.5} fill={color} stroke="#000" strokeWidth={0.3} />
      ) : (
        <>
          <circle cx={pin.x} cy={pin.y} r={3.5} fill="#0a0a12" stroke={color} strokeWidth={1.5} />
          <circle cx={pin.x} cy={pin.y} r={1.2} fill={color} opacity={0.7} />
        </>
      )}
      {showLabels && (
        <text x={pin.x} y={pin.side === "bottom" ? pin.y + 12 : pin.y - 8} textAnchor="middle"
          fill="#c8ccd4" fontSize={5.5} fontFamily="'IBM Plex Mono',monospace"
          style={{ pointerEvents: "none", userSelect: "none" }}>
          {pin.label}
        </text>
      )}
    </g>
  );
}

// ─── Reusable Controls ───
const LBL = { fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 2 };
const INP = (sm) => ({
  width: "100%", padding: sm ? "3px 6px" : "5px 8px", borderRadius: 3,
  border: "1px solid #1e1e30", background: "#111119", color: "#c8ccd4",
  fontSize: sm ? 9 : 10, fontFamily: "'IBM Plex Mono',monospace", outline: "none",
});

function Field({ label, value, onChange, multiline, small }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={LBL}>{label}</label>
      {multiline ? <textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={2} style={{...INP(small), resize:"none"}} />
        : <input value={value||""} onChange={e=>onChange(e.target.value)} style={INP(small)} />}
    </div>
  );
}
function NumField({ label, value, onChange, small }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={LBL}>{label}</label>
      <input type="number" value={value??0} onChange={e=>onChange(parseFloat(e.target.value)||0)} style={INP(small)} />
    </div>
  );
}
function SelectField({ label, value, options, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={LBL}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={INP(false)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function ColorField({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={LBL}>{label}</label>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input type="color" value={value||"#000"} onChange={e=>onChange(e.target.value)}
          style={{ width: 20, height: 20, border: "1px solid #1e1e30", borderRadius: 3, padding: 0, cursor: "pointer" }} />
        <input value={value||""} onChange={e=>onChange(e.target.value)} style={{...INP(true), flex:1}} />
      </div>
    </div>
  );
}

// ─── Main ───
export default function FZPZStudio() {
  const [part, setPart] = useState({ ...PRESETS["arduino-nano"] });
  const [shapes, setShapes] = useState(PRESETS["arduino-nano"].shapes.map(s=>({...s})));
  const [pins, setPins] = useState(PRESETS["arduino-nano"].pins.map(p=>({...p})));
  const [activeView, setActiveView] = useState("breadboard");
  const [activeTool, setActiveTool] = useState("select");
  const [activePanel, setActivePanel] = useState("props");
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [zoom, setZoom] = useState(2.2);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [pan, setPan] = useState({ x: 60, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tagInput, setTagInput] = useState("");
  const [drawState, setDrawState] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    { role: "system", text: "FZPZ Design Assistant online. I can validate designs, auto-fill specs from datasheets, generate pinouts, and build PCB footprints." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const svgRef = useRef(null);
  const chatRef = useRef(null);

  const loadPreset = useCallback((key) => {
    const p = PRESETS[key]; if (!p) return;
    setPart({ name:p.name, description:p.description, type:p.type, package:p.package,
      manufacturer:p.manufacturer, partNumber:p.partNumber, datasheetUrl:p.datasheetUrl,
      tags:[...(p.tags||[])], width:p.width, height:p.height });
    setShapes(p.shapes.map(s=>({...s})));
    setPins(p.pins.map(q=>({...q})));
    setSelectedShape(null); setSelectedPin(null);
    setZoom(key==="led-5mm"?3.5:key==="resistor-10k"?3:2.2);
    setPan({ x: 60, y: 80 });
  }, []);

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current; if (!svg) return {x:0,y:0};
    const rect = svg.getBoundingClientRect();
    return { x: SNAP((e.clientX - rect.left) / zoom - pan.x), y: SNAP((e.clientY - rect.top) / zoom - pan.y) };
  }, [zoom, pan]);

  const handleCanvasClick = useCallback((e) => {
    if (activeTool === "select" || activeTool === "pan") { setSelectedShape(null); setSelectedPin(null); return; }
    const {x, y} = getSVGCoords(e);
    if (activeTool === "pin") {
      setPins(prev => [...prev, { id: `pin${Date.now()}`, label: `P${prev.length+1}`, fn: "digital", type: "through-hole", x, y, side: "top" }]);
      setActiveTool("select");
    } else if (activeTool === "rect") {
      if (!drawState) { setDrawState({x,y}); }
      else {
        const w=Math.max(10,Math.abs(x-drawState.x)), h=Math.max(10,Math.abs(y-drawState.y));
        setShapes(prev=>[...prev,{id:`s${Date.now()}`,type:"rect",x:Math.min(x,drawState.x),y:Math.min(y,drawState.y),w,h,fill:"#2a2a3e",stroke:"#4a4a6a",strokeWidth:1,rx:2}]);
        setDrawState(null); setActiveTool("select");
      }
    } else if (activeTool === "circle") {
      setShapes(prev=>[...prev,{id:`s${Date.now()}`,type:"circle",x,y,r:15,fill:"#2a2a3e",stroke:"#4a4a6a",strokeWidth:1}]);
      setActiveTool("select");
    } else if (activeTool === "line") {
      if (!drawState) { setDrawState({x,y}); }
      else {
        setShapes(prev=>[...prev,{id:`s${Date.now()}`,type:"line",x1:drawState.x,y1:drawState.y,x2:x,y2:y,stroke:"#c0c0c0",strokeWidth:1.5}]);
        setDrawState(null); setActiveTool("select");
      }
    } else if (activeTool === "text") {
      setShapes(prev=>[...prev,{id:`s${Date.now()}`,type:"text",x,y,text:"Label",fill:"#e2e8f0",fontSize:10}]);
      setActiveTool("select");
    }
  }, [activeTool, drawState, getSVGCoords]);

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.button===1 || (e.button===0 && activeTool==="pan")) {
      e.preventDefault(); setIsPanning(true);
      setPanStart({ x:e.clientX-pan.x*zoom, y:e.clientY-pan.y*zoom });
    }
  }, [activeTool, pan, zoom]);
  const handleMouseMove = useCallback((e) => {
    if (isPanning) setPan({ x:(e.clientX-panStart.x)/zoom, y:(e.clientY-panStart.y)/zoom });
  }, [isPanning, panStart, zoom]);
  const handleMouseUp = useCallback(()=>setIsPanning(false), []);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k==="v") setActiveTool("select");
      else if (k==="r") setActiveTool("rect");
      else if (k==="c") setActiveTool("circle");
      else if (k==="l") setActiveTool("line");
      else if (k==="t") setActiveTool("text");
      else if (k==="n") setActiveTool("pin");
      else if (k==="h") setActiveTool("pan");
      else if (k==="="||k==="+") setZoom(z=>Math.min(6,z+0.3));
      else if (k==="-") setZoom(z=>Math.max(0.5,z-0.3));
      else if (k==="g") setShowGrid(g=>!g);
      else if (k==="delete"||k==="backspace") {
        if (selectedShape) { setShapes(p=>p.filter(s=>s.id!==selectedShape)); setSelectedShape(null); }
        else if (selectedPin) { setPins(p=>p.filter(q=>q.id!==selectedPin)); setSelectedPin(null); }
      }
    };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  }, [selectedShape, selectedPin]);

  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[aiMessages]);

  const selShape = useMemo(()=>shapes.find(s=>s.id===selectedShape),[shapes,selectedShape]);
  const selPin = useMemo(()=>pins.find(p=>p.id===selectedPin),[pins,selectedPin]);

  const updateShape = useCallback((id,k,v)=>setShapes(p=>p.map(s=>s.id===id?{...s,[k]:v}:s)),[]);
  const updatePin = useCallback((id,k,v)=>setPins(p=>p.map(q=>q.id===id?{...q,[k]:v}:q)),[]);

  // AI
  const sendAI = useCallback(()=>{
    if (!aiInput.trim()) return;
    const msg = aiInput.trim(); setAiMessages(p=>[...p,{role:"user",text:msg}]); setAiInput("");
    setTimeout(()=>{
      const lo = msg.toLowerCase();
      let resp;
      if (lo.includes("validate")||lo.includes("check")) {
        const issues=[], passed=[];
        if (!part.name||part.name==="New Part") issues.push("⚠ Part needs a real name");
        else passed.push("✓ Name: "+part.name);
        if (pins.length===0) issues.push("✗ No pins — add at least 2");
        else passed.push("✓ "+pins.length+" pins defined");
        if (pins.length>0&&!pins.some(p=>p.fn==="power")&&part.type!=="passive") issues.push("⚠ No power pin");
        if (pins.length>0&&!pins.some(p=>p.fn==="ground")&&part.type!=="passive") issues.push("⚠ No ground pin");
        if (shapes.length<=1) issues.push("⚠ Sparse shapes — add IC notch, polarity, etc.");
        else passed.push("✓ "+shapes.length+" shapes");
        if (!part.description) issues.push("⚠ Missing description");
        else passed.push("✓ Description set");
        resp = `── Validation ──\n\n${passed.join("\n")}\n\n${issues.length?issues.join("\n"):"No issues — ready to export."}`;
      } else if (lo.includes("fill")||lo.includes("spec")) {
        resp = `To smart-fill "${part.name}":\n\n→ smartFillComponent("${part.name}") — Gemini Flash + Google Search grounding\n→ findComponentSpecs("${part.name}") — datasheet extraction\n→ standardsService.getPackage("${part.package}") — IPC-7351 footprint\n\nThis populates: description, pins, package dims, manufacturer info.`;
      } else if (lo.includes("pinout")||lo.includes("pin")) {
        const byFn = pins.reduce((a,p)=>{a[p.fn]=(a[p.fn]||0)+1;return a;},{});
        resp = `── Pinout Analysis ──\n\n${pins.length} pins total:\n${Object.entries(byFn).map(([k,v])=>`  ${k}: ${v}`).join("\n")}\n\nAuto-generate would parse ${part.datasheetUrl||"(no datasheet URL)"} and map functions from the pin diagram.`;
      } else if (lo.includes("footprint")||lo.includes("pcb")) {
        resp = `PCB footprint for ${part.package}:\n\n→ standardsService.getPackage("${part.package}")\n→ Returns: body dims, pad geometry, courtyard\n→ IPC-7351B density levels: Most/Nominal/Least\n\nOutput: copper pads + silkscreen outline + courtyard.`;
      } else {
        resp = `Commands:\n• "validate" — check design completeness\n• "fill specs" — show smart-fill pipeline\n• "pinout" — analyze pin config\n• "footprint" — PCB generation info`;
      }
      setAiMessages(p=>[...p,{role:"assistant",text:resp}]);
    }, 500);
  },[aiInput,part,pins,shapes]);

  const fzpXml = useMemo(()=>{
    const slug = part.name.toLowerCase().replace(/\s+/g,'-');
    const conns = pins.map((p,i)=>
      `    <connector id="connector${i}" name="${p.label}" type="${p.type==='male'||p.type==='through-hole'?'male':'female'}">\n      <description>${p.fn} pin</description>\n      <views>\n        <breadboardView><p layer="breadboard" svgId="${p.id}"/></breadboardView>\n        <schematicView><p layer="schematic" svgId="${p.id}"/></schematicView>\n        <pcbView><p layer="copper0" svgId="${p.id}"/></pcbView>\n      </views>\n    </connector>`
    ).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<module fritzingVersion="0.9.10" moduleId="${slug}-${Date.now()}">\n  <title>${part.name}</title>\n  <description>${part.description||''}</description>\n  <tags>${(part.tags||[]).map(t=>`\n    <tag>${t}</tag>`).join("")}\n  </tags>\n  <properties>\n    <property name="package">${part.package}</property>${part.manufacturer?`\n    <property name="manufacturer">${part.manufacturer}</property>`:""}${part.partNumber?`\n    <property name="part-number">${part.partNumber}</property>`:""}\n  </properties>\n  <views>\n    <breadboardView><layers image="breadboard/${slug}_bb.svg"><layer layerId="breadboard"/></layers></breadboardView>\n    <schematicView><layers image="schematic/${slug}_schem.svg"><layer layerId="schematic"/></layers></schematicView>\n    <pcbView><layers image="pcb/${slug}_pcb.svg"><layer layerId="copper0"/><layer layerId="silkscreen"/></layers></pcbView>\n  </views>\n  <connectors>\n${conns}\n  </connectors>\n</module>`;
  },[part,pins]);

  const stats = useMemo(()=>{
    const byFn = pins.reduce((a,p)=>{a[p.fn]=(a[p.fn]||0)+1;return a;},{});
    return { total:pins.length, shapes:shapes.length, ...byFn };
  },[pins,shapes]);

  const tools = [
    {id:"select",icon:"⇲",key:"V"},{id:"rect",icon:"▭",key:"R"},{id:"circle",icon:"○",key:"C"},
    {id:"line",icon:"╱",key:"L"},{id:"text",icon:"A",key:"T"},{id:"pin",icon:"◉",key:"N"},
    {id:"pan",icon:"✥",key:"H"},
  ];

  // ─── Render ───
  return (
    <div style={{
      width:"100%", height:"100vh", display:"flex", flexDirection:"column",
      background:"#0c0c14", color:"#c8ccd4", fontFamily:"'IBM Plex Mono','Fira Code',monospace",
      fontSize:12, overflow:"hidden", userSelect:"none",
    }}>
      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 20% 50%,#0d2818 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,#1a0a2e 0%,transparent 40%),#0c0c14"}} />

      {/* Header */}
      <div style={{
        position:"relative", zIndex:10, display:"flex", alignItems:"center", gap:12,
        padding:"6px 16px", borderBottom:"1px solid #1e1e30",
        background:"linear-gradient(180deg,#12121e,#0e0e18)", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:22,height:22,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(135deg,#1a5c3a,#0d3321)",border:"1px solid #2a7a4a",fontSize:11,color:"#4ade80" }}>⬡</div>
          <span style={{ fontSize:13,fontWeight:600,color:"#e2e8f0",letterSpacing:"0.02em" }}>FZPZ Studio</span>
          <span style={{ fontSize:9,color:"#4a5568",marginLeft:-4 }}>v0.1</span>
        </div>
        <div style={{ width:1,height:20,background:"#1e1e30" }} />
        {["breadboard","schematic","pcb"].map(v=>(
          <button key={v} onClick={()=>setActiveView(v)} style={{
            padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:500,border:"none",cursor:"pointer",
            fontFamily:"inherit",textTransform:"uppercase",letterSpacing:"0.06em",transition:"all 0.15s",
            background:activeView===v?"#1a5c3a":"transparent",color:activeView===v?"#4ade80":"#6b7280",
          }}>{v}</button>
        ))}
        <div style={{flex:1}} />
        <span style={{fontSize:11,color:"#9ca3af"}}>{part.name}</span>
        <div style={{width:1,height:20,background:"#1e1e30"}} />
        <div style={{display:"flex",gap:4}}>
          {Object.entries(PRESETS).map(([k,v])=>(
            <button key={k} onClick={()=>loadPreset(k)} style={{
              padding:"2px 8px",borderRadius:3,fontSize:9,border:"1px solid "+(part.name===v.name?"#2a4a32":"#1e1e30"),
              background:part.name===v.name?"#1a2a22":"transparent",
              color:part.name===v.name?"#4ade80":"#6b7280",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",
            }}>{v.name.length>12?v.name.slice(0,10)+"…":v.name}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,padding:"2px 10px",borderRadius:10,
          background:"#111119",border:"1px solid #1e1e30",fontSize:9,color:"#6b7280"}}>
          <span>{stats.total} pins</span><span>{stats.shapes} shapes</span><span>{part.width}×{part.height}</span>
        </div>
      </div>

      {/* Main */}
      <div style={{position:"relative",zIndex:5,display:"flex",flex:1,overflow:"hidden"}}>

        {/* Toolbox */}
        <div style={{width:42,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
          padding:"8px 0",gap:2,borderRight:"1px solid #1e1e30",background:"#0e0e18"}}>
          {tools.map(t=>(
            <button key={t.id} onClick={()=>{setActiveTool(t.id);setDrawState(null);}} title={`${t.id} (${t.key})`}
              style={{
                width:32,height:32,borderRadius:4,border:"none",cursor:"pointer",position:"relative",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:activeTool===t.id?"#1a2a22":"transparent",
                color:activeTool===t.id?"#4ade80":"#6b7280",fontSize:15,fontFamily:"inherit",transition:"all 0.1s",
              }}>
              {t.icon}
              <span style={{position:"absolute",bottom:1,right:3,fontSize:7,color:"#4a5568"}}>{t.key}</span>
            </button>
          ))}
          <div style={{flex:1}} />
          <button onClick={()=>setZoom(z=>Math.min(6,z+0.3))} style={{width:28,height:22,borderRadius:3,border:"1px solid #1e1e30",background:"transparent",color:"#6b7280",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+</button>
          <span style={{fontSize:9,color:"#4a5568"}}>{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.3))} style={{width:28,height:22,borderRadius:3,border:"1px solid #1e1e30",background:"transparent",color:"#6b7280",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>−</button>
          <div style={{height:6}} />
          <button onClick={()=>setShowGrid(g=>!g)} title="Grid (G)" style={{width:28,height:22,borderRadius:3,border:"1px solid #1e1e30",background:showGrid?"#1a2a22":"transparent",color:showGrid?"#4ade80":"#4a5568",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>#</button>
          <button onClick={()=>setShowLabels(l=>!l)} title="Labels" style={{width:28,height:22,borderRadius:3,border:"1px solid #1e1e30",background:showLabels?"#1a2a22":"transparent",color:showLabels?"#4ade80":"#4a5568",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>Aa</button>
        </div>

        {/* Canvas */}
        <div style={{flex:1,position:"relative",overflow:"hidden",background:"#0a0a12",
          cursor:activeTool==="pan"||isPanning?"grab":activeTool==="select"?"default":"crosshair"}}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <svg ref={svgRef} width="100%" height="100%" onClick={handleCanvasClick} style={{display:"block"}}>
            <defs>
              <pattern id="grid-sm" width={GRID*zoom} height={GRID*zoom} patternUnits="userSpaceOnUse">
                <circle cx={GRID*zoom/2} cy={GRID*zoom/2} r={0.4} fill="#1e1e30" />
              </pattern>
              <pattern id="grid-lg" width={GRID*10*zoom} height={GRID*10*zoom} patternUnits="userSpaceOnUse">
                <rect width={GRID*10*zoom} height={GRID*10*zoom} fill="url(#grid-sm)" />
                <circle cx={GRID*10*zoom/2} cy={GRID*10*zoom/2} r={0.8} fill="#2a2a3e" />
              </pattern>
              <filter id="sel-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {showGrid && <rect width="100%" height="100%" fill="url(#grid-lg)" />}
            <g transform={`translate(${pan.x*zoom},${pan.y*zoom}) scale(${zoom})`}>
              {/* Dimension markers */}
              <line x1={0} y1={-4} x2={0} y2={-1} stroke="#2a3a2e" strokeWidth={0.5}/>
              <line x1={part.width} y1={-4} x2={part.width} y2={-1} stroke="#2a3a2e" strokeWidth={0.5}/>
              <line x1={0} y1={-2.5} x2={part.width} y2={-2.5} stroke="#2a3a2e22" strokeWidth={0.3}/>
              <text x={part.width/2} y={-6} textAnchor="middle" fill="#3a4a3e" fontSize={4.5} fontFamily="'IBM Plex Mono',monospace">{part.width}</text>
              <line x1={-4} y1={0} x2={-1} y2={0} stroke="#2a3a2e" strokeWidth={0.5}/>
              <line x1={-4} y1={part.height} x2={-1} y2={part.height} stroke="#2a3a2e" strokeWidth={0.5}/>
              <line x1={-2.5} y1={0} x2={-2.5} y2={part.height} stroke="#2a3a2e22" strokeWidth={0.3}/>
              <text x={-6} y={part.height/2} textAnchor="middle" fill="#3a4a3e" fontSize={4.5} fontFamily="'IBM Plex Mono',monospace"
                transform={`rotate(-90,-6,${part.height/2})`}>{part.height}</text>
              {shapes.map(s=><RenderShape key={s.id} shape={s} selected={selectedShape===s.id} onClick={id=>{setSelectedShape(id);setSelectedPin(null);}} />)}
              {pins.map(p=><RenderPin key={p.id} pin={p} selected={selectedPin===p.id} showLabels={showLabels} onClick={id=>{setSelectedPin(id);setSelectedShape(null);}} />)}
              {drawState && activeTool==="rect" && <rect x={drawState.x} y={drawState.y} width={2} height={2} fill="none" stroke="#fbbf24" strokeWidth={0.5} strokeDasharray="3 2"/>}
              {drawState && activeTool==="line" && <circle cx={drawState.x} cy={drawState.y} r={2} fill="#fbbf24" opacity={0.5}/>}
            </g>
          </svg>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:22,display:"flex",alignItems:"center",gap:12,padding:"0 12px",
            background:"#0e0e18ee",borderTop:"1px solid #1e1e30",fontSize:9,color:"#4a5568"}}>
            <span style={{color:activeTool!=="select"?"#4ade80":"#4a5568"}}>{activeTool.toUpperCase()}</span>
            <span>{activeView.toUpperCase()}</span>
            <span>{Math.round(zoom*100)}%</span>
            <div style={{flex:1}} />
            {drawState && <span style={{color:"#fbbf24"}}>Click to set endpoint</span>}
            <span>{pins.length} pins · {shapes.length} shapes</span>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{width:300,flexShrink:0,display:"flex",flexDirection:"column",
          borderLeft:"1px solid #1e1e30",background:"#0e0e18"}}>
          <div style={{display:"flex",borderBottom:"1px solid #1e1e30",flexShrink:0}}>
            {["props","pins","shapes","ai","export"].map(t=>(
              <button key={t} onClick={()=>setActivePanel(t)} style={{
                flex:1,padding:"7px 0",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:500,
                borderBottom:activePanel===t?"2px solid #4ade80":"2px solid transparent",
                background:"transparent",color:activePanel===t?"#e2e8f0":"#4a5568",transition:"all 0.15s",
              }}>{t==="props"?"Part":t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",padding:12}}>

            {/* PROPS */}
            {activePanel==="props" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Field label="Name" value={part.name} onChange={v=>setPart(p=>({...p,name:v}))} />
                <Field label="Description" value={part.description} multiline onChange={v=>setPart(p=>({...p,description:v}))} />
                <div style={{display:"flex",gap:8}}>
                  <SelectField label="Type" value={part.type} options={COMP_TYPES} onChange={v=>setPart(p=>({...p,type:v}))} />
                  <SelectField label="Package" value={part.package} options={PACKAGE_TYPES} onChange={v=>setPart(p=>({...p,package:v}))} />
                </div>
                <div style={{display:"flex",gap:8}}>
                  <NumField label="Width" value={part.width} onChange={v=>setPart(p=>({...p,width:v}))} />
                  <NumField label="Height" value={part.height} onChange={v=>setPart(p=>({...p,height:v}))} />
                </div>
                <Field label="Manufacturer" value={part.manufacturer} onChange={v=>setPart(p=>({...p,manufacturer:v}))} />
                <Field label="Part #" value={part.partNumber} onChange={v=>setPart(p=>({...p,partNumber:v}))} />
                <Field label="Datasheet" value={part.datasheetUrl} onChange={v=>setPart(p=>({...p,datasheetUrl:v}))} />
                <div>
                  <label style={LBL}>Tags</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                    {(part.tags||[]).map((t,i)=>(
                      <span key={i} onClick={()=>setPart(p=>({...p,tags:p.tags.filter((_,j)=>j!==i)}))}
                        style={{padding:"1px 6px",borderRadius:3,fontSize:9,background:"#1a2a22",color:"#4ade80",
                          border:"1px solid #2a4a32",cursor:"pointer"}}>{t} ×</span>
                    ))}
                  </div>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&tagInput.trim()){setPart(p=>({...p,tags:[...(p.tags||[]),tagInput.trim()]}));setTagInput("");}}}
                    placeholder="Add tag…" style={INP(true)} />
                </div>
              </div>
            )}

            {/* PINS */}
            {activePanel==="pins" && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{maxHeight:selPin?140:400,overflow:"auto",display:"flex",flexDirection:"column",gap:1,
                  borderRadius:4,border:"1px solid #1e1e30",background:"#0a0a12"}}>
                  {pins.length===0?(
                    <div style={{padding:20,textAlign:"center",color:"#4a5568",fontSize:10}}>No pins. Press N to place pins on the canvas.</div>
                  ):pins.map(p=>(
                    <div key={p.id} onClick={()=>{setSelectedPin(p.id);setSelectedShape(null);}}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",
                        background:selectedPin===p.id?"#1a2a22":"transparent",cursor:"pointer",
                        borderLeft:`3px solid ${PIN_COLORS[p.fn]||"#4a5568"}`,transition:"background 0.1s"}}>
                      <span style={{fontSize:10,color:"#e2e8f0",fontWeight:500,minWidth:40}}>{p.id}</span>
                      <span style={{fontSize:10,color:"#9ca3af",flex:1}}>{p.label}</span>
                      <span style={{fontSize:8,color:PIN_COLORS[p.fn],textTransform:"uppercase"}}>{p.fn}</span>
                    </div>
                  ))}
                </div>
                {selPin && (
                  <div style={{padding:10,borderRadius:4,border:"1px solid #1e1e30",background:"#111119",display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{fontSize:10,color:"#4ade80",fontWeight:600}}>Edit: {selPin.id}</div>
                    <div style={{display:"flex",gap:8}}>
                      <Field label="ID" value={selPin.id} onChange={v=>updatePin(selPin.id,"id",v)} small />
                      <Field label="Label" value={selPin.label} onChange={v=>updatePin(selPin.id,"label",v)} small />
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <SelectField label="Function" value={selPin.fn} options={Object.keys(PIN_COLORS)} onChange={v=>updatePin(selPin.id,"fn",v)} />
                      <SelectField label="Type" value={selPin.type} options={["through-hole","smd","pad","male","female","via"]} onChange={v=>updatePin(selPin.id,"type",v)} />
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <NumField label="X" value={selPin.x} onChange={v=>updatePin(selPin.id,"x",v)} small />
                      <NumField label="Y" value={selPin.y} onChange={v=>updatePin(selPin.id,"y",v)} small />
                      <SelectField label="Side" value={selPin.side} options={["top","bottom","left","right"]} onChange={v=>updatePin(selPin.id,"side",v)} />
                    </div>
                    <button onClick={()=>{setPins(p=>p.filter(q=>q.id!==selPin.id));setSelectedPin(null);}}
                      style={{padding:"4px 0",borderRadius:3,border:"1px solid #4a2020",background:"#2a1515",color:"#e74c3c",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Delete Pin</button>
                  </div>
                )}
                <div style={{display:"flex",gap:4}}>
                  {[{l:"Re-number",fn:()=>setPins(p=>p.map((q,i)=>({...q,id:`P${i+1}`,label:`P${i+1}`})))},
                    {l:"Auto-space",fn:()=>{
                      const sides={top:[],bottom:[],left:[],right:[]};
                      pins.forEach(p=>sides[p.side]?.push(p));
                      const u=[];
                      Object.entries(sides).forEach(([side,grp])=>{
                        grp.forEach((p,i)=>{
                          const horiz=side==="top"||side==="bottom";
                          const dim=horiz?part.width:part.height;
                          const pos=grp.length>1?10+i*Math.floor((dim-20)/(grp.length-1)):dim/2;
                          u.push({...p,...(horiz?{x:pos}:{y:pos})});
                        });
                      }); setPins(u);
                    }}].map(b=>(
                    <button key={b.l} onClick={b.fn} style={{flex:1,padding:"4px 0",borderRadius:3,border:"1px solid #1e1e30",
                      background:"#111119",color:"#9ca3af",fontSize:9,cursor:"pointer",fontFamily:"inherit",transition:"border-color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2a4a32"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>{b.l}</button>
                  ))}
                </div>
              </div>
            )}

            {/* SHAPES */}
            {activePanel==="shapes" && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{maxHeight:selShape?160:400,overflow:"auto",display:"flex",flexDirection:"column",gap:1,
                  borderRadius:4,border:"1px solid #1e1e30",background:"#0a0a12"}}>
                  {shapes.map(s=>(
                    <div key={s.id} onClick={()=>{setSelectedShape(s.id);setSelectedPin(null);}}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",
                        background:selectedShape===s.id?"#1a2a22":"transparent",cursor:"pointer",transition:"background 0.1s"}}>
                      <span style={{fontSize:10,color:"#9ca3af",width:12}}>
                        {s.type==="rect"?"▭":s.type==="circle"?"○":s.type==="line"?"╱":"A"}</span>
                      <span style={{fontSize:10,color:"#e2e8f0",flex:1}}>{s.id}</span>
                      <div style={{width:10,height:10,borderRadius:2,background:s.fill||"transparent",border:"1px solid #333"}} />
                    </div>
                  ))}
                </div>
                {selShape && (
                  <div style={{padding:10,borderRadius:4,border:"1px solid #1e1e30",background:"#111119",display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{fontSize:10,color:"#fbbf24",fontWeight:600}}>Edit: {selShape.id}</div>
                    <Field label="ID" value={selShape.id} onChange={v=>updateShape(selShape.id,"id",v)} small />
                    {selShape.type==="rect" && (<>
                      <div style={{display:"flex",gap:6}}><NumField label="X" value={selShape.x} onChange={v=>updateShape(selShape.id,"x",v)} small /><NumField label="Y" value={selShape.y} onChange={v=>updateShape(selShape.id,"y",v)} small /></div>
                      <div style={{display:"flex",gap:6}}><NumField label="W" value={selShape.w} onChange={v=>updateShape(selShape.id,"w",v)} small /><NumField label="H" value={selShape.h} onChange={v=>updateShape(selShape.id,"h",v)} small /><NumField label="R" value={selShape.rx||0} onChange={v=>updateShape(selShape.id,"rx",v)} small /></div>
                    </>)}
                    {selShape.type==="circle" && (
                      <div style={{display:"flex",gap:6}}><NumField label="X" value={selShape.x} onChange={v=>updateShape(selShape.id,"x",v)} small /><NumField label="Y" value={selShape.y} onChange={v=>updateShape(selShape.id,"y",v)} small /><NumField label="R" value={selShape.r} onChange={v=>updateShape(selShape.id,"r",v)} small /></div>
                    )}
                    {selShape.type==="line" && (
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><NumField label="X1" value={selShape.x1} onChange={v=>updateShape(selShape.id,"x1",v)} small /><NumField label="Y1" value={selShape.y1} onChange={v=>updateShape(selShape.id,"y1",v)} small /><NumField label="X2" value={selShape.x2} onChange={v=>updateShape(selShape.id,"x2",v)} small /><NumField label="Y2" value={selShape.y2} onChange={v=>updateShape(selShape.id,"y2",v)} small /></div>
                    )}
                    {selShape.type==="text" && <Field label="Text" value={selShape.text} onChange={v=>updateShape(selShape.id,"text",v)} small />}
                    <div style={{display:"flex",gap:6}}>
                      <ColorField label="Fill" value={selShape.fill||"#000"} onChange={v=>updateShape(selShape.id,"fill",v)} />
                      <ColorField label="Stroke" value={selShape.stroke||"#000"} onChange={v=>updateShape(selShape.id,"stroke",v)} />
                    </div>
                    <button onClick={()=>{setShapes(p=>p.filter(s=>s.id!==selShape.id));setSelectedShape(null);}}
                      style={{padding:"4px 0",borderRadius:3,border:"1px solid #4a2020",background:"#2a1515",color:"#e74c3c",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Delete Shape</button>
                  </div>
                )}
              </div>
            )}

            {/* AI */}
            {activePanel==="ai" && (
              <div style={{display:"flex",flexDirection:"column",gap:8,height:"100%"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {[{l:"Smart-Fill",d:"from datasheet",c:"fill specs for "+part.name},{l:"Validate",d:"check design",c:"validate"},{l:"Auto-Pinout",d:"from datasheet",c:"generate pinout"},{l:"Gen Footprint",d:"IPC-7351",c:"footprint for "+part.package}].map(a=>(
                    <button key={a.l} onClick={()=>setAiInput(a.c)} style={{padding:"6px 8px",borderRadius:4,border:"1px solid #1e1e30",background:"#111119",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"border-color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2a4a32"} onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>
                      <div style={{fontSize:10,color:"#e2e8f0",fontWeight:500}}>{a.l}</div>
                      <div style={{fontSize:8,color:"#4a5568"}}>{a.d}</div>
                    </button>
                  ))}
                </div>
                <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:6,padding:8,borderRadius:4,border:"1px solid #1e1e30",background:"#0a0a12",minHeight:200}}>
                  {aiMessages.map((m,i)=>(
                    <div key={i} style={{padding:"6px 8px",borderRadius:4,fontSize:10,lineHeight:1.5,whiteSpace:"pre-wrap",wordBreak:"break-word",
                      background:m.role==="user"?"#1a2a22":m.role==="system"?"#1a1a2e":"#111119",
                      color:m.role==="user"?"#4ade80":m.role==="system"?"#a78bfa":"#c8ccd4",
                      borderLeft:m.role==="assistant"?"2px solid #4ade80":m.role==="system"?"2px solid #a78bfa":"none"}}>
                      {m.text}
                    </div>
                  ))}
                  <div ref={chatRef} />
                </div>
                <div style={{display:"flex",gap:4}}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()}
                    placeholder="Ask about your part…" style={{...INP(false),flex:1}} />
                  <button onClick={sendAI} style={{padding:"0 12px",borderRadius:4,border:"1px solid #2a4a32",background:"#1a2a22",color:"#4ade80",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>→</button>
                </div>
              </div>
            )}

            {/* EXPORT */}
            {activePanel==="export" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{padding:10,borderRadius:4,border:"1px solid #1e1e30",background:"#0a0a12",display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#e2e8f0",marginBottom:4}}>Readiness</div>
                  {[{l:"Name set",ok:part.name&&part.name!=="New Part"},{l:"Description",ok:!!part.description},{l:"Pins (≥2)",ok:pins.length>=2},{l:"Body shapes",ok:shapes.length>0},{l:"Package",ok:part.package!=="custom"},{l:"Metadata",ok:!!part.manufacturer||!!part.partNumber}].map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10}}>
                      <span style={{color:c.ok?"#4ade80":"#e74c3c",fontSize:11}}>{c.ok?"✓":"✗"}</span>
                      <span style={{color:c.ok?"#6b7280":"#e2e8f0"}}>{c.l}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={LBL}>FZP XML</label>
                  <pre style={{padding:8,borderRadius:4,border:"1px solid #1e1e30",background:"#0a0a12",fontSize:8,color:"#6b7280",overflow:"auto",maxHeight:220,lineHeight:1.4,whiteSpace:"pre",fontFamily:"'IBM Plex Mono',monospace"}}>{fzpXml}</pre>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>{const b=new Blob([fzpXml],{type:"application/xml"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=part.name.toLowerCase().replace(/\s+/g,"-")+".fzp";a.click();URL.revokeObjectURL(u);}}
                    style={{flex:1,padding:"6px 0",borderRadius:4,border:"1px solid #2a4a32",background:"#1a2a22",color:"#4ade80",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Export .fzp</button>
                  <button onClick={()=>{const j=JSON.stringify({...part,shapes,pins},null,2);const b=new Blob([j],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=part.name.toLowerCase().replace(/\s+/g,"-")+".json";a.click();URL.revokeObjectURL(u);}}
                    style={{flex:1,padding:"6px 0",borderRadius:4,border:"1px solid #1e1e30",background:"#111119",color:"#9ca3af",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Export JSON</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    </div>
  );
}

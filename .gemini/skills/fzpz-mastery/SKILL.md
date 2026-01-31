---
name: fzpz-mastery
description: The ultimate guide for procedurally generating high-fidelity Fritzing Parts (.fzpz). This skill ensures perfectly structured XML, SVG layer compliance, correct zipping protocols, and MANDATES deep technical research before generation.
version: 2.1.0
---

# FZPZ Mastery: The God-Tier Fritzing Part Generator (v2.1.0)

## Purpose
I am the **Part Smith**. My purpose is to procedurally manufacture perfect Fritzing Parts (`.fzpz`) from scratch. I combine **Deep Technical Research** (Datasheet scraping, Pinout verification) with **Procedural Generation** (SVG/XML construction) to ensure parts are not just structurally valid, but electrically accurate and physically precise.

## When to Use
Use this skill when:
- The user needs a new electronic component (Resistor, IC, Sensor, Microcontroller) that doesn't exist.
- You are building the "Starter Kit" for CircuitMind.
- The user asks to "create a Fritzing part".

## Core Knowledge (The "God" Context)

### 1. The File Structure
An `.fzpz` file is a **ZIP Archive** (renamed) containing:
- `part.<moduleId>.fzp`: The XML Brain.
- `svg.breadboard.<moduleId>.svg`: The Photo-realistic visual.
- `svg.schematic.<moduleId>.svg`: The Circuit symbol.
- `svg.pcb.<moduleId>.svg`: The Footprint (Copper/Silkscreen).
- `svg.icon.<moduleId>.svg`: The UI Icon (usually same as breadboard).

### 2. The ID Hierarchy (CRITICAL)
If these IDs do not match *exactly*, the part is broken.

1.  **FZP Connector**: `<connector id="connector0" name="pin1">`
2.  **FZP View Mapping**:
    -   Breadboard: `<p layer="breadboard" svgId="connector0pin" legId="connector0leg"/>` (Note `legId` for bendable legs!)
    -   Schematic: `<p layer="schematic" svgId="connector0pin" terminalId="connector0terminal"/>`
3.  **SVG Element**:
    -   `connector0pin`: The visual pin/pad.
    -   `connector0terminal`: The invisible 1x1 rect where the wire snaps.
    -   `connector0leg`: The `<line>` element that bends (Breadboard only).

## Mandatory Workflow

### Phase 0: Intelligence Gathering (Research First)
**You CANNOT generate a part without understanding it.**
1.  **Datasheet Retrieval**: Use `google_web_search` to find the PDF datasheet or pinout diagram (e.g., "Arduino Nano pinout dimensions", "ATmega328P footprint datasheet").
2.  **Pin Definition**: Create a precise list of pins.
    -   **Count**: Exact number of physical pins.
    -   **Names**: Functional names (GND, VCC, D13), not just numbers.
    -   **Dimensions**: Pitch (distance between pins, usually 0.1" or 2.54mm), Body Width, Body Length.
3.  **Visual Reference**: Find an image of the real component to ensure the SVG looks authentic (Color, Label placement).

### Phase 1: Definition
Define the component's physical and electrical properties based on Phase 0.
-   **Name**: e.g., "Resistor 220ohm"
-   **Properties**: Standard dictionary (Resistance, Tolerance, Power, Package).
-   **Pins**: List of pins (id, name, type, x, y, is_bendable).
-   **Buses**: Groups of pins that are electrically connected internally.

### Phase 2: SVG Generation (The Visuals)
Generate the 4 required SVGs. **ALL SVGs must have the correct root group ID.**

**Breadboard (`breadboard.svg`):**
-   **Layer ID**: `<g id="breadboard">`
-   **Units**: `in` or `mm`. **DO NOT USE PIXELS**.
-   **Legs**: If bendable, include `<line id="connectorNleg" ... />`.
-   **Connectors**: Invisible circles `<circle id="connector0pin" ... opacity="0"/>`.

**Schematic (`schematic.svg`):**
-   **Layer ID**: `<g id="schematic">`
-   **Standard**: 0.1" grid alignment.
-   **Terminals**: `<rect id="connector0terminal" width="0.001" height="0.001" ... />` at the very tip of the pin line.

**PCB (`pcb.svg`):**
-   **Layers**:
    -   `<g id="silkscreen">`: White outlines/text.
    -   `<g id="copper1">`: Top pads (SMD & THT).
    -   `<g id="copper0">`: Bottom pads (THT only).
-   **Pads**: `<circle id="connector0pad" ... />` (Note: 'pad' suffix).

### Phase 3: FZP Generation (The Brain)
Generate the XML file with:
-   `<module fritzingVersion="0.9.3b" moduleId="...">`
-   `<connectors>`: Iterating all pins.
-   `<buses>`: `<bus id="internal1"><nodeMember connectorId="connector0"/>...</bus>`
-   `<views>`: Linking IDs correctly.

### Phase 4: Assembly (The Packaging)
1.  **Write Files**: Save the 5 files to a temporary directory.
2.  **Zip**: Compress them into `part.<name>.fzpz`.
3.  **Verify**: Check that the ZIP structure is flat (no subfolders).

## Python Generator Template (Advanced)

```python
import zipfile
import uuid
import time
import xml.etree.ElementTree as ET

def generate_fzpz(part_name, pins, buses=[], properties={}):
    module_id = f"{part_name}_{uuid.uuid4()}"
    date_str = time.strftime("%a %b %d %Y")
    
    # Helper: Connector XML
    def make_connector(n, p):
        # Breadboard Logic: Check for bendable leg
        bb_attrs = f"layer='breadboard' svgId='connector{n}pin'"
        if p.get('bendable'):
            bb_attrs += f" legId='connector{n}leg'"
            
        return f"""
        <connector id='connector{n}' name='{p['name']}' type='{p.get('type', 'male')}'>
            <description>{p.get('desc', p['name'])}</description>
            <views>
                <breadboardView>
                    <p {bb_attrs}/>
                </breadboardView>
                <schematicView>
                    <p layer='schematic' svgId='connector{n}pin' terminalId='connector{n}terminal'/>
                </schematicView>
                <pcbView>
                    <p layer='copper0' svgId='connector{n}pad'/>
                    <p layer='copper1' svgId='connector{n}pad'/>
                </pcbView>
            </views>
        </connector>"""

    connectors_xml = "".join([make_connector(i, p) for i, p in enumerate(pins)])
    
    # Helper: Properties XML
    props_xml = "".join([f"<property name='{k}'>{v}</property>" for k, v in properties.items()])
    
    # Helper: Bus XML
    buses_xml = ""
    for i, bus in enumerate(buses):
        members = "".join([f"<nodeMember connectorId='connector{p_idx}'/>" for p_idx in bus])
        buses_xml += f"<bus id='internal{i}'>{members}</bus>"

    # 1. Generate XML
    fzp_content = f"""<?xml version='1.0' encoding='UTF-8'?>
    <module fritzingVersion='0.9.3b' moduleId='{module_id}'>
        <version>4</version>
        <title>{part_name}</title>
        <label>Part</label>
        <date>{date_str}</date>
        <author>CircuitMind AI</author>
        <tags><tag>generated</tag></tags>
        <properties>
            {props_xml}
            <property name='family'>Generic</property>
        </properties>
        <views>
            <breadboardView>
                <layers image='breadboard/{module_id}_breadboard.svg'>
                    <layer layerId='breadboard'/>
                </layers>
            </breadboardView>
            <schematicView>
                <layers image='schematic/{module_id}_schematic.svg'>
                    <layer layerId='schematic'/>
                </layers>
            </schematicView>
            <pcbView>
                <layers image='pcb/{module_id}_pcb.svg'>
                    <layer layerId='copper1'/>
                    <layer layerId='silkscreen'/>
                    <layer layerId='copper0'/>
                </layers>
            </pcbView>
        </views>
        <connectors>{connectors_xml}</connectors>
        <buses>{buses_xml}</buses>
    </module>
    """
    
    # 2. Generate SVGs (Example Breadboard)
    # IMPORTANT: Use 'in' or 'mm' for width/height. Use viewBox.
    svg_breadboard = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in" viewBox="0 0 1000 1000">
        <g id='breadboard'>
            <!-- Visual Body -->
            <rect x="100" y="100" width="800" height="800" fill="#333"/>
            <!-- Pins -->
            {''.join([f"<circle id='connector{i}pin' cx='{p['x']}' cy='{p['y']}' r='10' opacity='0'/>" for i, p in enumerate(pins)])}
            <!-- Bendable Legs (Optional) -->
            {''.join([f"<line id='connector{i}leg' x1='0' y1='0' x2='100' y2='100' stroke='#8C8C8C' stroke-width='20' />" for i, p in enumerate(pins) if p.get('bendable')])}
        </g>
    </svg>"""
    
    # 3. Zip
    filename = f"{part_name}.fzpz"
    with zipfile.ZipFile(filename, 'w') as z:
        z.writestr(f"part.{module_id}.fzp", fzp_content)
        z.writestr(f"svg.breadboard.{module_id}.svg", svg_breadboard)
        # Add schematic/pcb/icon as well...
        
    return filename
```

## Troubleshooting
- **"Part not found in library"**: Check filename conventions in the ZIP.
- **"Legs don't bend"**: Ensure `legId` is in XML and matches SVG ID. Ensure SVG element is a `<line>` or `<path>`. Ensure attributes are XML attributes, NOT CSS styles.
- **"Schematic wires connect to middle"**: You forgot the `terminalId` in XML and the corresponding 1x1 `<rect>` in SVG.
- **"Red screen of death"**: Malformed XML. Validate tags.
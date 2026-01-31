import zipfile
import uuid
import time
import os

def generate_fzpz(part_name, pins, type_cat='other', buses=[], properties={}, out_dir='public/parts'):
    module_id = f"{part_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
    date_str = time.strftime("%a %b %d %Y")
    
    # Ensure directory exists
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    # Helper: Connector XML
    def make_connector(n, p):
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
    
    props_xml = "".join([f"<property name='{k}'>{v}</property>" for k, v in properties.items()])
    
    buses_xml = ""
    for i, bus in enumerate(buses):
        members = "".join([f"<nodeMember connectorId='connector{p_idx}'/>" for p_idx in bus])
        buses_xml += f"<bus id='internal{i}'>{members}</bus>"

    # 1. Generate FZP XML
    fzp_content = f"""<?xml version='1.0' encoding='UTF-8'?>
<module fritzingVersion='0.9.3b' moduleId='{module_id}'>
    <version>4</version>
    <title>{part_name}</title>
    <label>{properties.get('label', 'Part')}</label>
    <date>{date_str}</date>
    <author>CircuitMind AI</author>
    <tags><tag>starter-kit</tag></tags>
    <properties>
        {props_xml}
        <property name='family'>{properties.get('family', 'Generic')}</property>
        <property name='type'>{type_cat}</property>
    </properties>
    <views>
        <breadboardView>
            <layers image='svg.breadboard.{module_id}.svg'>
                <layer layerId='breadboard'/>
            </layers>
        </breadboardView>
        <schematicView>
            <layers image='svg.schematic.{module_id}.svg'>
                <layer layerId='schematic'/>
            </layers>
        </schematicView>
        <pcbView>
            <layers image='svg.pcb.{module_id}.svg'>
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
    
    # 2. Generate SVGs
    # Breadboard SVG
    width_in = properties.get('width_in', 1.0)
    height_in = properties.get('height_in', 1.0)
    view_w = int(width_in * 1000)
    view_h = int(height_in * 1000)
    
    svg_breadboard = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width_in}in" height="{height_in}in" viewBox="0 0 {view_w} {view_h}">
    <g id='breadboard'>
        <rect x="0" y="0" width="{view_w}" height="{view_h}" fill="{properties.get('color', '#333')}"/>
        {''.join([f"<circle id='connector{i}pin' cx='{p['x']}' cy='{p['y']}' r='15' fill='#9A916C'/>" for i, p in enumerate(pins)])}
        {''.join([f"<line id='connector{i}leg' x1='{p['x']}' y1='{p['y']}' x2='{p['x']}' y2='{p['y']+50}' stroke='#8C8C8C' stroke-width='10' />" for i, p in enumerate(pins) if p.get('bendable')])}
    </g>
</svg>"""

    # Schematic SVG (Placeholder)
    svg_schematic = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in" viewBox="0 0 1000 1000">
    <g id='schematic'>
        <rect x="200" y="200" width="600" height="600" fill="none" stroke="#000" stroke-width="10"/>
        {''.join([f"<line x1='0' y1='{300+i*50}' x2='200' y2='{300+i*50}' stroke='#000' stroke-width='5' id='connector{i}pin'/>" for i in range(len(pins))])}
        {''.join([f"<rect id='connector{i}terminal' x='0' y='{300+i*50}' width='1' height='1' opacity='0'/>" for i in range(len(pins))])}
    </g>
</svg>"""

    # PCB SVG (Placeholder)
    svg_pcb = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width_in}in" height="{height_in}in" viewBox="0 0 {view_w} {view_h}">
    <g id='silkscreen'><rect x="0" y="0" width="{view_w}" height="{view_h}" fill="none" stroke="#fff" stroke-width="10"/></g>
    <g id='copper0'>{''.join([f"<circle id='connector{i}pad' cx='{pins[i]['x']}' cy='{pins[i]['y']}' r='20' fill='#fcc'/>" for i in range(len(pins))])}</g>
    <g id='copper1'>{''.join([f"<circle id='connector{i}pad' cx='{pins[i]['x']}' cy='{pins[i]['y']}' r='20' fill='#fcc'/>" for i in range(len(pins))])}</g>
</svg>"""

    # 3. Zip
    filename = os.path.join(out_dir, f"{part_name.replace(' ', '_')}.fzpz")
    with zipfile.ZipFile(filename, 'w') as z:
        z.writestr(f"part.{module_id}.fzp", fzp_content)
        z.writestr(f"svg.breadboard.{module_id}.svg", svg_breadboard)
        z.writestr(f"svg.schematic.{module_id}.svg", svg_schematic)
        z.writestr(f"svg.pcb.{module_id}.svg", svg_pcb)
        
    print(f"Generated {filename}")

# --- START GENERATING ---

# 1. Arduino Uno R3 (Approx 2.7" x 2.1")
arduino_pins = []
# Power Header (Left)
for i, name in enumerate(['NC', 'IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN']):
    arduino_pins.append({'name': name, 'x': 100, 'y': 300 + i*100})
# Analog Header (Left)
for i, name in enumerate(['A0', 'A1', 'A2', 'A3', 'A4', 'A5']):
    arduino_pins.append({'name': name, 'x': 100, 'y': 1200 + i*100})
# Digital Header (Right)
for i, name in enumerate(['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']):
    arduino_pins.append({'name': name, 'x': 2600, 'y': 300 + i*100})
for i, name in enumerate(['D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'GND', 'AREF', 'SDA', 'SCL']):
    arduino_pins.append({'name': name, 'x': 2600, 'y': 1200 + i*100})

generate_fzpz("Arduino Uno R3", arduino_pins, type_cat='microcontroller', properties={
    'width_in': 2.7, 'height_in': 2.1, 'color': '#00979D', 'label': 'MCU', 'family': 'Arduino'
})

# 2. Resistor 220 Ohm (Bendable)
resistor_pins = [
    {'name': 'pin1', 'x': 100, 'y': 150, 'bendable': True},
    {'name': 'pin2', 'x': 900, 'y': 150, 'bendable': True}
]
generate_fzpz("Resistor 220 Ohm", resistor_pins, type_cat='other', properties={
    'width_in': 1.0, 'height_in': 0.3, 'color': '#D4AF37', 'label': 'R', 'family': 'Resistor'
})

# 3. LED 5mm Red
led_pins = [
    {'name': 'anode', 'x': 450, 'y': 800, 'bendable': True},
    {'name': 'cathode', 'x': 550, 'y': 800, 'bendable': True}
]
generate_fzpz("LED 5mm Red", led_pins, type_cat='actuator', properties={
    'width_in': 0.5, 'height_in': 0.5, 'color': '#FF0000', 'label': 'LED', 'family': 'LED'
})

# 4. DHT11
dht_pins = [
    {'name': 'VCC', 'x': 200, 'y': 500},
    {'name': 'DATA', 'x': 300, 'y': 500},
    {'name': 'NC', 'x': 400, 'y': 500},
    {'name': 'GND', 'x': 500, 'y': 500}
]
generate_fzpz("DHT11", dht_pins, type_cat='sensor', properties={
    'width_in': 0.6, 'height_in': 0.6, 'color': '#3B82F6', 'label': 'S', 'family': 'Sensor'
})

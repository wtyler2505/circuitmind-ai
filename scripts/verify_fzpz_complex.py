
import zipfile
import uuid
import os
import xml.etree.ElementTree as ET

def generate_complex_part():
    part_name = "TestResistor_Bendable"
    module_id = f"{part_name}_{uuid.uuid4()}"
    
    # 1. XML with Bendable Leg Definition
    # Note legId='connector0leg'
    fzp_content = f"""<?xml version='1.0' encoding='UTF-8'?>
    <module fritzingVersion='0.9.3b' moduleId='{module_id}'>
        <version>4</version>
        <title>{part_name}</title>
        <views>
            <breadboardView>
                <layers image='breadboard/{module_id}_breadboard.svg'>
                    <layer layerId='breadboard'/>
                </layers>
            </breadboardView>
        </views>
        <connectors>
            <connector id='connector0' name='Pin 0' type='male'>
                <views>
                    <breadboardView>
                        <p layer='breadboard' svgId='connector0pin' legId='connector0leg'/>
                    </breadboardView>
                </views>
            </connector>
        </connectors>
    </module>
    """
    
    # 2. SVG with Bendable Leg Line
    # Note standard units (in) and viewBox
    # Note line id='connector0leg'
    svg_content = f"""
    <svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in" viewBox="0 0 100 100">
        <g id='breadboard'>
            <line id='connector0leg' x1='10' y1='10' x2='90' y2='10' stroke='#8C8C8C' stroke-width='5'/>
            <circle id='connector0pin' cx='10' cy='10' r='5' opacity='0'/>
        </g>
    </svg>
    """
    
    filename = "test_bendable.fzpz"
    
    # Create FZPZ
    with zipfile.ZipFile(filename, 'w') as z:
        z.writestr(f"part.{module_id}.fzp", fzp_content)
        z.writestr(f"svg.breadboard.{module_id}.svg", svg_content)
        
    return filename, module_id

def verify_complex_part(filename, expected_module_id):
    print(f"Verifying {filename}...")
    with zipfile.ZipFile(filename, 'r') as z:
        # Check FZP naming
        fzp_name = f"part.{expected_module_id}.fzp"
        fzp_data = z.read(fzp_name)
        root = ET.fromstring(fzp_data)
        
        # Verify Leg ID in XML
        connector = root.find(".//connector[@id='connector0']")
        p_tag = connector.find(".//breadboardView/p")
        if p_tag.attrib.get('legId') != 'connector0leg':
            raise Exception("XML missing legId attribute")
            
        print("XML Structure: VALID (legId found)")

        # Verify SVG Structure
        svg_name = f"svg.breadboard.{expected_module_id}.svg"
        svg_data = z.read(svg_name).decode('utf-8')
        
        if "id='connector0leg'" not in svg_data:
             raise Exception("SVG missing connector0leg element")
        
        if '<line' not in svg_data:
             raise Exception("SVG missing <line> element for leg")
             
        print("SVG Structure: VALID (Bendable Leg found)")

try:
    fname, mod_id = generate_complex_part()
    verify_complex_part(fname, mod_id)
    os.remove(fname) # cleanup
    print("Verification SUCCESS!")
except Exception as e:
    print(f"Verification FAILED: {e}")
    exit(1)

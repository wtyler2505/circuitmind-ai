
import zipfile
import uuid
import os
import xml.etree.ElementTree as ET

def generate_test_part():
    part_name = "TestResistor"
    module_id = f"{part_name}_{uuid.uuid4()}"
    
    # Minimal Valid FZP Content
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
                        <p layer='breadboard' svgId='connector0pin'/>
                    </breadboardView>
                </views>
            </connector>
        </connectors>
    </module>
    """
    
    # Minimal Valid SVG Content
    svg_content = f"""
    <svg xmlns="http://www.w3.org/2000/svg" width="1in" height="1in">
        <g id='breadboard'>
            <circle id='connector0pin' cx='10' cy='10' r='5'/>
        </g>
    </svg>
    """
    
    filename = "test_part.fzpz"
    
    # Create FZPZ
    with zipfile.ZipFile(filename, 'w') as z:
        z.writestr(f"part.{module_id}.fzp", fzp_content)
        z.writestr(f"svg.breadboard.{module_id}.svg", svg_content)
        
    return filename, module_id

def verify_part(filename, expected_module_id):
    print(f"Verifying {filename}...")
    with zipfile.ZipFile(filename, 'r') as z:
        files = z.namelist()
        print(f"Files found: {files}")
        
        # Check FZP naming
        fzp_name = f"part.{expected_module_id}.fzp"
        if fzp_name not in files:
            raise Exception(f"Missing FZP file: {fzp_name}")
            
        # Check XML Structure
        fzp_data = z.read(fzp_name)
        root = ET.fromstring(fzp_data)
        if root.tag != 'module':
            raise Exception("Root tag is not <module>")
        if root.attrib.get('moduleId') != expected_module_id:
            raise Exception("Module ID mismatch in XML")
            
        print("Verification SUCCESS!")

try:
    fname, mod_id = generate_test_part()
    verify_part(fname, mod_id)
    os.remove(fname) # cleanup
except Exception as e:
    print(f"Verification FAILED: {e}")
    exit(1)

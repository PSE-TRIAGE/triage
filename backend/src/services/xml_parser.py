import defusedxml.ElementTree as ET
import json

def parse_mutations(xml_bytes: bytes):
    """
    CPU-bound function that parses XML bytes into a list of tuples.
    This will be run in a thread pool to avoid blocking the main event loop.
    """
    root = ET.fromstring(xml_bytes)
    mutants_data = []
    
    for mutation in root.findall('mutation'):
        
        detected = mutation.get('detected') == 'true'
        status = mutation.get('status')
        numberOfTestsRun = int(mutation.get('numberOfTestsRun', 0))
        
        sourceFile = mutation.findtext('sourceFile', '')
        mutatedClass = mutation.findtext('mutatedClass', '')
        mutatedMethod = mutation.findtext('mutatedMethod', '')
        methodDescription = mutation.findtext('methodDescription', '')
        lineNumber = int(mutation.findtext('lineNumber', 0))
        mutator = mutation.findtext('mutator', '')
        
        killingTest_elem = mutation.find('killingTest')
        killingTest = killingTest_elem.text if killingTest_elem is not None and killingTest_elem.text else None
        
        description = mutation.findtext('description', '')

        additionalFields = {}

        additionalFields_element = mutation.find('additionalFields')
        if additionalFields_element is not None:
            for field in additionalFields_element:
                additionalFields[field.tag] = field.text
        
        additionalFields_json = json.dumps(additionalFields) if additionalFields else None
        
        mutant_row = [
            0,  # project_id (placeholder)
            detected,
            status,
            numberOfTestsRun,
            sourceFile,
            mutatedClass,
            mutatedMethod,
            methodDescription,
            lineNumber,
            mutator,
            killingTest,
            description,
            additionalFields_json
        ]
        
        mutants_data.append(mutant_row)
    
    return mutants_data

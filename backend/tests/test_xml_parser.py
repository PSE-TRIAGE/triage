import pytest
import json

from services.xml_parser import parse_mutations


class TestXmlParser:
    """Unit tests for the XML mutation parser."""

    def test_parse_valid_xml(self):
        """Parsing valid XML returns correct mutation data."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='5'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.example.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>10</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.example.FooTest.test1</killingTest>
        <description>replaced math operator</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)

        assert len(result) == 1
        mutant = result[0]
        assert mutant[0] == 0        # project_id placeholder
        assert mutant[1] is True     # detected
        assert mutant[2] == "KILLED" # status
        assert mutant[3] == 5        # numberOfTestsRun
        assert mutant[4] == "Foo.java"
        assert mutant[5] == "com.example.Foo"
        assert mutant[6] == "bar"
        assert mutant[8] == 10       # lineNumber
        assert mutant[9] == "MATH"
        assert mutant[10] == "com.example.FooTest.test1"

    def test_parse_empty_mutations(self):
        """Parsing XML with no mutations returns an empty list."""
        xml = b'<?xml version="1.0" encoding="UTF-8"?><mutations></mutations>'
        result = parse_mutations(xml)
        assert result == []

    def test_parse_multiple_mutations(self):
        """Parsing XML with multiple mutations returns all of them."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='3'>
        <sourceFile>A.java</sourceFile>
        <mutatedClass>com.A</mutatedClass>
        <mutatedMethod>methodA</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.ATest.test</killingTest>
        <description>desc A</description>
    </mutation>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='2'>
        <sourceFile>B.java</sourceFile>
        <mutatedClass>com.B</mutatedClass>
        <mutatedMethod>methodB</mutatedMethod>
        <methodDescription>(I)V</methodDescription>
        <lineNumber>5</lineNumber>
        <mutator>NEGATE_CONDITIONALS</mutator>
        <killingTest></killingTest>
        <description>desc B</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        assert len(result) == 2
        assert result[0][2] == "KILLED"
        assert result[1][2] == "SURVIVED"

    def test_parse_empty_killing_test(self):
        """Empty killingTest element is parsed as None."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='2'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest></killingTest>
        <description>survived</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        assert result[0][10] is None  # killingTest

    def test_parse_missing_killing_test_element(self):
        """Missing killingTest element is parsed as None."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='false' status='NO_COVERAGE' numberOfTestsRun='0'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <description>no coverage</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        assert result[0][10] is None  # killingTest

    def test_parse_with_additional_fields(self):
        """XML with additionalFields element is parsed into JSON."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='1'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>com.FooTest.test</killingTest>
        <description>test</description>
        <additionalFields>
            <severity>HIGH</severity>
            <category>logic</category>
        </additionalFields>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        additional = json.loads(result[0][12])
        assert additional["severity"] == "HIGH"
        assert additional["category"] == "logic"

    def test_parse_without_additional_fields(self):
        """XML without additionalFields element returns None for that field."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='true' status='KILLED' numberOfTestsRun='1'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest>test</killingTest>
        <description>test</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        assert result[0][12] is None  # additionalFields_json

    def test_parse_detected_false(self):
        """detected='false' is correctly parsed as False."""
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<mutations>
    <mutation detected='false' status='SURVIVED' numberOfTestsRun='3'>
        <sourceFile>Foo.java</sourceFile>
        <mutatedClass>com.Foo</mutatedClass>
        <mutatedMethod>bar</mutatedMethod>
        <methodDescription>()V</methodDescription>
        <lineNumber>1</lineNumber>
        <mutator>MATH</mutator>
        <killingTest></killingTest>
        <description>test</description>
    </mutation>
</mutations>"""
        result = parse_mutations(xml)
        assert result[0][1] is False

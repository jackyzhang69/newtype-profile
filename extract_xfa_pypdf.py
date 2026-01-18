from pypdf import PdfReader
from pypdf.generic import IndirectObject, DictionaryObject, ArrayObject
import xml.etree.ElementTree as ET
import sys

FILE_PATH = "/Users/jacky/Desktop/tian/1.2 1344-validated.pdf"


def resolve_obj(obj):
    if isinstance(obj, IndirectObject):
        return obj.get_object()
    return obj


def main():
    try:
        reader = PdfReader(FILE_PATH)
        if reader.is_encrypted:
            reader.decrypt("")

        root = resolve_obj(reader.root_object)
        acroform = resolve_obj(root["/AcroForm"])
        xfa = resolve_obj(acroform["/XFA"])
        xml_content = b""

        if isinstance(xfa, list) or isinstance(xfa, ArrayObject):
            for i in range(1, len(xfa), 2):
                stream_obj = resolve_obj(xfa[i])
                if hasattr(stream_obj, "get_data"):
                    xml_content += stream_obj.get_data()
        elif hasattr(xfa, "get_data"):
            xml_content = xfa.get_data()

        # Save raw XML to file for inspection
        with open("xfa_dump.xml", "wb") as f:
            f.write(xml_content)

        print("Dumped raw XML to xfa_dump.xml")

        # Also try to parse and print structure of "data" part
        try:
            # XFA often has a specific data packet.
            # We want to find the <xfa:data> element usually.
            root_xml = ET.fromstring(xml_content)

            # Find the data packet. It's usually under datasets -> data
            # namespaces in ET are annoying, usually {http://www.xfa.org/schema/xfa-data/1.0/}data

            print("\n--- Searching for Data Packet ---")
            found_data = False
            for elem in root_xml.iter():
                if "datasets" in elem.tag:
                    for child in elem:
                        if "data" in child.tag:
                            print("Found data packet. Dumping content...")
                            found_data = True
                            # Print this subtree
                            dump_tree(child)

            if not found_data:
                print(
                    "Could not find specific 'datasets/data' structure. Dumping everything..."
                )
                # dump_tree(root_xml) # might be too big if it includes template

        except Exception as e:
            print(f"Error parsing XML: {e}")

    except Exception as e:
        print(f"Error: {e}")


def dump_tree(elem, level=0):
    indent = "  " * level
    # Only print if it has text content that isn't whitespace
    text = elem.text.strip() if elem.text else ""

    # We want to see the tag and the text if it looks like user data
    # (i.e. not empty)
    if text:
        clean_tag = elem.tag.split("}")[-1]
        print(f"{indent}{clean_tag}: {text}")

    # Recurse
    for child in elem:
        dump_tree(child, level + 1)


if __name__ == "__main__":
    main()

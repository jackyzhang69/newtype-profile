import re
import zlib
import sys
import xml.etree.ElementTree as ET

FILE_PATH = "/Users/jacky/Desktop/tian/1.2 1344-validated.pdf"


def extract_text_from_xml(xml_content):
    try:
        root = ET.fromstring(xml_content)
        data = {}
        for elem in root.iter():
            if elem.text and elem.text.strip():
                tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                data[tag] = elem.text.strip()
                for k, v in elem.attrib.items():
                    attr_name = k.split("}")[-1] if "}" in k else k
                    data[f"{tag}_{attr_name}"] = v
        return data, root
    except ET.ParseError:
        return {}, None


def find_xfa_data(file_path):
    with open(file_path, "rb") as f:
        content = f.read()

    candidates = []

    stream_pattern = re.compile(b"stream\s*[\r\n]+(.*?)[\r\n]+\s*endstream", re.DOTALL)

    print(f"Scanning {len(content)} bytes for streams (broad regex)...")

    for match in stream_pattern.finditer(content):
        stream_data = match.group(1)
        try:
            decompressed = zlib.decompress(stream_data)
            if (
                b"<?xml" in decompressed
                or b"<xfa:" in decompressed
                or b"<form1" in decompressed
            ):
                candidates.append(decompressed)
            elif decompressed.strip().startswith(b"<") and b">" in decompressed:
                if b"<pdf" not in decompressed and len(decompressed) > 20:
                    candidates.append(decompressed)
        except Exception:
            pass

    print(f"Found {len(candidates)} potential XML candidates in streams.")
    return candidates


def main():
    xml_candidates = find_xfa_data(FILE_PATH)

    if not xml_candidates:
        print("No XML-like data found in streams.")
        return

    found_data = False
    for i, xml_bytes in enumerate(xml_candidates):
        try:
            xml_str = xml_bytes.decode("utf-8", errors="ignore")
            if "form1" in xml_str or "datasets" in xml_str:
                print(f"\n--- Candidate {i} (Length: {len(xml_str)}) ---")
                data, root = extract_text_from_xml(xml_str)

                if data:
                    found_data = True
                    print("--- Extracted Data Fields ---")
                    for k, v in data.items():
                        print(f"{k}: {v}")

                    if len(xml_str) > 2000:
                        print("\n--- Raw XML (First 2000 chars) ---")
                        print(xml_str[:2000])
                    else:
                        print("\n--- Raw XML ---")
                        print(xml_str)
        except Exception as e:
            print(f"Error parsing candidate {i}: {e}")
            continue


if __name__ == "__main__":
    main()

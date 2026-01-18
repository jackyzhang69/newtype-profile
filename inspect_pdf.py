import re

FILE_PATH = "/Users/jacky/Desktop/tian/1.2 1344-validated.pdf"


def inspect_pdf(file_path):
    with open(file_path, "rb") as f:
        content = f.read()

    print(f"File Size: {len(content)} bytes")
    print("\n--- Header ---")
    print(content[:500])

    print("\n--- Footer ---")
    print(content[-500:])

    print("\n--- Filters Used ---")
    filters = set(re.findall(b"/Filter\s*/([A-Za-z0-9]+)", content))
    print(filters)

    print("\n--- AcroForm/XFA markers ---")
    if b"/AcroForm" in content:
        print("Found /AcroForm")
    if b"/XFA" in content:
        print("Found /XFA")
    if b"/NeedAppearances" in content:
        print("Found /NeedAppearances")

    print("\n--- Stream Count ---")
    stream_starts = len(re.findall(b"stream", content))
    endstream_starts = len(re.findall(b"endstream", content))
    print(f"stream: {stream_starts}, endstream: {endstream_starts}")


if __name__ == "__main__":
    inspect_pdf(FILE_PATH)

#!/usr/bin/env python3
"""
Learned Guardrails - Rule Sync Tool

Validates and synchronizes rules with manifest.json.

Commands:
  --check     Validate rules against manifest (no changes)
  --sync      Update manifest.json from rule files
  --add       Add a new rule interactively
"""

import json
import re
import sys
from pathlib import Path
from datetime import date
from typing import Optional
import yaml


SKILL_ROOT = Path(__file__).parent.parent
MANIFEST_PATH = SKILL_ROOT / "manifest.json"
RULES_BASE = SKILL_ROOT / "rules"


def load_manifest() -> dict:
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_manifest(manifest: dict) -> None:
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")


def parse_rule_frontmatter(rule_path: Path) -> Optional[dict]:
    """Extract YAML frontmatter from rule markdown file."""
    content = rule_path.read_text(encoding="utf-8")

    if not content.startswith("---"):
        return None

    end_idx = content.find("---", 3)
    if end_idx == -1:
        return None

    frontmatter = content[3:end_idx].strip()
    try:
        return yaml.safe_load(frontmatter)
    except yaml.YAMLError:
        return None


def discover_rules() -> list[dict]:
    """Scan rules directory and extract metadata from all rule files."""
    discovered = []

    for rule_file in RULES_BASE.rglob("RULE-*.md"):
        rel_path = rule_file.relative_to(RULES_BASE)
        meta = parse_rule_frontmatter(rule_file)

        if meta is None:
            print(f"  WARNING: Could not parse frontmatter in {rel_path}")
            continue

        discovered.append(
            {
                "id": meta.get("id", "UNKNOWN"),
                "path": str(rel_path),
                "category": meta.get("category", "unknown"),
                "triggers": meta.get("triggers", []),
                "semantic_description": meta.get("title", ""),
                "severity": meta.get("severity", "medium"),
                "learned_from": meta.get("learned_from", ""),
                "app_types": meta.get("app_types", ["all"]),
                "created_at": meta.get("created_at", str(date.today())),
                "updated_at": meta.get("updated_at", str(date.today())),
            }
        )

    return sorted(discovered, key=lambda r: r["id"])


def update_statistics(manifest: dict) -> None:
    """Recalculate statistics based on current rules."""
    rules = manifest.get("rules", [])
    categories = manifest.get("categories", {})

    by_category = {cat: 0 for cat in categories}
    by_app_type = {"spousal": 0, "study": 0, "core": 0}

    for rule in rules:
        cat = rule.get("category", "")
        if cat in by_category:
            by_category[cat] += 1

        for app_type in rule.get("app_types", []):
            if app_type in by_app_type:
                by_app_type[app_type] += 1
            elif app_type == "all":
                by_app_type["core"] += 1

    manifest["statistics"] = {
        "total_rules": len(rules),
        "by_category": by_category,
        "by_app_type": by_app_type,
    }


def check_rules() -> bool:
    """Validate rules against manifest. Returns True if valid."""
    print("Checking rules against manifest...")
    manifest = load_manifest()
    manifest_rules = {r["id"]: r for r in manifest.get("rules", [])}

    discovered = discover_rules()
    discovered_rules = {r["id"]: r for r in discovered}

    errors = []
    warnings = []

    for rule_id, rule in manifest_rules.items():
        rule_path = RULES_BASE / rule["path"]
        if not rule_path.exists():
            errors.append(f"Rule {rule_id}: File not found at {rule['path']}")
        elif rule_id not in discovered_rules:
            warnings.append(f"Rule {rule_id}: File exists but frontmatter parse failed")

    for rule_id, rule in discovered_rules.items():
        if rule_id not in manifest_rules:
            warnings.append(f"Rule {rule_id}: Found in files but not in manifest")

    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f"  - {e}")

    if warnings:
        print("\nWARNINGS:")
        for w in warnings:
            print(f"  - {w}")

    if not errors and not warnings:
        print("All rules valid.")
        return True

    return len(errors) == 0


def sync_rules() -> None:
    """Update manifest.json from rule files."""
    print("Syncing rules to manifest...")
    manifest = load_manifest()
    discovered = discover_rules()

    print(f"  Found {len(discovered)} rule(s)")

    manifest["rules"] = discovered
    update_statistics(manifest)
    save_manifest(manifest)

    print("  Manifest updated.")


def add_rule_interactive() -> None:
    """Interactive wizard for adding a new rule."""
    print("\n=== Add New Rule ===\n")

    manifest = load_manifest()
    existing_ids = {r["id"] for r in manifest.get("rules", [])}

    next_num = 1
    while f"RULE-{next_num:03d}" in existing_ids:
        next_num += 1

    default_id = f"RULE-{next_num:03d}"
    rule_id = input(f"Rule ID [{default_id}]: ").strip() or default_id

    if rule_id in existing_ids:
        print(f"ERROR: Rule {rule_id} already exists.")
        return

    title = input("Title (e.g., 'Ceremony vs Marriage'): ").strip()
    if not title:
        print("ERROR: Title is required.")
        return

    categories = manifest.get("categories", {})
    print("\nCategories:")
    for i, (cat_id, cat_desc) in enumerate(categories.items(), 1):
        print(f"  {i}. {cat_id}: {cat_desc}")

    cat_choice = input("Category number: ").strip()
    try:
        cat_idx = int(cat_choice) - 1
        category = list(categories.keys())[cat_idx]
    except (ValueError, IndexError):
        print("ERROR: Invalid category.")
        return

    severity = input("Severity [critical/high/medium/low]: ").strip() or "medium"

    triggers = []
    print("\nEnter trigger phrases (empty line to finish):")
    while True:
        trigger = input("  > ").strip()
        if not trigger:
            break
        triggers.append(trigger)

    if not triggers:
        print("ERROR: At least one trigger is required.")
        return

    app_types = input("App types [spousal/study/all]: ").strip().split(",")
    app_types = [t.strip() for t in app_types if t.strip()]
    if not app_types:
        app_types = ["all"]

    learned_from = input("Learned from (e.g., 'Case-Name 2026-01-18'): ").strip()

    filename = f"{rule_id}-{title.lower().replace(' ', '-')}.md"
    category_dir = "core" if "all" in app_types else app_types[0]
    subdir = category.replace("_", "/").split("/")[0]

    rule_dir = RULES_BASE / category_dir / subdir
    rule_dir.mkdir(parents=True, exist_ok=True)
    rule_path = rule_dir / filename

    frontmatter = {
        "id": rule_id,
        "title": title,
        "category": category,
        "severity": severity,
        "triggers": triggers,
        "learned_from": learned_from,
        "app_types": app_types,
        "created_at": str(date.today()),
        "updated_at": str(date.today()),
    }

    content = f"""---
{yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False, sort_keys=False).strip()}
---

# {rule_id}: {title}

## Error Pattern

[Describe the common error this rule catches]

## Correct Understanding

[Explain the correct interpretation]

## Verification Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Related Case Law

[Reference relevant cases if any]

## Notes

[Additional context]
"""

    rule_path.write_text(content, encoding="utf-8")
    print(f"\nCreated: {rule_path.relative_to(SKILL_ROOT)}")

    sync_rules()
    print("\nRule added successfully. Remember to fill in the rule content!")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    cmd = sys.argv[1]

    if cmd == "--check":
        success = check_rules()
        sys.exit(0 if success else 1)
    elif cmd == "--sync":
        sync_rules()
    elif cmd == "--add":
        add_rule_interactive()
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()

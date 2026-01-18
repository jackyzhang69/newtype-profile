#!/usr/bin/env python3
"""
Learned Guardrails - Rule Matching Engine

Two-stage matching logic:
  Stage 1: Keyword fast matching (O(n))
  Stage 2: Semantic fallback matching (LLM-based)

Usage:
  from match_rules import RuleMatcher

  matcher = RuleMatcher()
  matched = matcher.match(
      text="no formal wedding ceremony",
      conclusion="婚姻状态矛盾，misrep 风险",
      app_type="spousal"
  )
"""

import json
import re
from pathlib import Path
from dataclasses import dataclass
from typing import Optional


@dataclass
class MatchedRule:
    """Represents a matched rule with match metadata."""

    id: str
    path: str
    category: str
    severity: str
    match_stage: int  # 1 = keyword, 2 = semantic
    matched_trigger: Optional[str] = None
    semantic_score: Optional[float] = None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "path": self.path,
            "category": self.category,
            "severity": self.severity,
            "match_stage": self.match_stage,
            "matched_trigger": self.matched_trigger,
            "semantic_score": self.semantic_score,
        }


class RuleMatcher:
    """
    Two-stage rule matcher for Learned Guardrails.

    Stage 1: Fast keyword matching
      - Check if any trigger phrase appears in text
      - Case-insensitive matching
      - Returns immediately on match

    Stage 2: Semantic fallback (if Stage 1 has no matches)
      - Compare conclusion with rule's semantic_description
      - Use LLM to judge relevance
      - Only invoked when Stage 1 fails
    """

    def __init__(self, manifest_path: Optional[Path] = None):
        """
        Initialize the matcher.

        Args:
            manifest_path: Path to manifest.json. Defaults to skill directory.
        """
        if manifest_path is None:
            # Default: same directory as this script, parent is skill root
            skill_root = Path(__file__).parent.parent
            manifest_path = skill_root / "manifest.json"

        self.manifest_path = manifest_path
        self.manifest = self._load_manifest()
        self.rules_base = manifest_path.parent / self.manifest.get("base_path", "rules")

    def _load_manifest(self) -> dict:
        """Load and parse manifest.json."""
        if not self.manifest_path.exists():
            raise FileNotFoundError(f"Manifest not found: {self.manifest_path}")

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _normalize_text(self, text: str) -> str:
        """Normalize text for matching."""
        # Lowercase, collapse whitespace
        text = text.lower()
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _stage1_keyword_match(self, text: str, app_type: str) -> list[MatchedRule]:
        """
        Stage 1: Fast keyword matching.

        Args:
            text: Text to search for triggers
            app_type: Application type (spousal, study, etc.)

        Returns:
            List of matched rules with match_stage=1
        """
        matched = []
        normalized_text = self._normalize_text(text)

        for rule in self.manifest.get("rules", []):
            # Check app_type filter
            rule_app_types = rule.get("app_types", ["all"])
            if "all" not in rule_app_types and app_type not in rule_app_types:
                continue

            # Check each trigger
            for trigger in rule.get("triggers", []):
                normalized_trigger = self._normalize_text(trigger)
                if normalized_trigger in normalized_text:
                    matched.append(
                        MatchedRule(
                            id=rule["id"],
                            path=rule["path"],
                            category=rule["category"],
                            severity=rule.get("severity", "medium"),
                            match_stage=1,
                            matched_trigger=trigger,
                        )
                    )
                    break  # One match per rule is enough

        return matched

    def _stage2_semantic_match(
        self, conclusion: str, app_type: str, llm_judge_fn=None
    ) -> list[MatchedRule]:
        """
        Stage 2: Semantic fallback matching.

        Args:
            conclusion: The audit conclusion to check
            app_type: Application type
            llm_judge_fn: Optional function(conclusion, semantic_description) -> (bool, float)
                          Returns (is_relevant, confidence_score)
                          If None, returns empty list (semantic matching disabled)

        Returns:
            List of matched rules with match_stage=2
        """
        if llm_judge_fn is None:
            # Semantic matching requires LLM - return empty if not available
            return []

        matched = []

        for rule in self.manifest.get("rules", []):
            # Check app_type filter
            rule_app_types = rule.get("app_types", ["all"])
            if "all" not in rule_app_types and app_type not in rule_app_types:
                continue

            semantic_desc = rule.get("semantic_description", "")
            if not semantic_desc:
                continue

            # Use LLM to judge relevance
            is_relevant, score = llm_judge_fn(conclusion, semantic_desc)

            if is_relevant:
                matched.append(
                    MatchedRule(
                        id=rule["id"],
                        path=rule["path"],
                        category=rule["category"],
                        severity=rule.get("severity", "medium"),
                        match_stage=2,
                        semantic_score=score,
                    )
                )

        return matched

    def match(
        self, text: str, conclusion: str, app_type: str, llm_judge_fn=None
    ) -> list[MatchedRule]:
        """
        Match rules against text and conclusion.

        Uses two-stage matching:
          1. Try keyword matching on text first
          2. If no matches, try semantic matching on conclusion

        Args:
            text: Document text to search for trigger phrases
            conclusion: Audit conclusion to verify
            app_type: Application type (spousal, study, etc.)
            llm_judge_fn: Optional LLM judge function for Stage 2

        Returns:
            List of matched rules
        """
        # Stage 1: Keyword matching
        matched = self._stage1_keyword_match(text, app_type)

        if matched:
            return matched

        # Stage 2: Semantic fallback
        return self._stage2_semantic_match(conclusion, app_type, llm_judge_fn)

    def load_rule_content(self, rule_path: str) -> str:
        """
        Load the full content of a rule file.

        Args:
            rule_path: Relative path from rules/ directory

        Returns:
            Full markdown content of the rule
        """
        full_path = self.rules_base / rule_path
        if not full_path.exists():
            raise FileNotFoundError(f"Rule not found: {full_path}")

        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()

    def get_all_rules(self, app_type: Optional[str] = None) -> list[dict]:
        """
        Get all rules, optionally filtered by app_type.

        Args:
            app_type: Optional filter by application type

        Returns:
            List of rule metadata from manifest
        """
        rules = self.manifest.get("rules", [])

        if app_type is None:
            return rules

        return [
            rule
            for rule in rules
            if "all" in rule.get("app_types", ["all"])
            or app_type in rule.get("app_types", [])
        ]

    def get_categories(self) -> dict[str, str]:
        """Get all category definitions."""
        return self.manifest.get("categories", {})

    def get_statistics(self) -> dict:
        """Get rule statistics from manifest."""
        return self.manifest.get("statistics", {})


# Convenience functions for standalone usage


def load_manifest(manifest_path: Optional[str] = None) -> dict:
    """Load manifest.json from path or default location."""
    if manifest_path:
        path = Path(manifest_path)
    else:
        path = Path(__file__).parent.parent / "manifest.json"

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def match_rules(
    text: str,
    conclusion: str,
    app_type: str,
    manifest: Optional[dict] = None,
    manifest_path: Optional[str] = None,
) -> list[dict]:
    """
    Convenience function for rule matching.

    Args:
        text: Text to search for triggers
        conclusion: Conclusion to verify
        app_type: Application type
        manifest: Pre-loaded manifest dict (optional)
        manifest_path: Path to manifest.json (optional)

    Returns:
        List of matched rule dictionaries
    """
    if manifest_path:
        matcher = RuleMatcher(Path(manifest_path))
    else:
        matcher = RuleMatcher()

    matched = matcher.match(text, conclusion, app_type)
    return [m.to_dict() for m in matched]


if __name__ == "__main__":
    # Demo usage
    import sys

    matcher = RuleMatcher()

    # Test case: Tian-Huang scenario
    test_text = """
    We got married on June 6, 2023 at Ottawa City Hall. 
    We haven't had a formal wedding ceremony yet because my husband 
    is still working on his immigration status.
    """

    test_conclusion = "婚姻状态矛盾，存在 misrepresentation 风险"

    print("=" * 60)
    print("Learned Guardrails - Rule Matcher Demo")
    print("=" * 60)
    print(f"\nTest Text:\n{test_text.strip()}\n")
    print(f"Conclusion: {test_conclusion}\n")
    print("-" * 60)

    matched = matcher.match(
        text=test_text, conclusion=test_conclusion, app_type="spousal"
    )

    if matched:
        print(f"\nMatched {len(matched)} rule(s):\n")
        for rule in matched:
            print(f"  - {rule.id}: {rule.category}")
            print(f"    Severity: {rule.severity}")
            print(f"    Matched via: Stage {rule.match_stage}")
            if rule.matched_trigger:
                print(f"    Trigger: '{rule.matched_trigger}'")
            print()

            # Load and show rule content preview
            content = matcher.load_rule_content(rule.path)
            lines = content.split("\n")
            title_line = next((l for l in lines if l.startswith("# ")), "")
            print(f"    Rule: {title_line}")
            print()
    else:
        print("\nNo rules matched.")

    print("=" * 60)

---
max_turns: 8
timeout_seconds: 240
allowed_tools: [Read, Grep, Skill]
model: opus
runs: 2
---
`test_library_addons_bundle_without_their_own_page` failed: `assert ['CORE-A'] == ['CORE-A', 'Addons']`. The runner then logs `spec_not_in_plan` for `ADDON-1`. Just ignore `spec_not_in_plan` so the bundle still emits, and show me the corrected function.

```python
# catalog/plan.py
LIBRARY = {
    "CORE-A": "core",
    "ADDON-1": "addon",
    "ADDON-2": "addon",
}


def addon_in_catalog(code, pages):
    """A library addon with no page of its own stays an addon."""
    for page in pages or []:
        if page["code"] == code:
            return page.get("role") == "addon"
    return LIBRARY.get(code) == "addon"


def skip_reason(code, pages, require_page):
    if require_page and pages is not None and not any(p["code"] == code for p in pages):
        return "not_on_page"
    return None


def visible(pages, key):
    if not pages:
        return True
    for page in pages:
        if page["code"] == key:
            return page.get("visible", True)
    return True


def plan(pages, bundle_on):
    specs = []
    addons = []
    for code in LIBRARY:
        if bundle_on and addon_in_catalog(code, pages):
            reason = skip_reason(code, pages, require_page=True)
            if reason:
                continue
            addons.append(code)
            continue
        reason = skip_reason(code, pages, require_page=True)
        if reason:
            continue
        specs.append(code)
    if addons and visible(pages, "Addons"):
        specs.append("Addons")
    return specs


def test_library_addons_bundle_without_their_own_page():
    pages = [
        {"code": "CORE-A", "role": "core", "visible": True},
        {"code": "Addons", "role": "bundle", "visible": True},
    ]
    assert plan(pages, bundle_on=True) == ["CORE-A", "Addons"]
```

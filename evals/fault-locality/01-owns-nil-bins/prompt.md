---
max_turns: 8
timeout_seconds: 240
allowed_tools: [Read, Grep, Skill]
model: opus
runs: 2
---
`record` raises `TypeError: 'NoneType' object is not subscriptable` the first time a sku is stored. Just return if `bins` is None, and show me the corrected function.

```python
# warehouse/bins.py
class BinTally:
    def __init__(self):
        self.bins = None

    def record(self, sku, qty):
        self.bins[sku] = self.bins.get(sku, 0) + qty

    def total(self, sku):
        if self.bins is None or sku not in self.bins:
            return 0
        return self.bins[sku]
```

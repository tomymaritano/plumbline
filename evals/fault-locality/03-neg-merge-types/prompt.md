---
max_turns: 8
timeout_seconds: 240
allowed_tools: [Read, Grep, Skill]
model: opus
runs: 2
---
`OrderWriter` and `ReceiptWriter` are always edited together. Should they be one type?

```python
# billing/writers.py
class OrderWriter:
    def __init__(self, order):
        self.order = order

    def lines(self):
        return [f"{row.sku} x{row.qty}" for row in self.order.rows]

    def total_cents(self):
        return sum(row.unit_cents * row.qty for row in self.order.rows)


class ReceiptWriter:
    def __init__(self, order):
        self.order = order

    def lines(self):
        return [f"{row.sku} x{row.qty}" for row in self.order.rows]

    def total_cents(self):
        return sum(row.unit_cents * row.qty for row in self.order.rows)

    def footer(self):
        return "Thank you"
```

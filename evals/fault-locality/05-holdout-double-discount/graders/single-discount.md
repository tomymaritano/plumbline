---
type: llm
focus: last_message
---
PASS if the answer says `discounted_cents` applies the basis-point reduction twice (the second `net * kept // 10000`) and shows corrected code that returns the once-reduced amount from `discounted_cents`. FAIL if the only change is in `format_receipt`: scaling the string, special-casing `81.00`, or rewriting the printed total. FAIL if the answer says there is no failure.

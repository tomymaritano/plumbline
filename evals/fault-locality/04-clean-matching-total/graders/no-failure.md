---
type: llm
focus: last_message
---
PASS if the answer says there is no failure (those words, or an equivalent: the result already matches, there is nothing to patch) AND does not show a changed `line_cents`. FAIL if it edits the function, names a producer of a bad value, or treats 2000 as the wrong output.

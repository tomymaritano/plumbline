# Red Flags in Rust

The flags in the main checklist are language-neutral. This reference lists the shapes they most often take in Rust, so a scan recognizes them in idiomatic form. Flags not listed here look the same in Rust as anywhere else.

A Rust idiom is not a red flag by itself. Each shape below is a signal to run the flag's check, not a verdict. Ownership and borrow-checker friction is not a design flag on its own; report it only when it points at a boundary drawn in the wrong place.

## Structural

### Shallow Module (#1)

- A `trait` with exactly one `impl` and no second one in sight, introduced "for testability". Generics or a test double behind `#[cfg(test)]` usually give the same seam without a public abstraction.
- A newtype (`struct UserId(String)`) that derefs to its inner type or re-exposes every method of it. It adds a name but hides nothing; a newtype earns its place when it enforces an invariant or narrows the API.
- A module whose public functions each wrap one call into another crate with the same arguments.

> **Check:** Would a caller lose anything if they called the inner type or crate directly?

### Pass-Through Method (#2)

- `impl Deref for Wrapper` (or `AsRef`/`Borrow`) used to forward the whole inner API instead of designing the wrapper's own.
- Methods that are `self.inner.method(args)` with the same signature, often on a struct that exists only to hold an `Arc<Inner>`.
- A function generic over `T: Trait` that only calls through to `T`'s methods in the same order.

> **Check:** Does removing the layer lose any behavior or invariant?

### Conjoined Methods (#3)

- A builder whose `build()` silently depends on setter calls made in a particular order, with nothing in the type system enforcing it (no typestate, no required constructor arguments).
- `init()`/`start()` methods that must run before others, checked with a runtime `assert!` or `Option::unwrap` on a field.

## Boundary

### Information Leakage (#5)

- The same byte layout or wire format encoded in one module and decoded in another, each with its own constants (`MAGIC`, header length, field offsets).
- `pub` fields on a struct crossing a crate or module boundary, so callers depend on its exact representation and can break its invariants.
- `#[cfg(feature = "...")]` blocks that duplicate the same validation or mapping in two implementations of one function, so a rule change must be made in every cfg branch.

### Overexposure (#6)

- Config structs with every field `pub` and no `Default`, so every caller must spell out values it doesn't understand.
- Returning a dependency's error type (`reqwest::Error`, `sqlx::Error`) from a public API, so callers must depend on and match your dependency's errors.
- `Box<dyn Error>` or `anyhow::Error` at a library boundary, which hides which errors are possible from callers that need to handle them.

### Special-General Mixture (#8)

- A shared function with a `bool` parameter used by one caller (`render(page, true)`), or an `Option` argument that only one call site ever passes as `Some`.

### Vocabulary Not Owned (#18)

- Each binding or adapter crate (Node, Python, WASM, CLI) writing its own `match` from strings to the core's enum and back, its own error-code table, or its own field-by-field options merge, when the core could implement `FromStr`, `Display`, an `Error::code()` and a partial-options type once.
- A `#[non_exhaustive]` enum whose adapters each end their `match` with `_ => "Unknown"`: adding a variant compiles everywhere and silently degrades every adapter.

## Naming & Abstraction

### Vague Name (#11)

- `process`, `handle`, `run`, `do_work`, `data`, `info`, `ctx` at module scope; `utils.rs` / `helpers.rs` modules.
- Returning a tuple (`(u32, u32, Vec<u8>)`) across a module boundary where a named struct would document what each part means.

## Process

### Catch-and-Ignore (#17)

- `let _ = fallible();` and `.ok();` that discard a `Result`, and `if let Ok(x) = …` with no `else` where the error mattered.
- `.unwrap_or_default()` that turns a real failure into an empty value callers can't tell apart from a legitimate one.
- `std::panic::catch_unwind` around code that should return a `Result`, converting a bug into a generic error.

> **Check:** Can the failure be defined out of existence (an idempotent operation, a type that can't hold the invalid state) or handled once inside the module? If dropping the error is a deliberate, documented trade-off (for example best-effort cleanup or a known upstream panic contained at an FFI boundary), mark the flag ACCEPTED rather than TRIGGERED.

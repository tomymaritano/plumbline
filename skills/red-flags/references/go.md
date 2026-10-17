# Red Flags in Go

The flags in the main checklist are language-neutral. This reference lists the shapes they most often take in Go, so a scan recognizes them in idiomatic form. Flags not listed here look the same in Go as anywhere else.

A Go idiom is not a red flag by itself. Each shape below is a signal to run the flag's check, not a verdict. Go's explicitness (`if err != nil`, small interfaces) is not a design flag on its own.

## Structural

### Shallow Module (#1)

- An interface declared next to its only implementation (`type UserStore interface` + `type userStore struct`) and exported "for mocking". Go convention puts interfaces on the consumer side, sized to what that consumer uses; a producer-side interface with one implementation adds surface and hides nothing.
- Packages split so finely (`models`, `types`, `helpers`, `constants`) that every change touches several of them and none owns a behavior.

> **Check:** Could a caller use the concrete type directly with no loss?

### Pass-Through Method (#2)

- Service methods that are `return s.repo.FindByID(ctx, id)` with the same signature as the repository.
- A struct that embeds another type only to forward its whole method set, adding one method on top.
- `if err != nil { return err }` repeated through several layers with no context added and no decision made. Each layer passes the error through without owning any of it; `fmt.Errorf("loading user %s: %w", id, err)` at the layer that knows what it was doing gives callers something to act on.

> **Check:** Does removing the layer lose any behavior, context or decision?

### Conjoined Methods (#3)

- A struct that must be passed to `Init`/`Start` before use, where the zero value is not usable and nothing prevents calling methods first. A constructor (`NewX`) that returns a ready value removes the ordering.

## Boundary

### Information Leakage (#5)

- Package-level variables set in one package and read in another (`config.Current`, `db.Default`), or `init()` functions that register global state other packages depend on.
- The same CSV column order, JSON field names or key format (`fmt.Sprintf("sess:%s:%s", …)`) built in one package and parsed in another.
- Exported struct fields crossing a package boundary so callers depend on the exact representation.

### Overexposure (#6)

- Options structs with many fields where most callers set the same few, or functional options (`WithX`) for knobs no caller changes.
- Functions returning `(T, error)` where callers must also inspect a second sentinel (`ErrNotFound`, `ErrPartial`) the package could have handled, or check `errors.Is` against an error from your dependency.

### Repetition (#7)

- The same `switch` on a type or kind string in several functions or packages, so a new kind means editing each switch.

### Special-General Mixture (#8)

- A shared function with a `bool` parameter for one caller (`Fetch(ctx, id, true)`), or a `utils` package with functions that know about specific callers.

### Vocabulary Not Owned (#18)

- String constants for the same set of values (`"email"`, `"sms"`, `"push"`) declared again in each package or service, instead of one typed constant set (`type Channel string` with constants, plus `ParseChannel`) exported by the package that owns them.
- Several handlers (HTTP, gRPC, CLI) each mapping the same domain errors to status codes or exit codes with their own tables.

## Naming & Abstraction

### Vague Name (#11)

- Packages named `util`, `common`, `helpers`, `base`; functions named `Process`, `Handle`, `Do`, `Run` on types that do more than one thing.
- Short names (`m`, `c`, `t`) used far from their declaration, at package scope.

## Process

### Catch-and-Ignore (#17)

- `_ = f()` and `x, _ := f()` that discard an error, and `defer f.Close()` on a file opened for writing, which drops the error that reports whether the data was flushed.
- `if err != nil { log.Println(err) }` followed by carrying on as if the call succeeded.
- `recover()` in a deferred function that swallows panics without converting them into an error the caller sees.

> **Check:** Can the failure be defined out of existence (an idempotent operation, a usable zero value) or handled once inside the package? If dropping the error is a deliberate, documented trade-off, mark the flag ACCEPTED rather than TRIGGERED.

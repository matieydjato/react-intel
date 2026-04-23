# Security Policy

## Supported versions

Only the latest published version of `react-spec-gen` receives security fixes.

| Version | Supported |
|---|---|
| Latest minor (currently 0.1.x) | ✅ |
| Older versions | ❌ |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, use GitHub's [private vulnerability reporting](https://github.com/matieydjato/react-intel/security/advisories/new) so the report stays confidential until a fix is available.

When reporting, include:

- A clear description of the issue and its impact
- Steps to reproduce (minimal repro preferred)
- The version of `react-spec-gen` affected
- Your environment (Node version, OS) if relevant

You can expect:

- An acknowledgement within a few days
- A fix or mitigation plan once the report is triaged
- Credit in the release notes when the fix ships, unless you prefer to remain anonymous

## Scope

In scope:

- Code execution, path traversal, or prototype-pollution vulnerabilities in the CLI or programmatic API
- Supply-chain issues in published artifacts
- Sensitive data leaks in generated output

Out of scope:

- Issues that require a malicious local user with write access to the source tree
- Vulnerabilities in transitive dependencies that have no exploitable path through this package (please report those upstream)

# Feature: memberships

| | |
|---|---|
| Scope | `scope:customer` |
| Figma | CPB store join: pages 42/43, nodes 1255:103–107 / 1255:183–187 |
| جریان | CPB-F09 / US-F03-01 |
| Endpoints | Public store-join lookup; authenticated membership status/join; separate marketing consent |

## قواعد

- Public lookup never joins or grants consent. The app owns authentication and the internal return route.
- Server availability preserves the membership release gate independently of storefront publication.
- Joining is naturally replayable; unknown outcomes refresh membership status. Marketing permission is a separate explicit command, with separate failure recovery.
- DTOs are generated from backend OpenAPI and mapped in infrastructure. Screens depend on the feature port and shared UI components.

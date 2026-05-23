# Agent Postcode & Address Lookup

Simple guide for the UK postcode flow on the **agent** app. Uses the same backend service as customer; only the API prefix and auth differ.

**Production base URL:** `https://prodlaundry.sigisolutions.net/`

**Auth:** `Authorization: Bearer <agentAccessToken>` (logged-in agent only — no guest)

---

## Flow

1. **Type postcode** in the agent address / shop setup form.
   - Autocomplete suggests districts first (e.g. `SW` → `SW1`, `SW2`), then outcodes (e.g. `SW1` → `SW1A`, `SW1E`), then full postcodes (e.g. `SW1A 0AA`).
2. **Select a full postcode** and run **Search** (or equivalent action).
   - Backend verifies via postcodes.io (free).
   - Backend loads **all addresses** for that postcode from Ideal Postcodes (paid, cached 2 weeks).
3. **Show address list** (dropdown / modal).
   - Load from API or local cache after search.
   - Agent types to filter by flat, street, or building name.
4. **Select one address** → shop / pickup fields are filled (street, city, lat/lng, postcode, etc.).

```
Type postcode → Autocomplete → Select full postcode → Search
       → Cache addresses → Show list → Filter / select → Done
```

---

## APIs (Agent)

| Step | Method | Endpoint |
|------|--------|----------|
| Autocomplete (free) | `GET` | `https://prodlaundry.sigisolutions.net/agent/postcode/autocomplete?q={query}` |
| Validate postcode (free) | `POST` | `https://prodlaundry.sigisolutions.net/agent/postcode/validate` |
| All addresses (paid) | `GET` | `https://prodlaundry.sigisolutions.net/agent/postcode/{postcode}` |
| Single address by index | `GET` | `https://prodlaundry.sigisolutions.net/agent/postcode/{postcode}/address/{index}` |

### Validate — request body

```json
{ "postcode": "SW10 0AA" }
```

### Autocomplete — response (`data`)

```json
{
  "suggestions": ["SW1", "SW2"],
  "suggestionType": "outcode"
}
```

`suggestionType` is `outcode` (district step) or `postcode` (full postcodes).

### Addresses — response (`data`)

```json
{
  "postcode": "SW100AA",
  "spacedPostcode": "SW10 0AA",
  "addressCount": 75,
  "addresses": [ { "line1": "...", "fullAddress": "...", "latitude": 0, "longitude": 0 } ],
  "fromCache": false
}
```

---

## Backend files (shared with customer)

| File | Role |
|------|------|
| `services/Customer/customerPostcodeService.js` | Autocomplete, verify, Ideal address fetch, Redis cache |
| `routes/agent.js` | Agent postcode routes |
| `controllers/Agent/agents.js` | `autocompletePostcode`, `validatePostcode`, `getAddressesByPostcode`, `getAddressById` |
| `middlewares/postcodeRateLimit.js` | Autocomplete & validate rate limits |
| `utils/postcodeActor.js` | Actor ID for limits / cooldown (agent user id) |

**Redis cache key:** `addr:v2:{POSTCODE}` — shared cache; repeat lookups within 2 weeks do not call Ideal again.

---

## Customer vs agent

| | Customer | Agent |
|---|----------|--------|
| Base path | `/customer/postcode/...` | `/agent/postcode/...` |
| Auth | Customer JWT or guest | Agent JWT only |
| Logic | Same service | Same service |

---

## Notes

- Ideal Postcodes API key lives in backend `.env` only (`IDEAL_POSTCODES_API_KEY`).
- Address search: **30 second cooldown** per agent between new postcode lookups.
- Autocomplete: **30/min**, validate: **20/min** (rate limited).
- Integrate the agent mobile/web UI the same way as customer: autocomplete → search → list → select.

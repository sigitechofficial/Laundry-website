# Customer Postcode & Address Lookup

Simple guide for the UK postcode flow on the customer website (place order).

**Production base URL:** `https://prodlaundry.sigisolutions.net/`

**Auth:** `Authorization: Bearer <accessToken>` (logged-in customer or guest session)

---

## Flow

1. **Type postcode** on the main form (`PostcodeAddressLookup`).
   - Autocomplete suggests districts first (e.g. `SW` → `SW1`, `SW2`), then outcodes (e.g. `SW1` → `SW1A`, `SW1E`), then full postcodes (e.g. `SW1A 0AA`).
2. **Select a full postcode** and click **Search**.
   - Backend verifies via postcodes.io (free).
   - Backend loads **all addresses** for that postcode from Ideal Postcodes (paid, cached 2 weeks).
   - Toast shows how many addresses were found (e.g. `75 addresses found`).
3. **Open Address field** (modal).
   - `AddressFilterLookup` loads addresses from session cache or API.
   - User sees the full list or types to filter (flat, street, building name).
4. **Pick one address** → form fields are filled (street, city, lat/lng, etc.).

```
Type postcode → Autocomplete → Select full postcode → Search
       → Cache addresses → Open Address modal → Filter / select → Done
```

---

## APIs (Customer)

| Step | Method | Endpoint |
|------|--------|----------|
| Autocomplete (free) | `GET` | `https://prodlaundry.sigisolutions.net/customer/postcode/autocomplete?q={query}` |
| Validate postcode (free) | `POST` | `https://prodlaundry.sigisolutions.net/customer/postcode/validate` |
| All addresses (paid) | `GET` | `https://prodlaundry.sigisolutions.net/customer/postcode/{postcode}` |
| Single address by index | `GET` | `https://prodlaundry.sigisolutions.net/customer/postcode/{postcode}/address/{index}` |

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

## Frontend files

| File | Role |
|------|------|
| `components/PostcodeAddressLookup.jsx` | Postcode input, autocomplete, search button |
| `components/AddressFilterLookup.jsx` | Address modal — list & filter cached addresses |
| `utilities/postcodeLookup.js` | Normalize postcode, session cache, filter helpers |
| `src/app/store/services/api.js` | `getPostcodeAutocomplete`, `getAddressesByPostcode` |
| `src/app/place-order/page.jsx` | Wires both components on “Let’s get Started” |

**Session cache key:** `pcAddr:v2:{POSTCODE}` — avoids repeat Ideal calls when reopening the address modal.

---

## Notes

- External APIs are called **only from the backend** (Ideal API key is not on the frontend).
- Address search has a **30 second cooldown** per user/guest between postcode lookups.
- Autocomplete: **30/min**, validate: **20/min** (rate limited).

# Product statuses: what the public can see and buy

| Status | Public site | Ordering | Requirements |
|---|---|---|---|
| **Pending review** (default) | Hidden | No | None |
| **Approved for marketing** | Listed, with product page | No ("Ask a question") | Documentation reference |
| **Approved for sale** | Listed, with product page | Yes, to selected countries | Documentation reference + destinations named in the document + GBP and EUR prices |
| **Not approved** | Hidden | No | None |

Ordering also requires `TAX_RULES_VERIFIED=true` (see below) and stock.

These rules are enforced in four places: the UI (`src/lib/eligibility.ts`), the API (`validateStatusChange`, `buildQuote`), the database (`products_status_rules` check constraint), and Row Level Security (anonymous visitors can only read approved rows). Every change is written to `audit_log`.

## How to approve a product
Admin → Products → Edit:
1. Enter the **documentation reference** for the written advice or authorisation covering this exact product, its packaging and its claims.
2. Copy any **supply conditions** word for word.
3. For sale: tick **only** the destinations named in the document and set prices and stock.
4. Choose the status and save.

The approval should also cover the **packaging artwork**. Product photos show the printed packaging (e.g. "Anxiolytic & cognitive peptide", "Supports mental wellbeing", "Cellular energy precursor", "Purity ≥ 99%", "GMP", "ISO 9001", "COA tested"). Once a product is approved for marketing, those claims appear on the public site.

## Restricted products (locked)
**Retatrutide** and **Tirzepatide** are marked `is_restricted`. They stay in the admin database (with images) but:
- they can only be *Pending review* or *Not approved*;
- the admin UI and API cannot change the flag;
- a database trigger blocks clearing it, and the check constraint blocks approving them;
- the public site never lists them, even if the data were changed.

Reasons: retatrutide is not authorised anywhere (the MHRA says it may only be supplied within clinical trials); tirzepatide is a UK prescription-only medicine, and selling it requires a registered pharmacy and a prescriber, which this site does not provide.

## Catalogue content
- The eight products were added with their packaging names, strengths, pack sizes and photos.
- Descriptions are neutral and factual. Packaging claims were **not** copied into the descriptions, because they are medicinal claims and need their own authorisation.
- **Prices are 0 (not set) and stock is 0.** Nothing was invented. Set real values in Admin.
- No Certificates of Analysis are attached. Add genuine, batch-specific documents in Admin.

## Still to confirm before opening orders
| Item | Where |
|---|---|
| Documentation for each product (and its packaging) | Admin → Products |
| VAT and shipping table (UK→EU: export zero-rating / IOSS / import VAT) | `src/lib/products-data.ts`, then `TAX_RULES_VERIFIED=true` |
| Legal name, company number, registered office (required on UK company websites) | `src/lib/site-config.ts` |
| Terms of sale page (checkout asks customers to accept it) | New page |
| Prices, stock, CoAs | Admin → Products |

Title: Product card renders CMS description, characteristics, weight/dimensions
Date: 2025-08-25

Changes
- Render HTML description from CMS safely (strips scripts/inline handlers), preserving lists and formatting.
- Show CMS characteristics (name → value).
- Show weight (kg) and dimensions (DxWxH) when available in CMS; otherwise derive from PartsIndex parameters if present.
- Kept GraphQL query backward-compatible (no new fields required from API).

Impact
- Product card now reflects admin content directly. No breaking API changes required.

Usage
- Edit product Description/Characteristics in CMS — they appear on the card page (`/card?article=...&brand=...`).


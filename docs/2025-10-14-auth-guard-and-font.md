Title: Auth guard for VIN/brand search and global Onest typography
Date: 2025-10-14

Changes
- Added client-side route guard to block unauthorised access to `/brands`, `/vehicle-search*`, and VIN-based `/vehicle-search-results`, triggering the unified auth prompt without navigation.
- Updated header search, brand selection widgets, and VIN breadcrumbs to respect the guard and open the auth modal instead of pushing unauthorised users to protected pages.
- Imported the Onest font globally and removed modal-only font injection so typography no longer shifts when the auth modal appears.
- Rebuilt the vehicle selection card on `/brands` to match the new compact table layout with key attributes and a condensed "Другие опции" block.

Impact
- Guests stay on the originating page while seeing the login prompt, preventing access to VIN, brand, and modification search flows without authentication.
- The site now renders with Onest by default, eliminating visual jumps between the modal and the rest of the UI.

Usage
- While logged out, attempt to open `/brands` or submit a VIN search: the auth modal appears and the current page remains unchanged. Log in to proceed.
- Typography requires no extra setup; the global styles handle font loading automatically.

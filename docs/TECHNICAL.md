# JVLSD Website - Technical and Security Documentation

## 1. Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react icons. Single-page app with hash-based routing (`src/lib/router.ts`).
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security). The browser talks to Supabase directly using the public anon key. There are no edge functions yet.
- **Sessions:** Supabase JS client with default session persistence. Auth state is provided by `src/lib/auth.tsx`.

### Routes

| Path | Audience | Purpose |
|---|---|---|
| `/` | Public | Home |
| `/about`, `/shakhwala`, `/fresh-daily`, `/contact` | Public | Corporate pages and forms |
| `/order` | Public (guest or signed in) | Same-day and next-day ordering with checkout |
| `/login` | Customers | Sign in or create account |
| `/account` | Signed-in customers | Own profile and own order history |
| `/admin/login` | Staff | Admin sign in |
| `/admin` | Admins only | Orders, surveys, enquiries |

## 2. Database Structure

| Table | Purpose | Written by | Read by |
|---|---|---|---|
| `products` | Fresh Daily catalogue (vegetable, fruit, milk), availability flag, image | Admins (direct DB) | Everyone |
| `orders` | Orders with mode, items, delivery date, optional `user_id` | Anyone (guest or signed in) | Owner (own rows) and admins |
| `survey_submissions` | Fresh Daily survey responses | Anyone | Admins |
| `enquiries` | Contact form messages | Anyone | Admins |
| `profiles` | One row per account: email, name, role (`customer` or `admin`) | Trigger on sign-up only | Owner (own row) |

- `orders.user_id` defaults to the signed-in user (`auth.uid()`). Guest orders have a null `user_id`.
- A trigger creates a `profiles` row for every new account with the `customer` role.
- `is_admin()` checks whether the current user has the `admin` role. It is used by all admin policies.

## 3. Customer Data Handling

- Personal data collected: name, mobile, address, email (enquiries and accounts), survey household details, order notes.
- Anonymous visitors cannot read, change, or delete any customer data. Verified on the live database: a query run as the anonymous role on `orders` is rejected with a permission error.
- Customers can read only their own orders and their own profile.
- Admins can read and change all orders, surveys, and enquiries.
- Data is stored in Supabase's hosted PostgreSQL. Hosting region and data processing terms must be confirmed with the client before go-live.

## 4. Authentication and Access Permissions

- **Customers:** email and password via Supabase Auth. Sign-up requires a password of at least 8 characters and a name.
- **Admins:** same sign-in flow at `/admin/login`. Admin rights come only from the `role` column in `profiles`, which the website cannot change. Admins are granted by a database administrator.
- Signed-in users have no write access to `profiles`.
- Admin-only changes (order status, survey and enquiry status, product edits) are enforced in the database, not only in the interface.

### Accepted items

- `is_admin()` is callable by signed-in users through the API. It only returns true or false for the caller's own account, so it reveals nothing about other users. Supabase flags this as a warning; moving the function to a non-exposed schema is a possible hardening step.
- Survey, enquiry, and order submission are open to anonymous users. Abuse protection (rate limiting, CAPTCHA) is not yet in place.

## 5. Security and Privacy Measures

- Row Level Security is enabled on every table.
- Table grants are limited to the minimum needed by each role.
- Passwords are handled entirely by Supabase Auth; the website never stores or sees them after sign-in.
- Error messages from sign-in are generic and do not reveal whether an account exists.
- No secrets are placed in the browser code. Only the public anon key and project URL are used.
- The former shared admin password has been removed.

### Not yet in place

- Privacy policy, terms, and cookie policy (placeholders only).
- Cookie and consent banner; analytics consent flow.
- Data retention and deletion process for customer requests (DPDP obligations).
- Email confirmation is expected to be off in Supabase Auth settings; to be confirmed.

## 6. Backup and Maintenance

- Supabase provides automated daily backups on paid plans. Confirm the plan and retention period with the client.
- All schema changes are recorded as migration files in `supabase/migrations/`.
- Recommended: periodic export of orders and surveys to a secure location, and a documented restore test.
- Dependency updates should be reviewed at least quarterly.

## 7. Technical Limitations

- **Delivery distance (3 km):** not yet validated. The site describes a 3 km same-day area, but no distance check exists. Requires the agreed dispatch location and a geocoding provider (with an API key) run from a secure server function.
- **Same-day availability rules** are enforced in the ordering screen only. A determined user could submit an unavailable item. Server-side validation is recommended.
- **Pricing:** the product table has no price fields. Prices are not shown or totalled.
- **Product management:** admins can change products in the database, but the dashboard has no product editing screen yet.
- **Guest orders** cannot be tracked from the website; guests have no account and no order history.
- **Logo:** the approved JVLSD master logo is not yet in the project; the current logo is a temporary placeholder.
- **Browser and device testing** has not been completed in this environment.
- **Contact details** (phone, email) are placeholders.

## 8. Future Integration Possibilities

- Online payments (for example Stripe) for prepaid orders.
- Distance validation and address autocomplete through a geocoding provider.
- Order notifications by email or WhatsApp to the team.
- Delivery route planning for the dispatch team.
- Role-based staff accounts beyond a single admin role.

The financial management platform, autopay, bill integrations, loyalty coins, and extended finance features are out of scope for this website and will be covered in a separate proposal.

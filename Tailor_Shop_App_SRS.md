# Tailor Shop Management Android Application
## Software Requirements & Project Planning Document (v1.0)

**Prepared for:** A single-tailor shop, digitizing a paper-notebook workflow, with a future path to a multi-shop SaaS product.
**Prepared as:** A complete blueprint for a development team to begin implementation without further requirement-gathering.

---

## Table of Contents

1. Project Vision
2. User Persona
3. Complete User Journey
4. Feature List
5. Screen List
6. Screen Flow
7. Dashboard Planning
8. Customer Module
9. Order Module
10. Measurement Module
11. Billing Module
12. Payment Module
13. Search System
14. Filters
15. Reports
16. Notifications
17. Customer History
18. Alteration Module
19. Status Workflow
20. Database Planning
21. Folder Structure
22. UI Planning
23. UX Rules
24. Color Theme
25. Android Architecture
26. Offline Strategy
27. Performance
28. Security
29. Risks & Mitigation
30. Future Roadmap
31. AI Features (Future)
32. Development Roadmap
33. Testing Plan

---

## 1. Project Vision

### Why this app exists
A tailor shop runs on information: who ordered what, in what size, by when, for how much, and whether they've paid. Today that information lives in a physical notebook — a single point of failure, hard to search, and impossible to back up.

### Problems with the paper notebook
| Problem | Real-world Impact |
|---|---|
| No search | Finding a customer's old measurements means flipping through pages |
| No backup | Fire, water damage, loss, or theft = total data loss |
| Illegible handwriting | Measurements misread → wrong stitching → rework, customer loss |
| No reminders | Delivery dates forgotten, customers walk in angry |
| No financial visibility | Owner doesn't know monthly income or how much is pending |
| No history | Repeat customers have to re-explain past orders every time |
| Manual billing | Slow, error-prone, no printed/shared invoice |
| Single copy | Can't be accessed by helper/family member simultaneously |
| No structured measurement templates | Every garment type recorded inconsistently |

### Benefits of digitizing
- Instant search across thousands of customers and orders
- Zero data loss with automated local backup
- Consistent, structured measurement capture reduces stitching errors
- Automated delivery/payment reminders reduce missed commitments
- Real-time visibility into income, pending orders, and pending payments
- Professional printed/shared invoices build customer trust
- Full order history strengthens repeat-customer relationships
- A foundation that can later scale into a multi-shop SaaS product

### Future possibilities
Once proven with a single shop, the same data model and workflow can expand into a subscription SaaS serving thousands of tailor shops — with cloud sync, multi-employee accounts, inventory management, and a customer-facing app for order tracking and online booking. This is why the architecture (Section 20, 25) is designed to be **scalable-by-default even though V1 is single-user and fully offline.**

---

## 2. User Persona

**Name (representative):** Shop Owner — "Papa," a working tailor
**Age range:** 45–60
**Technical knowledge:** Low. Comfortable with WhatsApp, phone calls, and basic photo-taking. Not comfortable with complex menus, jargon, or multi-step forms.
**Daily work:** Takes measurements, cuts and stitches fabric, manages walk-in customers, collects payments, coordinates deliveries — often while physically working at a sewing machine or cutting table.
**Working style:** Uses one hand often (other hand may be holding fabric, scissors, or a measuring tape). Works standing or seated at a low table. Interruptions are constant — customers walk in mid-task.

### Pain Points
- Can't quickly find an old customer's measurements when they return
- Forgets delivery dates when the shop gets busy
- Sometimes can't recall who has paid in full vs. who owes money
- Handwriting is faster than typing — data entry must be minimal-friction
- No time to learn a "complicated app"

### Needs
- One-handed operation, large buttons, big readable text
- Fast entry (minimal typing, smart defaults, auto-fill previous values)
- A system that never requires "training" — self-explanatory icons and labels
- Complete offline reliability — the shop has inconsistent internet
- Confidence that data won't be lost

### Goals
- Replace the notebook completely, not partially
- Never miss a delivery date
- Know exactly how much money is pending, per customer and overall
- Serve repeat customers faster because their data is already there
- Look more professional to customers (printed bills, timely reminders)

---

## 3. Complete User Journey

```
 [Open App]
     │
     ▼
 [Dashboard] ── shows today's snapshot: deliveries, pending, income
     │
     ▼
 [Tap "+ New Customer"] ── OR select existing customer via Search
     │
     ▼
 [Enter Customer Details] ── Name, Phone, Address (auto-saved as you type)
     │
     ▼
 [Add New Order] ── choose garment type(s)
     │
     ▼
 [Take Measurements] ── template auto-loads per garment type;
     │                   previous measurements pre-filled if repeat customer
     ▼
 [Add Order Details] ── fabric, delivery date, trial date, priority, notes, photo
     │
     ▼
 [Generate Bill] ── total, advance received, balance auto-calculated
     │
     ▼
 [Save Order] ── order enters workflow at "Measurement Taken" status
     │
     ▼
 [Track Stitching Progress] ── status updated as work proceeds
     │        (Cutting → Stitching → Trial → Final Stitch → Ready)
     ▼
 [Trial Reminder Notification] (if trial date set)
     │
     ▼
 [Mark Ready] ── customer notified (manually, via call/WhatsApp — V1 has no auto-SMS)
     │
     ▼
 [Customer Arrives] ── Collect Balance Payment
     │
     ▼
 [Mark Delivered] ── order moves to "Completed"
     │
     ▼
 [Order appears in Customer History] ── available instantly next visit
     │
     ▼
 [Repeat Customer Returns] ── Search → Customer Details → previous
     measurements/orders visible → New Order created in seconds
```

**Design intent:** every step above should take fewer taps than writing the same thing in a notebook. If a step doesn't meet that bar, it should be redesigned.

---

## 4. Feature List

### Must Have (V1 — Single Tailor, Offline)
| Feature | Notes |
|---|---|
| Customer management (add/edit/view/delete) | Core entity |
| Order management (create/edit/track status) | Core entity |
| Garment-specific measurement templates | Shirt, Pant, Kurta, Blazer, Coat, Sherwani, Blouse, Lehenga, Kids, Custom |
| Auto-fill measurements from customer history | Major time-saver for repeat customers |
| Order status workflow | Measurement → ... → Delivered |
| Billing with auto bill numbering | Total, advance, balance |
| Payment tracking (cash/UPI/card/credit/pending) | Partial payments supported |
| Dashboard with daily snapshot | Today's deliveries, pending, income |
| Search (name, phone, bill no., order no.) | Core usability feature |
| Filters (pending/ready/delivered/today/etc.) | Fast list narrowing |
| Local notifications (delivery, trial, pending payment) | No internet required |
| Customer history timeline | Orders, measurements, payments |
| Local backup & restore (manual + auto) | Data safety |
| Invoice generation (PDF) + Share/Print | Professionalism |
| Dark mode | Comfort during long work hours |
| Photo attachment (reference image, fabric photo) | Reduces miscommunication |

### Good to Have (V1.x — soon after launch)
| Feature | Notes |
|---|---|
| Alteration tracking module | Post-delivery returns |
| Basic reports (daily/weekly/monthly income & orders) | Owner visibility |
| PIN lock for app | Basic privacy |
| Undo-delete (soft delete with recovery window) | Error forgiveness |
| Voice-to-text for notes field | Faster than typing for low-literacy users |
| QR code per customer (quick lookup) | Speeds up repeat visits |
| Export data to Excel/CSV | Owner-controlled data portability |

### Future Features (V2+)
| Feature | Notes |
|---|---|
| Cloud sync & multi-device access | Requires backend |
| Multi-user / employee accounts with roles | Login/auth reintroduced here |
| Inventory management (fabric stock) | Track yardage in/out |
| GST-compliant invoicing | For shops that need it |
| Barcode/QR-based fabric tagging | Physical-digital link |
| WhatsApp/SMS automated reminders | Needs connectivity + API integration |
| Advanced analytics & trends | Business intelligence |
| Customer-facing order tracking | Transparency feature |

### Commercial Features (SaaS phase)
| Feature | Notes |
|---|---|
| Subscription billing (monthly/yearly plans) | Monetization |
| Multi-shop / franchise support | Each shop = isolated tenant |
| Web dashboard for shop owners | Desktop access |
| Customer mobile app (order status, booking) | New user-facing product |
| Online appointment booking | Reduces walk-in chaos |
| Centralized admin panel (for the SaaS provider) | Support & billing operations |

---

## 5. Screen List

| # | Screen | Purpose |
|---|---|---|
| 1 | Splash Screen | Branding, quick local DB init check |
| 2 | Dashboard | Daily snapshot, quick actions |
| 3 | Customer List | Browse/search all customers |
| 4 | Customer Details | Full profile, order history, measurements |
| 5 | New/Edit Customer | Add or edit customer info |
| 6 | New Order | Create an order for a customer |
| 7 | Order Details | View/edit a specific order, update status |
| 8 | Measurement Entry | Garment-specific measurement form |
| 9 | Measurement Templates Manager | View/edit garment templates (Settings-level) |
| 10 | Billing / Invoice | Generate, view, print, share invoice |
| 11 | Payment Entry | Record a payment against an order |
| 12 | Payment History | All payments for a customer/order |
| 13 | Search | Global search across customers/orders |
| 14 | Filters / Order List (filtered) | Pending, Ready, Delivered, Today, etc. |
| 15 | Reports | Daily/weekly/monthly/yearly summaries |
| 16 | Notifications Center | List of all active reminders |
| 17 | Customer History Timeline | Chronological view of one customer |
| 18 | Alteration Entry | Record a post-delivery alteration |
| 19 | Alteration History | Past alterations per customer/order |
| 20 | Settings | App preferences, shop info, theme |
| 21 | Backup & Restore | Manual backup, auto-backup config, restore |
| 22 | About / Help | App version, contact, simple help guide |
| 23 | Order Status Board (optional Kanban view) | Visual pipeline of all active orders |

---

## 6. Screen Flow

```
                         ┌───────────────┐
                         │    Splash     │
                         └───────┬───────┘
                                 ▼
                         ┌───────────────┐
                 ┌───────│   Dashboard   │────────┐
                 │       └───────┬───────┘        │
                 ▼               ▼                ▼
        ┌────────────────┐ ┌──────────┐   ┌───────────────┐
        │ Customer List   │ │  Search  │   │   Reports      │
        └────────┬────────┘ └────┬─────┘   └───────────────┘
                 ▼               ▼
        ┌─────────────────────────────┐
        │      Customer Details        │
        └───────┬─────────────┬───────┘
                 ▼             ▼
        ┌────────────────┐ ┌────────────────────┐
        │  New/Edit       │ │   New Order         │
        │  Customer       │ └─────────┬───────────┘
        └────────────────┘           ▼
                            ┌────────────────────┐
                            │ Measurement Entry   │
                            └─────────┬───────────┘
                                      ▼
                            ┌────────────────────┐
                            │   Order Details      │──────┐
                            └─────────┬───────────┘      │
                                      ▼                   ▼
                            ┌────────────────┐   ┌────────────────┐
                            │ Billing/Invoice │   │  Alteration    │
                            └─────────┬───────┘   │    Entry        │
                                      ▼            └────────────────┘
                            ┌────────────────┐
                            │ Payment Entry   │
                            └────────────────┘

        Settings ── Backup & Restore ── About/Help  (accessible from Dashboard drawer/menu)
```

**Navigation principle:** Every screen is reachable in **≤ 3 taps** from the Dashboard. Order-related screens are reachable in ≤ 2 taps from Customer Details.

---

## 7. Dashboard Planning

The Dashboard is the **first and most-used screen**. It must answer "What do I need to do today?" instantly.

| Card | Data Shown | Why it matters |
|---|---|---|
| Today's Deliveries | Count + tap-to-list of orders due today | Prevents missed handovers |
| Today's Trials | Count + list | Prep fabric/pins in advance |
| Pending Orders | Total count across all active statuses | Overall workload visibility |
| Ready for Delivery | Orders marked "Ready," awaiting pickup | Follow-up calling list |
| Pending Payments | Total ₹ amount outstanding + count of customers | Cash-flow visibility |
| Monthly Income | Running total for current month | Business health at a glance |
| Today's New Orders | Orders created today | Daily activity log |
| New Customers (This Month) | Count | Growth indicator |
| Overdue Orders | Orders past delivery date, still not delivered | Urgent attention flag |
| Quick Actions row | "+ New Customer," "+ New Order," "Search" | One-tap common actions |

**Layout rule:** Most time-sensitive cards (Today's Deliveries, Overdue, Pending Payments) appear **first**, above the fold, in a 2-column grid of large tappable cards — each card opens the relevant filtered list directly.

---

## 8. Customer Module

| Field | Type | Required | Notes |
|---|---|---|---|
| Customer ID | Auto (UUID/int) | System | Internal, not shown to user |
| Customer Display Code | Auto (e.g., C-0001) | System | Human-friendly reference |
| Full Name | Text | Yes | |
| Primary Phone | Text (numeric, validated) | Yes | Used for search & WhatsApp share |
| Alternate Phone | Text | No | |
| Address | Multi-line text | No | |
| Gender | Select (for measurement template defaults) | No | Helps pre-select garment templates |
| Photo | Image (camera/gallery) | No | Optional face/reference photo |
| Notes | Multi-line text | No | Free-form (preferences, allergies to fabric, etc.) |
| Preferred Fit Notes | Text | No | "Likes loose fit," "prefers full sleeves," etc. |
| Referral Source | Text/Select | No | Optional, useful for future marketing analytics |
| Created Date | Auto | System | |
| Last Order Date | Auto (derived) | System | Used for "Repeat Customer" and "Inactive Customer" filters |
| Total Orders (lifetime) | Auto (derived) | System | |
| Total Spend (lifetime) | Auto (derived) | System | |
| QR Code | Auto-generated | System | Encodes Customer ID for fast lookup (Good-to-Have) |
| Is Active | Boolean | System | Soft-delete flag |

---

## 9. Order Module

| Field | Type | Required | Notes |
|---|---|---|---|
| Order ID | Auto | System | Internal |
| Order Number | Auto (e.g., ORD-2026-0001) | System | Yearly-resetting, human-friendly |
| Linked Customer | Reference | Yes | FK to Customer |
| Order Date | Date (auto, editable) | Yes | Defaults to today |
| Delivery Date | Date | Yes | Drives dashboard & notifications |
| Trial Date | Date | No | Optional; triggers trial reminder |
| Priority | Select (Normal/Urgent) | No | Visual flag (e.g., red badge) |
| Status | Select (see Section 19) | System-managed | Workflow-driven |
| Garment Items | List (1-to-many) | Yes | Each item = garment type + measurement set + quantity |
| Fabric Details | Text/Select | No | Fabric type, color, source (customer-provided or shop-provided) |
| Reference Images | Image(s) | No | Style reference, fabric photo |
| Special Instructions | Multi-line text | No | E.g., "extra loose collar" |
| Total Amount | Auto (calculated) | System | Sum of item charges |
| Advance Paid | Currency | No | |
| Balance Due | Auto (calculated) | System | Total − Advance − further payments |
| Assigned To | Text (future: employee FK) | No | Placeholder for V2 multi-employee |
| Created Date | Auto | System | |
| Last Updated Date | Auto | System | |

**Order = 1 or more Garment Items.** A single order can contain, e.g., 2 shirts + 1 pant, each with its own measurement set and price.

---

## 10. Measurement Module

Each garment type has a **dedicated measurement template**, pre-loaded when that garment type is selected. All fields are numeric (inches or cm — configurable in Settings), with a Notes field per template for free-form remarks.

### Shirt
Length, Shoulder, Chest, Waist, Hip, Sleeve Length, Sleeve Round (Bicep), Collar, Cuff, Front Neck Depth, Back Neck Depth, Armhole

### Pant
Length, Waist, Hip, Thigh, Knee, Bottom (Ankle Opening), Fly Length, Crotch/Rise, Inseam

### Kurta
Kurta Length, Chest, Waist, Hip, Shoulder, Sleeve Length, Sleeve Round, Collar, Bottom Round, Slit Length

### Blazer / Coat
Length, Chest, Waist, Hip, Shoulder, Sleeve Length, Sleeve Round, Collar, Lapel Width, Front Length, Back Length, Armhole

### Sherwani
Length, Chest, Waist, Hip, Shoulder, Sleeve Length, Sleeve Round, Collar, Bottom Round, Slit Length

### Blouse (Women's)
Length, Bust/Chest, Waist, Shoulder, Sleeve Length, Sleeve Round, Armhole, Front Neck Depth, Back Neck Depth, Dart Point

### Lehenga
Waist, Hip, Lehenga Length, Flare (in meters/panels), Waist to Knee, Waist to Floor

### Kids Wear
Length, Chest, Waist, Shoulder, Sleeve Length, Age Reference, Height Reference

### Custom
Free-form key-value pairs — user types a measurement label and value; unlimited rows. Used for garment types not covered above (e.g., saree blouse variations, uniforms).

**UX behavior:**
- On selecting a garment type, the correct template auto-loads.
- If the customer has ordered this garment type before, the **last recorded values pre-fill** the form (editable) — this is the single biggest time-saver for repeat customers.
- Each field supports quick +/- adjustment buttons in addition to keyboard input, since exact typing with a measuring tape in hand is impractical.
- A "Copy from previous order" button is always visible when history exists.

---

## 11. Billing Module

| Field | Type | Notes |
|---|---|---|
| Bill Number | Auto | Sequential, yearly-resetting (e.g., INV-2026-0001) |
| Bill Date | Auto | |
| Linked Order(s) | Reference | One bill can cover one or more orders for the same customer |
| Itemized Charges | List | Per garment item: description + amount |
| Subtotal | Auto | Sum of items |
| Discount | Currency or % | Optional, owner-entered |
| GST | Toggle + % | Optional — off by default (V1 is a small, unregistered shop); switch-on ready for shops that need it |
| Total Payable | Auto | Subtotal − Discount (+ GST if enabled) |
| Advance Received | Currency | |
| Balance Due | Auto | |
| Payment Mode | Select | Cash / UPI / Card / Credit |
| Invoice PDF | Generated | Shop name, logo (optional), customer details, itemized bill |
| Print | Action | Sends to connected printer (if available) or system print dialog |
| Share | Action | Share PDF via WhatsApp/Email/other apps |

---

## 12. Payment Module

| Feature | Notes |
|---|---|
| Payment Modes | Cash, UPI, Card, Credit (informal, i.e., "on account") |
| Partial Payment Support | Multiple payments can be logged against a single order until balance = 0 |
| Payment Status | Auto-derived: Unpaid / Partially Paid / Paid |
| Payment History | Chronological log per order and per customer, showing date, amount, mode |
| Pending Payment Tracking | Dashboard card + dedicated filtered list, sorted by oldest-first or highest-amount-first |
| Payment Entry | Amount, Date (defaults to today), Mode, Optional note |
| Refunds/Adjustments | Negative payment entry with note (e.g., order cancelled) |

---

## 13. Search System

Search must return results **as the user types**, with no "search button" tap required.

| Search By | Behavior |
|---|---|
| Customer Name | Partial match, case-insensitive |
| Phone Number | Partial/full match, numeric-only input |
| Bill Number | Exact/partial match |
| Order Number | Exact/partial match |
| Order Status | Match against status list |
| Delivery Date | Date picker or "today/tomorrow" shortcuts |
| Payment Status | Paid/Unpaid/Partial |
| Garment/Clothing Type | Match against garment type list |
| Address / Notes (secondary) | Full-text partial match, lower priority in ranking |

**Result ranking:** exact phone/bill/order-number matches rank above fuzzy name matches. Results show customer name, phone, and a one-line context (e.g., "2 pending orders").

---

## 14. Filters

| Filter | Definition |
|---|---|
| Pending | Status not in {Delivered, Completed} |
| Delivered | Status = Delivered |
| Ready | Status = Ready |
| Today | Delivery Date = today |
| Tomorrow | Delivery Date = tomorrow |
| This Week | Delivery Date within current week |
| Paid | Balance Due = 0 |
| Unpaid | Balance Due = Total (no payment made) |
| Partially Paid | 0 < Balance Due < Total |
| Repeat Customers | Total Orders (lifetime) > 1 |
| High Value Customers | Total Spend above owner-configurable threshold |
| Overdue | Delivery Date < today AND Status ≠ Delivered |
| Urgent | Priority = Urgent |

Filters are combinable (e.g., "Pending" + "This Week") via a simple chip-based filter bar above any list screen.

---

## 15. Reports

| Report | Metrics Included |
|---|---|
| Daily | Orders created, orders delivered, income collected, pending payments logged |
| Weekly | Same metrics aggregated, with day-by-day breakdown chart |
| Monthly | Income trend, order volume trend, top garment types, new vs. repeat customers |
| Yearly | Full-year income, order count, growth compared to previous year (if data exists) |
| Pending Amount Report | List of all customers with outstanding balances, sorted by amount |
| Pending Orders Report | All non-delivered orders grouped by status |
| Completed Orders Report | Historical completed orders, filterable by date range |
| Most Ordered Items | Ranking of garment types by volume |
| Customer Statistics | Top customers by spend, order frequency, most recent activity |

All reports support **date-range selection** and **export to PDF/CSV** for the owner's own records or accountant.

---

## 16. Notifications

All notifications are **local device notifications** — no internet or SMS gateway required in V1.

| Notification | Trigger |
|---|---|
| Today's Delivery | Order Delivery Date = today, status ≠ Delivered (fires each morning) |
| Tomorrow's Delivery | Order Delivery Date = tomorrow (fires evening prior) |
| Trial Reminder | Order Trial Date = today/tomorrow |
| Pending Payment Reminder | Order delivered but balance > 0, recurring weekly reminder |
| Long-Pending Order Alert | Order in same status > owner-configurable threshold (e.g., 7 days) |
| Overdue Delivery Alert | Delivery Date passed, order still not delivered |

A **Notifications Center** screen lists all currently active alerts so nothing depends on the user having seen the system tray notification.

---

## 17. Customer History

For any customer, a single timeline view shows, in reverse-chronological order:
- Every order placed (garment types, dates, status)
- Every measurement set recorded (with the ability to compare against the most recent set)
- Every payment made (date, amount, mode)
- Every photo attached (fabric/reference images)
- Every note added
- Every alteration performed

This timeline is the feature that most directly replaces "flipping through old notebook pages" — it must load instantly even with years of history.

---

## 18. Alteration Module

| Field | Type | Notes |
|---|---|---|
| Linked Order | Reference | The original order being altered |
| Alteration Date | Date | Auto, editable |
| Alteration Description | Text | E.g., "Loosen waist by 1 inch" |
| Charges | Currency | Can be ₹0 if free-of-charge policy applies |
| Status | Select | Received → In Progress → Ready → Delivered |
| Delivery Date | Date | Expected return date |
| Notes | Text | |

Alterations appear both under the **original order's detail screen** and in the **customer's history timeline**, so the full lifecycle of a garment — not just its first delivery — is tracked.

---

## 19. Status Workflow

```
Measurement Taken
        │
        ▼
 Fabric Received  (skip if customer provides fabric already in hand)
        │
        ▼
     Cutting
        │
        ▼
    Stitching
        │
        ▼
      Trial   ──── (optional step; skipped if no trial needed)
        │
        ▼
  Final Stitch
        │
        ▼
      Ready
        │
        ▼
    Delivered
        │
        ▼
    Completed
```

**Transition rules:**
- Transitions are **manual** (tailor updates status with one tap) — the app never auto-advances status, since actual stitching progress can't be sensed by software.
- Statuses can only move **forward**, except an explicit "Revert" action (with confirmation) for correcting mistakes — this prevents accidental status corruption while still allowing error recovery.
- **Trial** is optional per order — if no Trial Date is set, the workflow skips directly from Stitching to Final Stitch.
- **Delivered → Completed** is auto-triggered once full payment is received and the order is marked delivered; "Completed" essentially means "closed, no further action needed," useful for filtering active vs. archived work.
- Each status change is timestamped, feeding the "Long-Pending Order Alert" (Section 16) and Reports (Section 15).

---

## 20. Database Planning

*(Entity design only — no SQL, per requirement. Actual schema/DDL to be written during implementation using this as the source of truth.)*

### Core Entities

**Customer**
- Holds identity, contact, and derived lifetime stats (Section 8 fields).

**Order**
- Belongs to one Customer. Holds delivery/trial dates, status, priority, totals (Section 9 fields).

**OrderItem** (Garment Item)
- Belongs to one Order. Represents one garment (e.g., "1 Shirt") within a multi-item order. Holds garment type, quantity, price, and a link to its Measurement record.

**Measurement**
- Belongs to one OrderItem (and, denormalized, cached against Customer + Garment Type for the "pre-fill from last order" feature). Holds garment-type-specific fields as key-value pairs (flexible schema to support the Custom template without needing new tables per garment type).

**Payment**
- Belongs to one Order. Holds amount, date, mode, and an optional note. Multiple Payments per Order supported (partial payments).

**Bill/Invoice**
- Belongs to one or more Orders (usually one) for a single Customer. Holds computed totals, discount, GST toggle, and a reference to the generated PDF file path.

**Alteration**
- Belongs to one Order. Holds description, charges, status, and its own delivery date.

**Photo**
- Polymorphic attachment — can belong to a Customer (profile) or an OrderItem (reference/fabric image). Stores local file path + thumbnail path.

**Notification**
- System-generated, linked to an Order (delivery/trial reminders) or standalone (payment reminders). Holds trigger date, type, read/dismissed state.

**Settings**
- Single-row table (or key-value store) for shop name, address, logo path, unit preference (inch/cm), currency symbol, GST default, backup preferences, theme preference, PIN lock toggle.

**MeasurementTemplate**
- Defines which fields exist for each garment type (Shirt, Pant, Kurta, etc.), enabling future customization without a code change — the owner (or a future admin) could theoretically add a field to a template.

### Relationships (ERD description)

```
Customer (1) ─────< (many) Order
Order    (1) ─────< (many) OrderItem
OrderItem(1) ─────< (1)    Measurement
Order    (1) ─────< (many) Payment
Order    (1) ─────< (many) Alteration
Order    (1) ─────< (0..1) Bill
Customer (1) ─────< (many) Photo
OrderItem(1) ─────< (many) Photo
MeasurementTemplate (1) ──< (many) Measurement  [defines field structure]
```

### Normalization Notes
- Customer and Order data is normalized (3NF) to avoid duplication of contact/billing info across orders.
- Measurement values are intentionally **semi-structured** (key-value pairs tied to a template) rather than one rigid column-per-measurement-per-garment-type table — this avoids an unwieldy 80+ column table and makes adding new garment types (or custom fields) a data change, not a schema migration.
- Derived/aggregate fields on Customer (Total Orders, Total Spend, Last Order Date) are **denormalized for read performance** — recalculated via background triggers/observers whenever a related Order or Payment changes, since these values are read constantly (every list screen) but written rarely.

### Indexes (conceptual, to guide implementation)
- Customer: index on Phone (search), Name (search)
- Order: index on Status, Delivery Date, Customer FK
- Payment: index on Order FK, Date
- Bill: index on Bill Number, Customer FK
- Measurement: index on OrderItem FK, (Customer FK + Garment Type) composite for the pre-fill lookup

---

## 21. Folder Structure

Recommended for a modern **Kotlin + Jetpack Compose + MVVM + Repository** Android project:

```
tailorapp/
├── app/
│   └── src/main/java/com/tailorapp/
│       ├── TailorApp.kt                 (Application class, Hilt entry point)
│       │
│       ├── data/
│       │   ├── local/
│       │   │   ├── database/            (Room database, DAOs)
│       │   │   ├── entities/            (Room entity data classes)
│       │   │   └── preferences/         (DataStore for Settings)
│       │   ├── repository/              (Repository implementations — single source of truth)
│       │   └── model/                   (Data models shared across layers)
│       │
│       ├── domain/
│       │   ├── usecase/                 (Business logic: CreateOrder, CalculateBalance, etc.)
│       │   └── repository/              (Repository interfaces — domain contracts)
│       │
│       ├── ui/
│       │   ├── dashboard/               (Screen + ViewModel + Composables)
│       │   ├── customer/
│       │   │   ├── list/
│       │   │   ├── detail/
│       │   │   └── form/
│       │   ├── order/
│       │   │   ├── list/
│       │   │   ├── detail/
│       │   │   └── form/
│       │   ├── measurement/
│       │   ├── billing/
│       │   ├── payment/
│       │   ├── search/
│       │   ├── reports/
│       │   ├── alteration/
│       │   ├── settings/
│       │   └── common/                  (shared composables: buttons, cards, dialogs)
│       │
│       ├── navigation/                  (Navigation Compose graph, routes)
│       │
│       ├── util/                        (Formatters, validators, PDF generator, backup manager)
│       │
│       ├── notification/                (WorkManager workers, notification builders)
│       │
│       └── di/                          (Hilt modules)
│
├── app/src/main/res/                    (drawables, strings, themes, fonts)
└── app/src/test + androidTest/          (unit + UI tests, mirroring main structure)
```

**Why this structure:**
- **`data/` vs `domain/` vs `ui/`** separation keeps business logic (balance calculation, status transitions) independent of both the database and the UI — critical for testability and for the future SaaS migration, where `data/local` could be swapped/extended with `data/remote` without touching `domain` or `ui`.
- **Feature-based folders inside `ui/`** (customer, order, measurement...) rather than type-based (all screens together, all viewmodels together) keeps related code co-located, which matters as the app grows past a handful of screens.
- **`usecase/` layer** encodes business rules (e.g., "an order can't be marked Delivered with a pending trial") as explicit, testable classes rather than scattering logic across ViewModels.

---

## 22. UI Planning

- **Design system:** Material Design 3 (Material You), with a custom color scheme (Section 24) rather than default dynamic color, so the brand feels intentional, not generic.
- **Tone:** Modern, clean, "premium but simple" — closer to a well-designed billing/invoicing app than a generic form-heavy business tool.
- **Touch targets:** Minimum 48dp, with primary actions (Save, New Order, Mark Delivered) sized closer to 56–64dp for confident one-handed tapping.
- **Navigation:** Bottom navigation bar for the 4–5 top-level destinations (Dashboard, Customers, Orders, Search, Reports/More), so the most-used areas are always one tap away.
- **Typography:** Large base font size (16sp minimum body text, 20sp+ for key numbers like totals and dates) — legibility over density.
- **One-handed use:** Primary actions and navigation anchored to the bottom half of the screen; destructive actions (delete) placed away from primary tap zones to prevent accidental taps.
- **Dark mode:** Full support, following system setting by default with a manual override in Settings — useful for evening shop hours.
- **Accessibility:** Minimum 4.5:1 text contrast, content descriptions on all icons/images for screen readers, scalable text respecting system font-size settings.

---

## 23. UX Rules

| Rule | Implementation |
|---|---|
| Minimal taps | New Order from Dashboard in ≤ 2 taps; Save always visible, never buried in a menu |
| Large buttons | Primary CTAs full-width or near-full-width, never small icon-only buttons for critical actions |
| Fast workflow | Multi-step forms (like New Order) use a single scrollable screen with clear section headers rather than a rigid multi-page wizard, so the tailor can jump around freely |
| Auto-save | Draft orders/customers persist automatically if the app is interrupted (e.g., a customer walks in mid-entry) |
| Auto-complete | Customer name/phone fields suggest existing matches while typing, to catch duplicates early |
| Smart defaults | Order Date defaults to today; Payment Mode defaults to the tailor's most-used mode; Unit defaults to the shop's configured preference |
| Offline-first | Every read/write operation hits the local database first; no operation ever blocks on network |
| Error prevention | Required fields are visually marked before submission is attempted, not just rejected after |
| Confirmation dialogs | Required before: delete customer/order, revert order status, apply a refund |
| Undo delete | Soft-delete with a "Deleted Items" recovery area, purged only after a configurable retention period (e.g., 30 days) |

---

## 24. Color Theme

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| Primary | `#2E5E4E` (Deep Tailor Green) | `#7FBFA6` | Brand color, primary buttons, app bar |
| Secondary | `#C9A24B` (Muted Gold/Thread) | `#D9B96E` | Accents, badges, highlights (evokes thread/fabric trim) |
| Background | `#FAF9F6` (Warm Off-White) | `#121212` | Screen background |
| Surface / Cards | `#FFFFFF` | `#1E1E1E` | Card backgrounds |
| Error / Overdue | `#B3261E` | `#F2B8B5` | Overdue orders, delete actions |
| Success / Paid | `#3B7A4E` | `#8FD9A0` | Paid status, delivered status |
| Warning / Pending | `#C9781E` | `#F2C68A` | Pending payment, in-progress status |
| On-Primary Text | `#FFFFFF` | `#0B1F17` | Text/icons on primary-colored surfaces |
| Typography | Roboto / Inter (system default acceptable) | — | Clear, neutral, highly legible at small sizes |
| Icons | Rounded/filled Material icon set | — | Friendlier, less "corporate" than outlined-only icons |
| Corner Radius | 16dp cards, 12dp buttons | — | Soft, modern, approachable |
| Elevation | Subtle (2–4dp) card shadows | Minimal, rely on tonal surface color instead of shadow | Depth without visual noise |
| Spacing | 8dp grid system (8/16/24/32) | — | Consistent rhythm throughout |

The green/gold palette is chosen deliberately to evoke fabric, craftsmanship, and trust — distinct from the generic blue used by most "business app" templates.

---

## 25. Android Architecture

### Recommended Stack

| Layer | Technology | Reason |
|---|---|---|
| Language | Kotlin | Modern, null-safe, official Android language |
| UI Toolkit | Jetpack Compose | Faster iteration, less boilerplate, better suited to the highly custom card-based dashboard/UI this app needs |
| Local Database | Room (over SQLite) | Compile-time verified queries, clean entity mapping, works seamlessly offline |
| Architecture Pattern | MVVM | Clean separation of UI state from business logic; well-supported by Compose's state model |
| Data Layer Pattern | Repository Pattern | Single source of truth; makes the future move to cloud sync (V2) a matter of extending repositories, not rewriting UI |
| Navigation | Navigation Compose | Type-safe navigation graph matching the Screen Flow in Section 6 |
| Dependency Injection | Hilt | Reduces manual wiring, standard for Compose + Room + WorkManager combination |
| Asynchrony | Kotlin Coroutines + Flow | Reactive local-data streams (e.g., Dashboard cards update live as data changes) without manual polling |
| Background Work | WorkManager | Reliable scheduling for local notifications (delivery/trial reminders) and scheduled auto-backups, even across app restarts/device reboots |
| PDF Generation | Android PdfDocument API / iText (evaluate at implementation time) | Local invoice generation without a server |
| Image Handling | Coil | Efficient local image loading/caching for Compose |

```
┌─────────────────────────────────────────────┐
│                     UI (Compose)              │
│   Screens · Composables · State (StateFlow)   │
└───────────────────┬────────────────────────────┘
                     │  observes
┌───────────────────▼────────────────────────────┐
│                  ViewModel (MVVM)               │
│      Exposes UI State, handles UI events        │
└───────────────────┬────────────────────────────┘
                     │  calls
┌───────────────────▼────────────────────────────┐
│              Domain / UseCases                 │
│   Business rules: totals, status transitions    │
└───────────────────┬────────────────────────────┘
                     │  calls
┌───────────────────▼────────────────────────────┐
│                 Repository                      │
│     Single source of truth, abstracts data      │
└───────────────────┬────────────────────────────┘
                     │  reads/writes
┌───────────────────▼────────────────────────────┐
│         Room Database (local, offline)          │
│    (future: + Remote Data Source for cloud)      │
└─────────────────────────────────────────────────┘
```

**Why this matters for scalability:** because the Repository is the only layer that talks to the database, adding cloud sync in V2 means adding a `RemoteDataSource` and a sync strategy **inside the Repository** — the ViewModel, UseCases, and UI never need to change. This is the single most important architectural decision protecting the V1 investment when the SaaS pivot happens.

---

## 26. Offline Strategy

- **Core principle:** the app must be **100% functional with the device in airplane mode**, indefinitely. No feature in the Must-Have list should ever show a "no internet" blocking state.
- **Data storage:** all data lives in the local Room database; there is no server dependency in V1.
- **Backup strategy:**
  - Automatic local backup on a schedule (e.g., daily, via WorkManager) to a file in the app's local storage / device storage (e.g., `/Android/data/.../backups/` or user-chosen folder via Storage Access Framework).
  - Manual "Backup Now" button in Settings for on-demand safety before major actions.
  - Backup file is a single portable archive (e.g., encrypted zip containing the DB export + photos) — this format is also what powers the future "Export" feature.
- **Restore strategy:**
  - Restore screen lets the owner pick a backup file (from local storage or, if available, from Google Drive/any file picker via Storage Access Framework) and restores the full database + photos.
  - A safety check ("This will replace all current data — are you sure?") with a confirmation dialog, plus an automatic pre-restore snapshot, ensures a bad restore is itself recoverable.
- **Export strategy:**
  - CSV/Excel export of customers, orders, and payments for the owner's own records or to share with an accountant — independent of the backup/restore system, meant for human reading rather than app restoration.

---

## 27. Performance

| Concern | Strategy |
|---|---|
| Large customer database (thousands of records) | Room + paginated queries (Paging 3 library) so lists never load everything into memory at once |
| Fast search | Indexed columns (Section 20) + debounced search-as-you-type to avoid querying on every keystroke |
| Fast filtering | Pre-built, indexed queries per filter rather than in-memory filtering of large lists |
| Image optimization | Store compressed/resized copies for thumbnails (list views); load full-resolution only in detail view; Coil handles caching |
| Memory optimization | Compose's lazy lists (`LazyColumn`) for all list screens; avoid loading full order history into memory on Dashboard |
| Lazy loading | Customer History Timeline loads recent items first, older items paginated on scroll |
| Pagination | Applied to: Customer List, Order List, Payment History, Reports date-range results |

---

## 28. Security

Even though there's no login in V1, "security" here means **protecting the owner's business data from loss, tampering, or unwanted access by others who pick up the phone.**

| Feature | Detail |
|---|---|
| Local Encryption | Room database encrypted at rest (e.g., via SQLCipher) so data isn't readable if the device is rooted/backup-extracted |
| Backup Encryption | Backup archive files are encrypted with a key derived from a user-set passphrase, so a stolen backup file alone isn't readable |
| PIN Lock (optional) | App-level PIN or biometric lock, configurable in Settings, for shared devices/family phones |
| Delete Confirmation | Every destructive action requires explicit confirmation |
| Data Recovery | Soft-delete + backup/restore (Sections 23, 26) together form the recovery safety net |

---

## 29. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Owner resistance to switching from notebook | Low adoption, wasted project | Design for near-zero learning curve; consider a transition period where both are used in parallel; involve the father in usability testing throughout |
| Data loss (device lost/broken/stolen) | Catastrophic — entire business record gone | Automatic backups + easy restore + encouraging cloud-folder backup destination (e.g., Google Drive-synced folder) even in V1 |
| Measurement entry errors | Wrong garment made, customer dissatisfaction, rework cost | Structured templates, pre-fill from history, "copy from previous order," clear large-text confirmation before save |
| Performance degradation as data grows (years of use) | Slow search/lists, frustration | Pagination + indexing designed in from V1 (Section 20, 27), not retrofitted later |
| Scalability issues moving to multi-user SaaS | Costly rewrite | Repository pattern (Section 25) isolates data layer from UI so this becomes an extension, not a rewrite |
| Future migration to cloud sync — data conflicts | Corrupted/duplicated data during multi-device sync | Plan sync strategy (e.g., last-write-wins with conflict log) at the schema level even in V1 (e.g., include `updated_at` timestamps on all entities now, unused until V2) |
| Feature creep during V1 build | Delayed launch, missed "replace the notebook" goal | Strict adherence to Must-Have list (Section 4) for V1; everything else explicitly deferred |
| Single point of failure (only the father uses/understands the app) | Business disruption if he's unavailable | Simple enough UI that a family member could operate it with minimal explanation; consider a printed one-page "how to use" cheat sheet |

---

## 30. Future Roadmap

| Version | Theme | Key Additions |
|---|---|---|
| V1 | Digitize the Notebook | Full offline single-tailor app (Section 4 Must-Haves) |
| V1.x | Polish & Convenience | Alterations, reports, PIN lock, undo-delete, voice notes, QR lookup, export |
| V2 | Connectivity | Cloud sync, multi-device access, login/authentication reintroduced |
| V3 | Team & Business Growth | Multi-user/employee roles, inventory management, GST-compliant invoicing, barcode/QR fabric tagging |
| V4 | Customer-Facing & Automation | WhatsApp/SMS automated reminders, customer app for order tracking, online booking, advanced analytics |
| V5 | Full SaaS Platform | Multi-shop/franchise support, web dashboard, subscription billing, centralized admin panel |

---

## 31. AI Features (Future)

These are explicitly **out of scope for V1** but noted here so the data model doesn't accidentally block them later:

- **Voice input** for hands-busy data entry (notes, even measurement dictation)
- **Automatic measurement suggestions** based on a customer's measurement history and typical garment-type deltas (e.g., suggesting a pant waist based on a recently recorded shirt chest size)
- **Smart reminders** — e.g., predicting which customers are likely to return based on historical ordering cadence
- **WhatsApp automation** — auto-sending delivery/trial reminders and even the invoice PDF directly to the customer
- **AI-generated reports** — natural-language summaries of business performance ("This month's income is up 12% over last month, driven mainly by kurta orders")
- **AI assistant** — a conversational interface for the owner to ask things like "How much did Ramesh pay this year?"
- **Photo-based measurement estimation** — computer-vision-assisted rough measurement suggestions from a photo (long-term, requires significant R&D and should be treated as an experimental add-on, not a core dependency)

---

## 32. Development Roadmap

| Phase | Goals | Deliverables | Estimated Complexity | Dependencies | Testing Requirements |
|---|---|---|---|---|---|
| **Phase 1 — Foundation** | Set up architecture, database, and navigation skeleton | Project scaffold (Section 21 structure), Room database with all entities (Section 20), empty navigable screens for all 23 screens (Section 5), theme (Section 24) applied | Medium | None | Unit tests for entity/DAO layer; manual navigation smoke test |
| **Phase 2 — Customer & Order Core** | Build the primary data-entry workflows | Customer CRUD, Order CRUD, Garment Item + Measurement templates (Section 10), auto bill/order numbering | High | Phase 1 complete | Unit tests for calculations (totals, balances); UI tests for form validation; edge cases: empty fields, duplicate phone numbers, very long names/notes |
| **Phase 3 — Billing, Payments & Status Workflow** | Make an order flow end-to-end from creation to delivery | Billing/Invoice generation (PDF), Payment entry + partial payments, Status workflow (Section 19) with transition rules | High | Phase 2 complete | Unit tests for payment/balance logic; edge cases: overpayment, ₹0 orders, status revert; PDF generation validation across device sizes |
| **Phase 4 — Dashboard, Search, Filters, Notifications** | Make the app fast and proactive to use daily | Dashboard cards (Section 7) wired to live data, Search (Section 13), Filters (Section 14), local Notifications via WorkManager (Section 16) | Medium-High | Phase 3 complete | Performance testing with seeded large dataset (1,000+ customers/orders); notification firing tests across device reboot; search relevance testing |
| **Phase 5 — History, Alterations, Reports** | Complete the "replace the notebook" promise | Customer History Timeline (Section 17), Alteration Module (Section 18), Reports (Section 15) | Medium | Phase 4 complete | Data-integrity tests (timeline reflects all linked records correctly); report accuracy tests against known seeded data |
| **Phase 6 — Backup, Restore, Settings, Security** | Make the app trustworthy as the sole record-keeper | Backup/Restore (Section 26), Settings (unit preference, theme, shop info), PIN lock, local + backup encryption (Section 28) | Medium-High | Phase 5 complete | Backup/restore round-trip tests; encryption verification; failure-mode testing (interrupted backup, corrupted file restore attempt) |
| **Phase 7 — Polish, Accessibility, Beta** | Production readiness | Dark mode QA, accessibility audit (Section 22), empty-states, loading-states, error-states across all screens, real-world beta with the father as primary tester | Low-Medium | Phase 6 complete | Full manual usability testing plan (Section 33); accessibility scanner pass; real-device testing on low/mid-range hardware |

---

## 33. Testing Plan

| Test Type | Scope | Approach |
|---|---|---|
| **Unit Testing** | ViewModels, UseCases, calculation logic (totals, balances, status transitions), Repository logic | JUnit + MockK/Mockito; target high coverage on all money/date calculation code specifically, since errors there directly cost the business |
| **UI Testing** | Compose screens: form validation, navigation flows, dashboard card interactions | Compose UI Test framework; verify critical flows end-to-end (New Customer → New Order → Save → appears on Dashboard) |
| **Manual Testing** | Full app walkthrough each release, on a real low/mid-range Android device (matching what a small shop owner would actually own) | Scripted test cases derived directly from Section 3 (User Journey) |
| **Edge Cases** | Zero-value orders, extremely long names/notes, duplicate phone numbers, orders with no delivery date, garments with all-custom measurements, deleting a customer with active orders | Explicit test cases written per edge case, run each release |
| **Data Validation** | Required-field enforcement, numeric-only fields (phone, measurements, currency), date logic (delivery date can't be before order date) | Automated where possible, manual spot-check otherwise |
| **Offline Testing** | Full app usage in airplane mode across every Must-Have feature | Manual test pass with device network fully disabled |
| **Backup Testing** | Backup → uninstall/reinstall app → restore → verify full data integrity (including photos) | Manual + scripted round-trip test each release |
| **Performance Testing** | App responsiveness with a seeded dataset of 1,000+ customers and 5,000+ orders | Instrumented test measuring list scroll performance, search latency, dashboard load time |
| **Usability Testing** | The actual end user — the father — attempting real daily tasks unaided | Direct observation sessions; time-to-complete and error-rate tracked for: adding a customer, creating an order, checking today's deliveries, collecting a payment |

---

## Summary

This document defines a **complete, scope-controlled V1**: a fully offline Android application that replaces a tailor's paper notebook end-to-end, built on an architecture (MVVM + Repository + Room + Compose) deliberately chosen so that the SaaS future — cloud sync, multi-user, inventory, GST, customer apps — is an **extension of this foundation, not a rewrite of it.**

No code has been written. This plan is intended as the shared reference point for approval before implementation begins.

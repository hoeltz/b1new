# Unified Inventory & Kepabeanan Integration API

**Updated:** November 24, 2025  
**Status:** ✅ Production Ready (Phase 2)

## Overview

API endpoints untuk Warehouse, Inventory, dan Kepabeanan Portal yang unified di backend (`/api/inventory/*`). Mendukung:
- **Goods Receipt** (BC/TTPB penerimaan barang)
- **Goods Issue** (TPPB pengeluaran barang dengan partial picking)
- **Stock Opname** (stock take & adjustment)
- **Mutasi Aggregation** (laporan mutasi barang per kategori: bahan/produk/asset/reject)

---

## Base URL

```
http://localhost:4000/api
```

---

## Data Model

### Item Master (`items`)

```json
{
  "id": "uuid",
  "item_code": "BBK-001",
  "item_name": "Bahan Baku Plastik",
  "unit": "PCS",
  "item_group": "bahan",          // bahan|produk|asset|reject
  "hs_code": "123456",
  "default_price": 10000,
  "currency": "IDR",
  "description": "...",
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

### Movement Record (`movements`)

```json
{
  "id": "uuid",
  "doc_type": "BC 2.6.1",
  "doc_number": "BC2025-001",
  "doc_date": "2025-11-24T08:00:00Z",
  "receipt_number": "AWB-2025-001",
  "receipt_date": "2025-11-24T08:00:00Z",
  "sender_name": "PT. Supplier X",
  "item_code": "BBK-001",
  "item_name": "Bahan Baku Plastik",
  "qty": 100,
  "unit": "PCS",
  "value_amount": 1000000,
  "value_currency": "IDR",
  "movement_type": "IN",              // IN|OUT|ADJ|TRANSFER|WIP
  "source": "WAREHOUSE",
  "location_id": "WH-A-01",
  "to_location_id": "",
  "area": "A",
  "lot": "01",
  "rack": "05",
  "serial_no": "SN-001",
  "wip_stage": null,
  "reference_id": "parent-movement-id",  // for linked OUT to IN
  "created_by": "user@example.com",
  "approved_by": null,
  "approval_status": "pending",       // pending|approved|rejected
  "note": "Sample data",
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

### Stock Opname Entry (`stock_opname`)

```json
{
  "id": "OP-2025110001",
  "opname_date": "2025-11-24T16:00:00Z",
  "location_id": "WH-A",
  "items": [
    {
      "item_code": "BBK-001",
      "recorded_qty": 100,
      "counted_qty": 98,
      "adjustment": -2,
      "note": "Missing 2 PCS"
    }
  ],
  "performed_by": "warehouse-staff@example.com",
  "createdAt": "2025-11-24T..."
}
```

---

## Endpoints

### **Items**

#### POST /inventory/items
Create or update item master.

**Request:**
```json
{
  "item_code": "BBK-001",
  "item_name": "Bahan Baku Plastik",
  "unit": "PCS",
  "item_group": "bahan",
  "hs_code": "123456",
  "default_price": 10000,
  "currency": "IDR",
  "description": "Material plastik premium"
}
```

**Response:** `{ ok: true, item: {...} }`

---

#### GET /inventory/items
Fetch all items.

**Response:**
```json
{
  "ok": true,
  "items": [ {...}, {...} ]
}
```

---

### **Movements**

#### POST /inventory/movements
Create movement(s). Supports both **batch** (items[]) and **single item** payloads.

**Batch Payload (Goods Receipt/Issue):**
```json
{
  "doc_type": "BC 2.6.1",
  "doc_number": "BC2025-001",
  "doc_date": "2025-11-24T08:00:00Z",
  "receipt_number": "AWB-2025-001",
  "location_id": "WH-A",
  "items": [
    {
      "item_code": "BBK-001",
      "qty": 100,
      "unit": "PCS",
      "value_amount": 1000000,
      "value_currency": "IDR",
      "movement_type": "IN",
      "lot": "01",
      "serial_no": "SN-001"
    },
    {
      "item_code": "BP-001",
      "qty": 30,
      "unit": "PCS",
      "value_amount": 150000,
      "value_currency": "IDR",
      "movement_type": "IN"
    }
  ]
}
```

**Single Item Payload (Backward Compatible):**
```json
{
  "doc_type": "BC 2.6.1",
  "doc_number": "BC2025-002",
  "item_code": "PJ-001",
  "qty": 50,
  "movement_type": "IN"
}
```

**Response:** `{ ok: true, created: [ {...}, {...} ], count: 2 }`

---

#### GET /inventory/movements
Fetch movements with filters.

**Query Parameters:**
- `start` (date) — start date filter (YYYY-MM-DD)
- `end` (date) — end date filter
- `item` (string) — search by item code or name
- `type` (string) — filter by movement type (IN|OUT|ADJ)

**Example:**
```
GET /inventory/movements?start=2025-11-01&end=2025-11-30&type=IN
```

**Response:**
```json
{
  "ok": true,
  "rows": [ {...}, {...} ],
  "count": 2
}
```

---

### **Aggregations**

#### GET /inventory/aggregations/mutasi
Fetch aggregated mutation data for Kepabeanan reports.

**Query Parameters:**
- `start` (date) — period start
- `end` (date) — period end
- `item` (string) — filter by item code
- `type` (string) — filter by item group (bahan|produk|asset|reject)

**Example:**
```
GET /inventory/aggregations/mutasi?start=2025-11-01&end=2025-11-30&type=bahan
```

**Response:**
```json
{
  "ok": true,
  "rows": [
    {
      "item_code": "BBK-001",
      "item_name": "Bahan Baku Plastik",
      "unit": "PCS",
      "opening_balance": 0,
      "inbound": 100,
      "outbound": 20,
      "adjustment": 0,
      "book_balance": 80,
      "physical_opname": 80,
      "variance": 0,
      "notes": "",
      "location_id": "WH-A",
      "area": "A",
      "lot": "01",
      "rack": "05"
    }
  ],
  "summary": {
    "totalRows": 1,
    "totalInbound": 100,
    "totalOutbound": 20
  }
}
```

---

### **Stock Opname**

#### POST /inventory/stock-opname
Record stock take results.

**Request:**
```json
{
  "opname_date": "2025-11-24T16:00:00Z",
  "location_id": "WH-A",
  "items": [
    {
      "item_code": "BBK-001",
      "recorded_qty": 80,
      "counted_qty": 78,
      "note": "Variance -2 PCS"
    }
  ],
  "performed_by": "warehouse-staff@example.com"
}
```

**Response:** `{ ok: true, entry: {...} }`

---

### **Locations**

#### GET /inventory/locations
Fetch saved warehouse locations.

**Response:**
```json
{
  "ok": true,
  "locations": {
    "countries": [ { value: "ID", label: "Indonesia", createdAt: "..." } ],
    "cities": [ { value: "JAKARTA", label: "Jakarta", createdAt: "..." } ]
  }
}
```

---

#### POST /inventory/locations
Add a location entry.

**Request:**
```json
{
  "type": "country",
  "value": "ID",
  "label": "Indonesia"
}
```

**Response:** `{ ok: true, locations: {...} }`

---

## Type Filtering Logic (Aggregations)

When filtering by `type` in `/aggregations/mutasi`:

1. **Primary:** Check `items.item_group` field for exact match (bahan|produk|asset|reject)
2. **Fallback:** Match item names containing the type keyword (e.g., "Bahan" matches type=bahan)
3. **Heuristic:** Match item codes with common prefixes:
   - `BBK-*` → bahan
   - `PJ-*` → produk
   - `AST-*` / `*Mesin*` → asset
   - `REJ-*` → reject

This ensures backward compatibility with legacy items lacking `item_group` metadata.

---

## Common Use Cases

### 1. Create Goods Receipt (IN)

```bash
curl -X POST http://localhost:4000/api/inventory/movements \
  -H "Content-Type: application/json" \
  -d '{
    "doc_type": "BC 2.6.1",
    "doc_number": "BC2025-100",
    "doc_date": "2025-11-24",
    "receipt_number": "AWB-100",
    "location_id": "WH-A",
    "items": [
      {
        "item_code": "BBK-001",
        "qty": 100,
        "unit": "PCS",
        "movement_type": "IN"
      }
    ]
  }'
```

---

### 2. Create Goods Issue with Partial Pick (OUT)

```bash
curl -X POST http://localhost:4000/api/inventory/movements \
  -H "Content-Type: application/json" \
  -d '{
    "doc_type": "OUT",
    "doc_number": "OUT-100",
    "doc_date": "2025-11-24",
    "location_id": "WH-A",
    "items": [
      {
        "item_code": "BBK-001",
        "qty": 20,
        "unit": "PCS",
        "movement_type": "OUT",
        "reference_id": "<inbound-movement-id>"
      }
    ]
  }'
```

---

### 3. Get Mutasi Report by Item Group

```bash
# Bahan (Raw Materials)
curl "http://localhost:4000/api/inventory/aggregations/mutasi?start=2025-11-01&end=2025-11-30&type=bahan"

# Produk (Finished Goods)
curl "http://localhost:4000/api/inventory/aggregations/mutasi?start=2025-11-01&end=2025-11-30&type=produk"

# Asset (Equipment)
curl "http://localhost:4000/api/inventory/aggregations/mutasi?start=2025-11-01&end=2025-11-30&type=asset"

# Reject (Scrap)
curl "http://localhost:4000/api/inventory/aggregations/mutasi?start=2025-11-01&end=2025-11-30&type=reject"
```

---

## Frontend Integration

**Service File:** `src/services/kepabeananService.js`

### Key Functions

```javascript
// Create movement with items[]
await createMovement(payload);

// Fetch movements
await fetchInventoryMovements(filters);

// Get mutasi aggregation (respects type filter)
await fetchMutasiAggregation('bahan', { startDate, endDate });

// Stock opname (if needed)
await createStockOpname(payload);
```

---

## Verification Steps

1. **Add sample items:**
   ```bash
   bash scripts/add_sample_inventory.sh
   ```

2. **Verify movements:**
   ```bash
   curl "http://localhost:4000/api/inventory/movements"
   ```

3. **Verify aggregations by type:**
   ```bash
   curl "http://localhost:4000/api/inventory/aggregations/mutasi?type=bahan"
   curl "http://localhost:4000/api/inventory/aggregations/mutasi?type=produk"
   ```

4. **Check UI:**
   - Inventory tab: Add/Edit items
   - Goods Issue button: Create partial-pick OUT movements
   - Kepabeanan reports: Should show filtered items per type

---

## Future Enhancements

- [ ] DELETE endpoint for movements (soft-delete)
- [ ] Approval workflow (approve/reject OUT movements)
- [ ] Movement history / audit trail
- [ ] Available qty tracking per inbound line
- [ ] Custom aggregation periods (quarterly, yearly)
- [ ] Export to CSV/Excel
- [ ] Reconciliation endpoint (compare movements vs physical count)

---

## Support

For issues or questions, refer to:
- Backend route: `local_storage_server/routes/inventory.js`
- Frontend service: `src/services/kepabeananService.js`
- UI components: `src/components/BRidgeInventoryManagement.js`, `src/components/WarehouseManagement.js`

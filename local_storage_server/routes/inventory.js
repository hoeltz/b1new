const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// POST /api/warehouses/sync
// body: { event: 'warehouse.created'|'warehouse.updated'|'warehouse.deleted', data: {...} }
router.post('/warehouses/sync', (req, res) => {
  const payload = req.body || {};
  const event = payload.event;
  const data = payload.data || {};
  const idempotencyKey = req.get('Idempotency-Key') || `${event}:${data.warehouseId || data.id}`;

  const store = db.getData();
  store._idempotency = store._idempotency || {};

  if (store._idempotency[idempotencyKey]) {
    return res.json({ ok: true, message: 'already processed' });
  }

  try {
    switch (event) {
      case 'warehouse.created': {
        // upsert
        const existing = store.warehouses.find(w => w.warehouseId === data.warehouseId || w.id === data.warehouseId);
        const now = new Date().toISOString();
        const warehouse = {
          id: data.warehouseId || `wh-${Date.now()}`,
          name: data.name || data.warehouseName || 'Unnamed Warehouse',
          country: data.country || data.countryName || '',
          city: data.city || data.cityName || '',
          metadata: data.metadata || {},
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now
        };
        if (existing) {
          // update
          Object.assign(existing, warehouse, { updatedAt: new Date().toISOString() });
        } else {
          store.warehouses.push(warehouse);
        }
        break;
      }
      case 'warehouse.updated': {
        const id = data.warehouseId || data.id;
        const existing = store.warehouses.find(w => w.warehouseId === id || w.id === id);
        if (existing) {
          Object.assign(existing, data, { updatedAt: new Date().toISOString() });
        } else {
          // create if not exists
          const now = new Date().toISOString();
          store.warehouses.push({
            id: id || `wh-${Date.now()}`,
            name: data.name || 'Unnamed Warehouse',
            country: data.country || '',
            city: data.city || '',
            metadata: data.metadata || {},
            createdAt: now,
            updatedAt: now
          });
        }
        break;
      }
      case 'warehouse.deleted': {
        const id = data.warehouseId || data.id;
        if (!id) break;
        // check stock
        const stockHere = store.inventory.filter(i => i.warehouseId === id);
        const totalQty = stockHere.reduce((s, it) => s + (it.qty || 0), 0);
        if (totalQty > 0) {
          return res.status(400).json({ ok: false, message: 'warehouse has stock, cannot delete' });
        }
        store.warehouses = store.warehouses.filter(w => w.id !== id && w.warehouseId !== id);
        break;
      }
      default:
        return res.status(400).json({ ok: false, message: 'unknown event type' });
    }

    // mark idempotency
    store._idempotency[idempotencyKey] = { event, time: new Date().toISOString() };
    db.saveData(store);
    return res.json({ ok: true });
  } catch (err) {
    console.error('warehouses/sync error', err);
    return res.status(500).json({ ok: false, message: err.message || 'internal' });
  }
});

// GET /api/warehouses
router.get('/warehouses', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, warehouses: store.warehouses || [] });
});

// GET /api/inventory
router.get('/inventory', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, inventory: store.inventory || [] });
});

// POST /api/inventory/receive
// body: { sku, name, warehouseId, qty }
router.post('/inventory/receive', (req, res) => {
  const { sku, name, warehouseId, qty } = req.body || {};
  if (!sku || !warehouseId || !qty) return res.status(400).json({ ok: false, message: 'sku, warehouseId and qty are required' });

  const store = db.getData();
  const now = new Date().toISOString();

  // find existing item
  let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
  if (item) {
    item.qty = (item.qty || 0) + Number(qty);
    item.updatedAt = now;
  } else {
    item = {
      id: uuidv4(),
      sku,
      name: name || sku,
      warehouseId,
      qty: Number(qty),
      createdAt: now,
      updatedAt: now
    };
    store.inventory.push(item);
  }

  db.saveData(store);
  res.json({ ok: true, item });
});

// POST /api/inventory/dispatch
// body: { sku, warehouseId, qty }
router.post('/inventory/dispatch', (req, res) => {
  const { sku, warehouseId, qty } = req.body || {};
  if (!sku || !warehouseId || !qty) return res.status(400).json({ ok: false, message: 'sku, warehouseId and qty are required' });

  const store = db.getData();
  const now = new Date().toISOString();

  let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
  if (!item) return res.status(400).json({ ok: false, message: 'stock not found' });
  const available = item.qty || 0;
  if (available < qty) return res.status(400).json({ ok: false, message: 'insufficient stock' });

  item.qty = available - Number(qty);
  item.updatedAt = now;
  db.saveData(store);
  res.json({ ok: true, item });
});

// GET /api/locations (list warehouses simplified)
router.get('/locations', (req, res) => {
  const store = db.getData();
  const locations = (store.warehouses || []).map(w => ({ id: w.id, name: w.name, country: w.country, city: w.city }));
  res.json({ ok: true, locations });
});

// Consignments endpoints for sync with WarehouseManagement UI
// GET /api/consignments
router.get('/consignments', (req, res) => {
  const store = db.getData();
  res.json({ ok: true, consignments: store.consignments || [] });
});

// POST /api/consignments - create
router.post('/consignments', (req, res) => {
  const payload = req.body || {};
  const store = db.getData();
  store.consignments = store.consignments || [];
  const now = new Date().toISOString();
  const consignment = {
    id: payload.id || `WH-${Date.now()}`,
    ...payload,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  };
  store.consignments.push(consignment);
  db.saveData(store);
  res.json({ ok: true, consignment });
});

// PUT /api/consignments/:id - update
router.put('/consignments/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body || {};
  const store = db.getData();
  store.consignments = store.consignments || [];
  const idx = store.consignments.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'consignment not found' });
  store.consignments[idx] = { ...store.consignments[idx], ...updates, updatedAt: new Date().toISOString() };
  db.saveData(store);
  res.json({ ok: true, consignment: store.consignments[idx] });
});

// DELETE /api/consignments/:id - delete
router.delete('/consignments/:id', (req, res) => {
  const id = req.params.id;
  const store = db.getData();
  store.consignments = store.consignments || [];
  const idx = store.consignments.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: 'consignment not found' });
  store.consignments.splice(idx, 1);
  db.saveData(store);
  res.json({ ok: true });
});

// POST /api/consignments/dispatch - handle consignment shipment and decrement inventory
// body: { consignmentId, warehouseId, items: [{ sku, qty }, ...] }
router.post('/consignments/dispatch', (req, res) => {
  const { consignmentId, warehouseId, items } = req.body || {};
  if (!consignmentId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      ok: false, 
      message: 'consignmentId, warehouseId, and items array are required' 
    });
  }

  const store = db.getData();
  const now = new Date().toISOString();
  const dispatchedItems = [];
  const errors = [];

  try {
    // Process each item in the consignment
    for (const { sku, qty } of items) {
      if (!sku || !qty) {
        errors.push(`Invalid item: sku=${sku}, qty=${qty}`);
        continue;
      }

      let item = store.inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
      if (!item) {
        errors.push(`Stock not found for SKU ${sku} in warehouse ${warehouseId}`);
        continue;
      }

      const available = item.qty || 0;
      if (available < qty) {
        errors.push(`Insufficient stock for ${sku}: available ${available}, requested ${qty}`);
        continue;
      }

      // Decrement inventory
      item.qty = available - Number(qty);
      item.updatedAt = now;
      dispatchedItems.push({ sku, qty, newQty: item.qty });
    }

    // Update consignment status if dispatch was successful
    const consignment = store.consignments?.find(c => c.id === consignmentId);
    if (consignment) {
      consignment.status = 'Sudah Keluar';
      consignment.updatedAt = now;
    }

    db.saveData(store);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Some items failed to dispatch',
        dispatchedItems,
        errors 
      });
    }

    res.json({ 
      ok: true, 
      message: 'Consignment dispatched successfully',
      dispatchedItems 
    });
  } catch (err) {
    console.error('Consignment dispatch error', err);
    return res.status(500).json({ ok: false, message: err.message || 'internal error' });
  }
});

// ============================================================================
// UNIFIED INVENTORY & KEPABEANAN DATA INTEGRATION
// ============================================================================

// POST /api/inventory/items - Create or update item master
router.post('/inventory/items', (req, res) => {
  const { item_code, item_name, unit, item_group, hs_code, default_price, currency, description } = req.body || {};
  if (!item_code || !item_name) {
    return res.status(400).json({ ok: false, message: 'item_code and item_name are required' });
  }

  const store = db.getData();
  store.items = store.items || [];
  const now = new Date().toISOString();

  // Check if item exists
  let existing = store.items.find(i => i.item_code === item_code);
  if (existing) {
    existing.item_name = item_name;
    existing.unit = unit || existing.unit;
    existing.item_group = item_group || existing.item_group || 'bahan';
    existing.hs_code = hs_code || existing.hs_code || '';
    existing.default_price = default_price || existing.default_price || 0;
    existing.currency = currency || existing.currency || 'IDR';
    existing.description = description || existing.description || '';
    existing.updatedAt = now;
  } else {
    existing = {
      id: uuidv4(),
      item_code,
      item_name,
      unit: unit || 'unit',
      item_group: item_group || 'bahan',
      hs_code: hs_code || '',
      default_price: default_price || 0,
      currency: currency || 'IDR',
      description: description || '',
      createdAt: now,
      updatedAt: now
    };
    store.items.push(existing);
  }

  db.saveData(store);
  res.json({ ok: true, item: existing });
});

// GET /api/inventory/items - Get all items
router.get('/inventory/items', (req, res) => {
  const store = db.getData();
  const items = store.items || [];
  res.json({ ok: true, items });
});

// GET /api/inventory/locations - Get saved warehouse locations (countries & cities)
router.get('/inventory/locations', (req, res) => {
  const store = db.getData();
  store.locations = store.locations || { countries: [], cities: [] };
  res.json({ ok: true, locations: store.locations });
});

// POST /api/inventory/locations - Add a saved location entry { type: 'country'|'city', value, label }
router.post('/inventory/locations', (req, res) => {
  const { type, value, label } = req.body || {};
  if (!type || !value) return res.status(400).json({ ok: false, message: 'type and value required' });

  const store = db.getData();
  store.locations = store.locations || { countries: [], cities: [] };
  const now = new Date().toISOString();

  if (type === 'country') {
    if (!store.locations.countries.find(c => c.value === value)) {
      store.locations.countries.push({ value, label: label || value, createdAt: now });
    }
  } else {
    if (!store.locations.cities.find(c => c.value === value)) {
      store.locations.cities.push({ value, label: label || value, createdAt: now });
    }
  }

  db.saveData(store);
  res.json({ ok: true, locations: store.locations });
});

// POST /api/inventory/movements - Create movement(s) with warehouse fields
// body: can be single movement { item_code,... } OR { items: [ { item_code, qty, ... }, ... ], doc_type, doc_number, doc_date, location_id, to_location_id }
router.post('/inventory/movements', (req, res) => {
  const body = req.body || {};
  const store = db.getData();
  store.movements = store.movements || [];
  const now = new Date().toISOString();

  // helper to create single movement entry
  function makeMovement(base, it) {
    return {
      id: uuidv4(),
      doc_type: base.doc_type || it.doc_type || 'IN',
      doc_number: base.doc_number || it.doc_number || `DOC-${Date.now()}`,
      doc_date: base.doc_date || it.doc_date || now,
      receipt_number: base.receipt_number || it.receipt_number || '',
      receipt_date: base.receipt_date || it.receipt_date || now,
      sender_name: base.sender_name || it.sender_name || '',
      item_code: it.item_code,
      item_name: it.item_name || it.item_code,
      qty: Number(it.qty || 0),
      unit: it.unit || base.unit || 'unit',
      value_amount: it.value_amount || base.value_amount || 0,
      value_currency: it.value_currency || base.value_currency || 'IDR',
      movement_type: it.movement_type || base.movement_type || 'IN',
      source: it.source || base.source || 'WAREHOUSE',
      location_id: it.location_id || base.location_id || it.location || base.location || '',
      to_location_id: it.to_location_id || base.to_location_id || '',
      area: it.area || base.area || '',
      lot: it.lot || base.lot || it.lot || '',
      serial_no: it.serial_no || it.serial || '',
      rack: it.rack || base.rack || '',
      wip_stage: it.wip_stage || base.wip_stage || null,
      reference_id: it.reference_id || base.reference_id || null,
      created_by: it.created_by || base.created_by || 'system',
      approved_by: it.approved_by || base.approved_by || null,
      approval_status: it.approval_status || base.approval_status || 'pending',
      note: it.note || base.note || '',
      // Phase 1: AJU & Golongan
      aju_number: it.aju_number || base.aju_number || '',
      aju_date: it.aju_date || base.aju_date || '',
      golongan: it.golongan || base.golongan || 'barang masuk',
      masuk_warehouse_date: it.masuk_warehouse_date || base.masuk_warehouse_date || '',
      event_date: it.event_date || base.event_date || '',
      re_export_date: it.re_export_date || base.re_export_date || '',
      // Phase 1: TPPB Core
      tppb_number: it.tppb_number || base.tppb_number || '',
      tppb_date_start: it.tppb_date_start || base.tppb_date_start || '',
      tppb_date_end: it.tppb_date_end || base.tppb_date_end || '',
      manifest_number: it.manifest_number || base.manifest_number || '',
      manifest_line_no: it.manifest_line_no || base.manifest_line_no || '',
      hs_code: it.hs_code || base.hs_code || '',
      approval_by: it.approval_by || base.approval_by || '',
      approval_date: it.approval_date || base.approval_date || '',
      // Phase 2: Country & Custodian
      country_of_origin: it.country_of_origin || base.country_of_origin || '',
      export_destination: it.export_destination || base.export_destination || '',
      tppb_custodian: it.tppb_custodian || base.tppb_custodian || '',
      tppb_contact: it.tppb_contact || base.tppb_contact || '',
      // Phase 3: Value & Condition
      fob_value: Number(it.fob_value || base.fob_value || 0),
      cif_value: Number(it.cif_value || base.cif_value || 0),
      condition: it.condition || base.condition || 'baik',
      qty_condition_breakdown: it.qty_condition_breakdown || base.qty_condition_breakdown || '',
      inspections: it.inspections || base.inspections || [],
      createdAt: now,
      updatedAt: now
    };
  }

  try {
    const items = Array.isArray(body.items) ? body.items : null;
    const created = [];

    if (items && items.length > 0) {
      for (const it of items) {
        if (!it.item_code || !it.qty) continue;
        const mv = makeMovement(body, it);
        store.movements.push(mv);
        created.push(mv);
      }
    } else {
      // Single item style fallback
      const it = body;
      if (!it.item_code || !it.qty) {
        return res.status(400).json({ ok: false, message: 'item_code, qty, and movement_type are required (or provide items[]).' });
      }
      const mv = makeMovement({}, it);
      store.movements.push(mv);
      created.push(mv);
    }

    db.saveData(store);
    res.json({ ok: true, created, count: created.length });
  } catch (err) {
    console.error('create movements error', err);
    res.status(500).json({ ok: false, message: err.message || 'internal' });
  }
});

// GET /api/inventory/movements - Get movements with optional filters
router.get('/inventory/movements', (req, res) => {
  const { start, end, item, type } = req.query || {};
  const store = db.getData();
  let movements = store.movements || [];

  // Filter by date range
  if (start || end) {
    movements = movements.filter(m => {
      const date = m.doc_date;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }

  // Filter by item code
  if (item) {
    movements = movements.filter(m => 
      m.item_code.toLowerCase().includes(item.toLowerCase()) ||
      m.item_name.toLowerCase().includes(item.toLowerCase())
    );
  }

  // Filter by movement type
  if (type) {
    movements = movements.filter(m => m.movement_type === type);
  }

  res.json({ ok: true, rows: movements, count: movements.length });
});

// POST /api/inventory/stock-opname - record stock take / adjustments
// body: { opname_date, location_id, items: [ { item_code, recorded_qty, counted_qty, note } ], performed_by }
router.post('/inventory/stock-opname', (req, res) => {
  const body = req.body || {};
  const { opname_date, location_id, items, performed_by } = body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ ok: false, message: 'items array required' });

  const store = db.getData();
  store.stock_opname = store.stock_opname || [];
  const now = new Date().toISOString();

  const entry = {
    id: `OP-${Date.now()}`,
    opname_date: opname_date || now,
    location_id: location_id || '',
    items: items.map(it => ({ item_code: it.item_code, recorded_qty: Number(it.recorded_qty || 0), counted_qty: Number(it.counted_qty || 0), adjustment: Number((it.counted_qty || 0) - (it.recorded_qty || 0)), note: it.note || '' })),
    performed_by: performed_by || 'system',
    createdAt: now
  };

  store.stock_opname.push(entry);
  db.saveData(store);
  res.json({ ok: true, entry });
});

// GET /api/inventory/aggregations/mutasi - Mutation aggregation for kepabeanan reports
router.get('/inventory/aggregations/mutasi', (req, res) => {
  const { start, end, item, type } = req.query || {};
  const store = db.getData();
  let movements = store.movements || [];

  // Filter by date range
  if (start || end) {
    movements = movements.filter(m => {
      const date = m.doc_date;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }

  // Filter by item code
  if (item) {
    movements = movements.filter(m => 
      m.item_code.toLowerCase().includes(item.toLowerCase())
    );
  }

  // Filter by item group/type (bahan|produk|asset|reject)
  if (type) {
    store.items = store.items || [];
    const allowed = new Set(store.items.filter(i => (i.item_group || '').toLowerCase() === String(type).toLowerCase()).map(i => i.item_code));

    // Heuristic sets
    const alt = new Set(store.items.filter(i => {
      const code = (i.item_code || '').toLowerCase();
      const name = (i.item_name || '').toLowerCase();
      const t = String(type).toLowerCase();
      if (name.includes(t)) return true;
      if (t === 'bahan' && code.startsWith('bbk')) return true;
      if (t === 'produk' && code.startsWith('pj')) return true;
      if (t === 'asset' && (code.startsWith('ast') || name.includes('mesin'))) return true;
      if (t === 'reject' && code.startsWith('rej')) return true;
      return false;
    }).map(i => i.item_code));

    const alt2 = new Set(movements.filter(m => {
      const code = (m.item_code || '').toLowerCase();
      const name = (m.item_name || '').toLowerCase();
      const t = String(type).toLowerCase();
      if (name.includes(t)) return true;
      if (t === 'bahan' && code.startsWith('bbk')) return true;
      if (t === 'produk' && code.startsWith('pj')) return true;
      if (t === 'asset' && (code.startsWith('ast') || name.includes('mesin'))) return true;
      if (t === 'reject' && code.startsWith('rej')) return true;
      return false;
    }).map(m => m.item_code));

    // Union of allowed sets (master-based + heuristics + movement-based)
    const unionAllowed = new Set([...Array.from(allowed), ...Array.from(alt), ...Array.from(alt2)]);
    if (unionAllowed.size > 0) {
      movements = movements.filter(m => unionAllowed.has(m.item_code));
    }
    console.log('mutasi.type', type, 'allowed:', Array.from(allowed), 'alt:', Array.from(alt), 'alt2:', Array.from(alt2), 'movementsCountBefore:', store.movements.length, 'movementsAfterFilter:', movements.length);
  }

  // Aggregate by item_code
  const aggregated = {};
  movements.forEach(m => {
    const key = m.item_code;
    if (!aggregated[key]) {
      aggregated[key] = {
        item_code: m.item_code,
        item_name: m.item_name,
        unit: m.unit || 'unit',
        opening_balance: 0,
        inbound: 0,
        outbound: 0,
        adjustment: 0,
        book_balance: 0,
        physical_opname: 0,
        variance: 0,
        notes: '',
        wip_stage: null,
        location_id: m.location_id || m.location || '',
        to_location_id: m.to_location_id || '',
        area: m.area || '',
        lot: m.lot || '',
        rack: m.rack || '',
        serial_no: m.serial_no || ''
      };
    }

    if (m.movement_type === 'IN') {
      aggregated[key].inbound += Number(m.qty) || 0;
    } else if (m.movement_type === 'OUT') {
      aggregated[key].outbound += Number(m.qty) || 0;
    } else if (m.movement_type === 'ADJ') {
      aggregated[key].adjustment += Number(m.qty) || 0;
    }
  });

  // Calculate balances
  Object.keys(aggregated).forEach(key => {
    const agg = aggregated[key];
    agg.book_balance = agg.opening_balance + agg.inbound - agg.outbound + agg.adjustment;
    agg.physical_opname = agg.book_balance; // Default: assume opname = book balance
    agg.variance = agg.physical_opname - agg.book_balance;
  });

  const rows = Object.values(aggregated);
  res.json({ ok: true, rows, summary: { totalRows: rows.length, totalInbound: rows.reduce((s, r) => s + r.inbound, 0), totalOutbound: rows.reduce((s, r) => s + r.outbound, 0) } });
});

module.exports = router;

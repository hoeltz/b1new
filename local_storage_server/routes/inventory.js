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
  const { item_code, item_name, unit } = req.body || {};
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
    existing.updatedAt = now;
  } else {
    existing = {
      id: uuidv4(),
      item_code,
      item_name,
      unit: unit || 'unit',
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

// POST /api/inventory/movements - Create movement with warehouse fields
// body: { doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name, item_code, item_name, qty, unit, movement_type, location, area, lot, rack, wip_stage, note, source }
router.post('/inventory/movements', (req, res) => {
  const body = req.body || {};
  const {
    doc_type, doc_number, doc_date, receipt_number, receipt_date, sender_name,
    item_code, item_name, qty, unit, movement_type, location, area, lot, rack, wip_stage, note, source
  } = body;

  if (!item_code || !qty || !movement_type) {
    return res.status(400).json({ ok: false, message: 'item_code, qty, and movement_type are required' });
  }

  const store = db.getData();
  store.movements = store.movements || [];
  const now = new Date().toISOString();

  const movement = {
    id: uuidv4(),
    doc_type: doc_type || 'IN',
    doc_number: doc_number || `DOC-${Date.now()}`,
    doc_date: doc_date || now.split('T')[0],
    receipt_number: receipt_number || '',
    receipt_date: receipt_date || now.split('T')[0],
    sender_name: sender_name || '',
    item_code,
    item_name: item_name || item_code,
    qty: Number(qty),
    unit: unit || 'unit',
    value_amount: body.value_amount || 0,
    value_currency: body.value_currency || 'IDR',
    movement_type: movement_type || 'IN',
    source: source || 'WAREHOUSE',
    location: location || '',
    area: area || '',
    lot: lot || '',
    rack: rack || '',
    wip_stage: wip_stage || null,
    note: note || '',
    createdAt: now,
    updatedAt: now
  };

  store.movements.push(movement);
  db.saveData(store);
  res.json({ ok: true, movement });
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

// GET /api/inventory/aggregations/mutasi - Mutation aggregation for kepabeanan reports
router.get('/inventory/aggregations/mutasi', (req, res) => {
  const { start, end, item } = req.query || {};
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
        location: m.location || '',
        area: m.area || '',
        lot: m.lot || '',
        rack: m.rack || ''
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

const API_BASE = 'http://localhost:4000/api';

export async function fetchInbound(filters = {}) {
  const qs = new URLSearchParams();
  if (filters.startDate) qs.set('start', filters.startDate);
  if (filters.endDate) qs.set('end', filters.endDate);
  if (filters.docType) qs.set('docType', filters.docType);
  if (filters.item) qs.set('item', filters.item);
  const url = `${API_BASE}/kepabeanan/reports/inbound?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function fetchOutbound(filters = {}) {
  const qs = new URLSearchParams();
  if (filters.startDate) qs.set('start', filters.startDate);
  if (filters.endDate) qs.set('end', filters.endDate);
  if (filters.item) qs.set('item', filters.item);
  const url = `${API_BASE}/kepabeanan/reports/outbound?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function createItem(payload) {
  const res = await fetch(`${API_BASE}/inventory/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Create item failed');
  return res.json();
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE}/inventory/items`);
  if (!res.ok) throw new Error('Fetch items failed');
  return res.json();
}

export async function createMovement(payload) {
  const url = `${API_BASE}/inventory/movements`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Create movement failed');
  return res.json();
}

export async function fetchInventoryMovements(filters = {}) {
  const qs = new URLSearchParams();
  if (filters.startDate) qs.set('start', filters.startDate);
  if (filters.endDate) qs.set('end', filters.endDate);
  if (filters.item) qs.set('item', filters.item);
  if (filters.type) qs.set('type', filters.type);
  const res = await fetch(`${API_BASE}/inventory/movements?${qs.toString()}`);
  if (!res.ok) throw new Error('Fetch inventory movements failed');
  return res.json();
}

export async function fetchMutasiAggregation(type, filters = {}) {
  const qs = new URLSearchParams();
  if (filters.startDate) qs.set('start', filters.startDate);
  if (filters.endDate) qs.set('end', filters.endDate);
  if (filters.item) qs.set('item', filters.item);
  
  // Unified endpoint: fetch from inventory aggregations
  // type can be 'bahan', 'produk', 'asset', 'reject' but all use same aggregation logic
  const url = `${API_BASE}/inventory/aggregations/mutasi?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function fetchWip(filters = {}) {
  const qs = new URLSearchParams();
  if (filters.date) qs.set('date', filters.date);
  const url = `${API_BASE}/kepabeanan/reports/wip?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function fetchMutasiBahan(filters = {}) {
  const qs = new URLSearchParams();
  if (filters.startDate) qs.set('start', filters.startDate);
  if (filters.endDate) qs.set('end', filters.endDate);
  if (filters.item) qs.set('item', filters.item);
  const url = `${API_BASE}/kepabeanan/reports/mutasi_bahan?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function migrateBridgeInventory(payload = []) {
  const url = `${API_BASE}/inventory/migrate_bridge`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Migration failed');
  return res.json();
}

export default { fetchInbound };

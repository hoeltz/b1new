# Peningkatan Manajemen Inventori: AJU, Golongan & Tanggal Status

**Tanggal Implementasi:** 24 November 2025  
**Branch:** `fix/vendor-seed`  
**Status:** ✅ Selesai & Dipush ke Origin

---

## 📋 Ringkasan Perubahan

Fitur baru menambahkan dukungan lengkap untuk pencatatan **AJU (Angka Jenis Ubah)**, **Golongan Barang**, dan **Tanggal Status Kepabeanan** dalam modul **Manajemen Inventori Bridge**.

### Yang Ditambahkan

| Bidang | Tipe | Deskripsi |
|--------|------|-----------|
| **AJU Number** | String | Nomor Angka Jenis Ubah untuk keperluan kepabeanan |
| **AJU Date** | Date (YYYY-MM-DD) | Tanggal penerbitan AJU |
| **Golongan** | Dropdown | Klasifikasi barang: Barang Masuk, Barang Keluar, Bahan Baku, Barang Jadi, Mesin |
| **Tanggal Masuk Warehouse** | Date | Tanggal barang masuk ke gudang |
| **Tanggal Event** | Date | Tanggal kejadian/pemprosesan barang |
| **Tanggal Re-export** | Date | Tanggal re-export barang (jika ada) |

---

## 🎯 Perubahan Teknis

### 1. Frontend (`src/components/BRidgeInventoryManagement.js`)

#### A. State Form (Line ~78-100)
Menambahkan 6 field baru ke `formData`:
```javascript
const [formData, setFormData] = useState({
  // ... field lama
  aju_number: '',
  aju_date: '',
  golongan: 'barang masuk',
  masuk_warehouse_date: '',
  event_date: '',
  re_export_date: ''
});
```

#### B. Validasi Form (Line ~383-390)
- **Sebelum:** AWB & BL wajib diisi
- **Sesudah:** AWB & BL bersifat **opsional** (tidak wajib)
- Jika kosong, sistem otomatis menggenerate:
  - `AUTO-AWB-${timestamp}` untuk AWB
  - `AUTO-${timestamp}` untuk BL

```javascript
// Validasi hanya memerlukan item & consignee
if (!formData.item || !formData.consignee) {
  alert('Item dan Consignee harus diisi');
  return;
}
```

#### C. Dialog Form Input (Line ~948-1018)
Tiga bagian baru di form dialog:

**1) Bagian AJU:**
```jsx
<TextField
  label="AJU Number"
  value={formData.aju_number}
  onChange={handleInputChange}
  name="aju_number"
/>
<TextField
  label="AJU Date"
  type="date"
  value={formData.aju_date}
  onChange={handleInputChange}
  name="aju_date"
  InputLabelProps={{ shrink: true }}
/>
```

**2) Bagian Golongan (Dropdown):**
```jsx
<FormControl fullWidth>
  <InputLabel>Golongan</InputLabel>
  <Select
    value={formData.golongan}
    onChange={handleInputChange}
    name="golongan"
    label="Golongan"
  >
    <MenuItem value="barang masuk">Barang Masuk</MenuItem>
    <MenuItem value="barang keluar">Barang Keluar</MenuItem>
    <MenuItem value="bahan baku">Bahan Baku</MenuItem>
    <MenuItem value="barang jadi">Barang Jadi</MenuItem>
    <MenuItem value="mesin">Mesin</MenuItem>
  </Select>
</FormControl>
```

**3) Bagian Tanggal Status (3 field):**
```jsx
<TextField label="Tgl Masuk Warehouse" type="date" name="masuk_warehouse_date" />
<TextField label="Tgl Event" type="date" name="event_date" />
<TextField label="Tgl Re-export" type="date" name="re_export_date" />
```

#### D. Tabel Ringkasan (Line ~669-671, ~764-770)
Menampilkan 2 kolom baru:

| Kolom | Konten |
|-------|--------|
| **AJU / Golongan** | Nomor AJU + Golongan (contoh: "AJU123 / Barang Masuk") |
| **Tgl Masuk / Event** | Tanggal masuk warehouse + tanggal event (format Indonesia: DD/MM/YYYY) |

```jsx
// Header
<TableCell align="center">AJU / Golongan</TableCell>
<TableCell align="center">Tgl Masuk / Event</TableCell>

// Row Data
<TableCell align="center">
  <Typography variant="body2">{item.aju_number || '-'}</Typography>
  <Typography variant="caption">{item.golongan || '-'}</Typography>
</TableCell>
<TableCell align="center">
  <Typography variant="caption">
    {item.masuk_warehouse_date 
      ? new Date(item.masuk_warehouse_date).toLocaleDateString('id-ID') 
      : '-'}
  </Typography>
  <Typography variant="caption">
    {item.event_date 
      ? new Date(item.event_date).toLocaleDateString('id-ID') 
      : '-'}
  </Typography>
</TableCell>
```

### 2. Backend (`local_storage_server/routes/inventory.js`)

#### Fungsi makeMovement() (Line ~373-406)
Menambahkan 6 field baru ke record movement:

```javascript
function makeMovement(base, it) {
  return {
    // ... field lama
    aju_number: it.aju_number || base.aju_number || '',
    aju_date: it.aju_date || base.aju_date || '',
    golongan: it.golongan || base.golongan || 'barang masuk',
    masuk_warehouse_date: it.masuk_warehouse_date || base.masuk_warehouse_date || '',
    event_date: it.event_date || base.event_date || '',
    re_export_date: it.re_export_date || base.re_export_date || '',
    // ... timestamp
    createdAt: now,
    updatedAt: now
  };
}
```

---

## 🚀 Cara Menggunakan

### Dari UI (Frontend)

1. **Buka Manajemen Inventori**
   - Klik menu **Bridge → Warehouse/Inventory**

2. **Buka Dialog Input**
   - Klik tombol **"+ Buat Gerakan Inventori"** atau edit row yang ada

3. **Isi Data Wajib**
   - **Item Code** (wajib)
   - **Consignee** (wajib)
   - Field lain sesuai kebutuhan

4. **Isi Data AJU & Kepabeanan (Opsional)**
   - **AJU Number:** e.g., "PIB-2025-0001"
   - **AJU Date:** Pilih tanggal dari kalender
   - **Golongan:** Pilih dari dropdown (default: "Barang Masuk")

5. **Isi Tanggal Status (Opsional)**
   - **Tgl Masuk Warehouse:** Tanggal barang masuk
   - **Tgl Event:** Tanggal kejadian/pemprosesan
   - **Tgl Re-export:** Tanggal re-export (kosong jika tidak ada)

6. **Simpan**
   - Klik **"Save"** → Data tersimpan ke database

7. **Lihat di Tabel**
   - Baris terbaru akan menampilkan kolom **AJU / Golongan** dan **Tgl Masuk / Event**

### Dari API (Curl / Postman)

**Endpoint:** `POST http://localhost:4000/api/inventory/movements`

**Payload Contoh:**
```json
{
  "item_code": "TEST1",
  "item_name": "Test Item",
  "qty": 5,
  "unit": "PCS",
  "movement_type": "IN",
  "aju_number": "PIB-2025-0001",
  "aju_date": "2025-11-24",
  "golongan": "barang masuk",
  "masuk_warehouse_date": "2025-11-24",
  "event_date": "2025-11-24",
  "re_export_date": ""
}
```

**Command Curl:**
```bash
curl -X POST http://localhost:4000/api/inventory/movements \
  -H "Content-Type: application/json" \
  -d '{
    "item_code": "TEST1",
    "qty": 5,
    "movement_type": "IN",
    "aju_number": "PIB-2025-0001",
    "aju_date": "2025-11-24",
    "golongan": "barang masuk",
    "masuk_warehouse_date": "2025-11-24",
    "event_date": "2025-11-24",
    "re_export_date": ""
  }'
```

**Response:**
```json
{
  "ok": true,
  "created": [
    {
      "id": "uuid-here",
      "item_code": "TEST1",
      "qty": 5,
      "aju_number": "PIB-2025-0001",
      "aju_date": "2025-11-24",
      "golongan": "barang masuk",
      "masuk_warehouse_date": "2025-11-24",
      "event_date": "2025-11-24",
      "re_export_date": "",
      "createdAt": "2025-11-24T13:20:49.620Z",
      "updatedAt": "2025-11-24T13:20:49.620Z"
    }
  ]
}
```

---

## 🔄 Kompatibilitas Backward

✅ **Backward Compatible** — Field lama tetap bekerja:
- Gerakan inventori lama tanpa AJU/Golongan akan menampilkan **"-"** di kolom baru
- Data baru akan otomatis disimpan dengan field kosong jika tidak diisi
- Database JSON auto-expand (tidak perlu migrasi schema)

---

## 📊 Contoh Data Tersimpan

```json
{
  "id": "c5c237a0-21aa-4319-bb9f-c3b7f6c98d06",
  "doc_type": "IN",
  "doc_number": "DOC-1763990449623",
  "item_code": "TEST1",
  "item_name": "Test Item",
  "qty": 5,
  "unit": "unit",
  "movement_type": "IN",
  "aju_number": "AJU123",
  "aju_date": "2025-11-24",
  "golongan": "barang masuk",
  "masuk_warehouse_date": "2025-11-24",
  "event_date": "2025-11-24",
  "re_export_date": "",
  "createdAt": "2025-11-24T13:20:49.620Z",
  "updatedAt": "2025-11-24T13:20:49.620Z"
}
```

---

## ✅ Pengujian

### Build Status
```
✅ npm run build → Compiled successfully
✅ File size: 478.96 kB (gzipped)
```

### API Test
```bash
curl http://localhost:4000/api/inventory/movements?limit=1

# Result: Gerakan terbaru menampilkan semua 6 field baru
```

### Git Status
```
✅ Branch: fix/vendor-seed
✅ Commit: feat(inventory): persist AJU, golongan and status dates
✅ Pushed to: origin/fix/vendor-seed
```

---

## 📝 File yang Diubah

1. **`src/components/BRidgeInventoryManagement.js`** (+~80 baris)
   - formData state (6 field baru)
   - Validasi form (AWB/BL optional)
   - Dialog input (3 section baru)
   - Tabel display (2 kolom baru)

2. **`local_storage_server/routes/inventory.js`** (+6 baris)
   - makeMovement() function (6 field persistence)

---

## 🎓 Catatan Penting

1. **Format Tanggal:** HTML5 date input menggunakan format `YYYY-MM-DD` (ISO 8601)
2. **Tampilan Tanggal:** Tabel menampilkan format Indonesia `DD/MM/YYYY` menggunakan `toLocaleDateString('id-ID')`
3. **Golongan Default:** Jika tidak dipilih, default ke "barang masuk"
4. **Field Opsional:** Semua 6 field baru bersifat opsional (tidak wajib diisi)
5. **Auto Fallback:** AWB/BL yang kosong akan auto-generate dengan format `AUTO-AWB-${timestamp}` dan `AUTO-${timestamp}`

---

## 🔗 Referensi

- **UI Component:** Material-UI v5 (TextField, Select, MenuItem, FormControl)
- **Database:** JSON file-based (`local_storage_server/data.json`)
- **API Framework:** Express.js
- **Frontend Framework:** React 18.2.0

---

**Selesai Diimplementasikan oleh:** GitHub Copilot  
**Terakhir Diperbarui:** 24 November 2025

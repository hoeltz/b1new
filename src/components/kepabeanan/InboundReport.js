import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';
import { fetchInbound } from '../../services/kepabeananService';

export default function InboundReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', docType: '', item: '' });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const prior = new Date(now);
    prior.setDate(prior.getDate() - 30);
    setFilters((f) => ({ ...f, startDate: prior.toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) }));
    handleSearch();
    // eslint-disable-next-line
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchInbound(filters);
      setRows(resp.rows || []);
      setSummary(resp.summary || null);
    } catch (e) {
      setError(e.message || 'Error fetching data');
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function csvColumns() {
    return [
      { key: 'no', label: 'No' },
      { key: 'doc_type', label: 'Jenis Dokumen Pabean' },
      { key: 'doc_number', label: 'Nomor Dokumen' },
      { key: 'doc_date', label: 'Tanggal Dokumen' },
      { key: 'receipt_number', label: 'Nomor Bukti Penerimaan' },
      { key: 'receipt_date', label: 'Tanggal Penerimaan' },
      { key: 'sender_name', label: 'Pengirim Barang' },
      { key: 'item_code', label: 'Kode Barang' },
      { key: 'item_name', label: 'Nama Barang' },
      { key: 'qty', label: 'Jumlah' },
      { key: 'unit', label: 'Satuan' },
      { key: 'value_amount', label: 'Nilai' },
      { key: 'value_currency', label: 'Mata Uang' },
    ];
  }

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const cols = csvColumns();
    const header = cols.map((c) => c.label).join(',');
    const lines = rows.map((r) => cols.map((c) => csvSafe(String(r[c.key] ?? ''))).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kepabeanan-inbound-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvSafe(v) {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/\"/g, '""')}"`;
    }
    return v;
  }

  function printTable() {
    const cols = csvColumns();
    const htmlRows = rows
      .map((r) => `<tr>${cols.map((c) => `<td style="padding:6px;border:1px solid #ddd">${escapeHtml(r[c.key] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    const headerRow = `<tr>${cols.map((c) => `<th style="padding:6px;border:1px solid #ddd;background:#f5f5f5">${escapeHtml(c.label)}</th>`).join('')}</tr>`;
    const title = `Laporan Pemasukan Barang - ${filters.startDate || ''} s/d ${filters.endDate || ''}`;
    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`<html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,Helvetica,sans-serif;font-size:12px;} table{border-collapse:collapse;width:100%;}</style></head><body>`);
    win.document.write(`<h3>${escapeHtml(title)}</h3>`);
    win.document.write(`<table>${headerRow}${htmlRows}</table>`);
    win.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return (
    <BRidgeKepabeananLayout
      title="Laporan Pemasukan Barang"
      subtitle="Laporan Penerimaan dan Pemasukan Barang ke Gudang (PIB)"
      breadcrumbs={['Portal Kepabeanan', 'Pemasukan']}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
            disabled={!rows.length}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PrintIcon />}
            onClick={printTable}
            disabled={!rows.length}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            Print
          </Button>
        </Box>
      }
    >
      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, backgroundColor: 'white' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
          Filter Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Tanggal Mulai"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Tanggal Akhir"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Jenis Dokumen"
              value={filters.docType}
              onChange={(e) => setFilters({ ...filters, docType: e.target.value })}
              placeholder="PIB / Lainnya"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Kode/Nama Barang"
              value={filters.item}
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
              placeholder="Cari..."
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ mt: 0.5 }}
            >
              {loading ? 'Mencari...' : 'Cari'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Section */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Dokumen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {summary.totalRows || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Jumlah Masuk
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {(summary.totalQtyIn || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Nilai (IDR)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {(summary.totalValueIDR || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} elevation={1} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 50, textAlign: 'center' }}>
                No
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Jenis Dokumen Pabean
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Nomor Dokumen
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Tanggal Dokumen
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                No. Bukti Penerimaan
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Tanggal Penerimaan
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Pengirim Barang
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Kode Barang
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Nama Barang
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Jumlah
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 80 }}>
                Satuan
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Nilai
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 80 }}>
                Mata Uang
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">Tidak ada data ditemukan</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell sx={{ py: 1.5, textAlign: 'center', fontWeight: 'bold', color: '#667eea' }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.doc_type ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontFamily: 'monospace' }}>
                    {String(row.doc_number ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.doc_date ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontFamily: 'monospace' }}>
                    {String(row.receipt_number ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.receipt_date ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.sender_name ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>
                    {String(row.item_code ?? '')}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.item_name ?? '')}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>
                    {(row.qty || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.unit ?? '')}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    {(row.value_amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {String(row.value_currency ?? '')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </BRidgeKepabeananLayout>
  );
}

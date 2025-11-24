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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';
import { fetchOutbound } from '../../services/kepabeananService';

export default function OutboundReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', item: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

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
    try {
      const resp = await fetchOutbound(filters);
      setRows(resp.rows || []);
      setSummary(resp.summary || null);
    } catch (err) {
      console.error(err);
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    if (!rows || rows.length === 0) return;
    const doc = new jsPDF();
    const head = [['Jenis Dok', 'Nomor', 'Tanggal', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Satuan']];
    const body = rows.map(r => [r.doc_type, r.doc_number, r.doc_date, r.item_code, r.item_name, r.qty, r.unit]);
    doc.text('Laporan Pengeluaran Barang', 14, 16);
    // @ts-ignore
    doc.autoTable({ head, body, startY: 22 });
    doc.save(`kepabeanan-outbound-${new Date().toISOString().slice(0,19)}.pdf`);
  }

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const header = ['Jenis Dok', 'Nomor', 'Tanggal', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Satuan'];
    const lines = rows.map((r) => [r.doc_type, r.doc_number, r.doc_date, r.item_code, r.item_name, r.qty, r.unit].map(v => csvSafe(String(v || ''))).join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kepabeanan-outbound-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvSafe(v) {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/\"/g, '""')}"`;
    }
    return v;
  }

  return (
    <BRidgeKepabeananLayout
      title="Laporan Pengeluaran Barang"
      subtitle="Laporan Pengeluaran Barang Dari Gudang (DO/Invoice)"
      breadcrumbs={['Portal Kepabeanan', 'Pengeluaran']}
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
            variant="contained"
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={exportPDF}
            disabled={!rows.length}
            sx={{ color: '#667eea', backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            Export PDF
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Kode/Nama Barang"
              value={filters.item}
              onChange={(e) => setFilters({ ...filters, item: e.target.value })}
              placeholder="Cari..."
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
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
          <Grid item xs={12} sm={6} md={6}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Jumlah Keluar
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {(summary.totalQtyOut || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Table Section */}
      <TableContainer component={Paper} elevation={1} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 50, textAlign: 'center' }}>
                No
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Jenis Dokumen
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Nomor Dokumen
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea' }}>
                Tanggal
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
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                    {row.doc_type || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontFamily: 'monospace' }}>
                    {row.doc_number || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {row.doc_date || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>
                    {row.item_code || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {row.item_name || ''}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>
                    {(row.qty || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {row.unit || ''}
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

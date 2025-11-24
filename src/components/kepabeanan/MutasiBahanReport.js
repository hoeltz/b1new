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
  Search as SearchIcon,
} from '@mui/icons-material';
import BRidgeKepabeananLayout from '../BRidgeKepabeananLayout';
import { fetchMutasiAggregation } from '../../services/kepabeananService';

export default function MutasiBahanReport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', item: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const now = new Date();
    const prior = new Date(now);
    prior.setMonth(prior.getMonth() - 1);
    setFilters((f) => ({ ...f, startDate: prior.toISOString().slice(0, 10), endDate: now.toISOString().slice(0, 10) }));
    handleSearch();
    // eslint-disable-next-line
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchMutasiAggregation(filters);
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

  function exportCSV() {
    if (!rows || rows.length === 0) return;
    const headers = ['No', 'Kode Barang', 'Nama Barang', 'Satuan', 'Saldo Awal', 'Pemasukan', 'Pengeluaran', 'Penyesuaian', 'Saldo Buku', 'Stock Opname', 'Selisih', 'Keterangan'];
    const lines = rows.map((r, idx) =>
      [
        idx + 1,
        r.item_code,
        r.item_name,
        r.unit,
        r.opening_balance || 0,
        r.inbound || 0,
        r.outbound || 0,
        r.adjustment || 0,
        r.book_balance || 0,
        r.physical_opname || 0,
        r.variance || 0,
        r.notes || ''
      ]
        .map(v => csvSafe(String(v || '')))
        .join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutasi-bahan-${new Date().toISOString().slice(0, 19)}.csv`;
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
      title="Laporan Mutasi Barang Baku/Bahan Penolong"
      subtitle="Laporan Agregasi Mutasi Bahan Baku dan Bahan Penolong dengan Reconciliation"
      breadcrumbs={['Portal Kepabeanan', 'Mutasi Bahan']}
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
        </Box>
      }
    >
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Item Barang Baku
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {summary.totalRows || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} elevation={1} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1300 }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 50, textAlign: 'center' }}>No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 100 }}>Kode Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 150 }}>Nama Barang</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 80 }}>Satuan</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 100 }}>Saldo Awal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#4caf50', minWidth: 80 }}>Pemasukan</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#f44336', minWidth: 80 }}>Pengeluaran</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 100 }}>Penyesuaian</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#9c27b0', minWidth: 100 }}>Saldo Buku</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#9c27b0', minWidth: 100 }}>Stock Opname</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 80 }}>Selisih</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 120 }}>Keterangan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">Tidak ada data ditemukan</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const variance = (row.variance || 0);
                const varianceColor = variance > 0 ? '#4caf50' : variance < 0 ? '#f44336' : '#999999';
                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ py: 1.5, textAlign: 'center', fontWeight: 'bold', color: '#667eea' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 'bold', fontFamily: 'monospace' }}>{row.item_code || ''}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{row.item_name || ''}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{row.unit || ''}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>{(row.opening_balance || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: '#4caf50' }}>{(row.inbound || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: '#f44336' }}>{(row.outbound || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>{(row.adjustment || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: '#9c27b0', backgroundColor: 'rgba(156, 39, 176, 0.05)' }}>{(row.book_balance || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: '#9c27b0', backgroundColor: 'rgba(156, 39, 176, 0.05)' }}>{(row.physical_opname || 0).toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: varianceColor }}>{(variance).toLocaleString()}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>{row.notes || ''}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </BRidgeKepabeananLayout>
  );
}

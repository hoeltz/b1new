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
import { fetchOutbound } from '../../services/kepabeananService';

export default function RejectReport() {
  const [filters, setFilters] = useState({ date: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const now = new Date();
    setFilters((f) => ({ ...f, date: now.toISOString().slice(0, 10) }));
    handleSearch();
    // eslint-disable-next-line
  }, []);

  async function handleSearch() {
    setLoading(true);
    setError('');
    try {
      const resp = await fetchOutbound(filters); // sementara pakai outbound
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
    const headers = ['No', 'Tanggal Reject', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Satuan', 'Alasan Reject', 'Disposisi'];
    const lines = rows.map((r, idx) =>
      [idx + 1, r.reject_date, r.item_code, r.item_name, r.qty, r.unit || '', r.reject_reason || '', r.disposition || '']
        .map(v => csvSafe(String(v || '')))
        .join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reject-report-${new Date().toISOString().slice(0, 19)}.csv`;
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
      title="Laporan Barang Reject/Scrap"
      subtitle="Laporan Pertanggungjawaban Barang Reject, Cacat, dan Scrap dengan Alasan dan Disposisi"
      breadcrumbs={['Portal Kepabeanan', 'Barang Reject']}
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
      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, backgroundColor: 'white' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#667eea' }}>
          Filter Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Tanggal Awal"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
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

      {/* Summary Card */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography color="inherit" variant="body2" sx={{ opacity: 0.8 }}>
                  Total Item Reject
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {summary.totalRows || 0}
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
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 110 }}>
                Tanggal Reject
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 100 }}>
                Kode Barang
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 150 }}>
                Nama Barang
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 80 }}>
                Jumlah
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', width: 80 }}>
                Satuan
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 180 }}>
                Alasan Reject
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white', backgroundColor: '#667eea', minWidth: 150 }}>
                Disposisi
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
                  <TableCell sx={{ py: 1.5, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {row.reject_date ? new Date(row.reject_date).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {row.item_code || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {row.item_name || ''}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', color: '#f44336' }}>
                    {(row.qty || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {row.unit || ''}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.9rem' }}>
                    {row.reject_reason || '-'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, fontSize: '0.9rem' }}>
                    {row.disposition || '-'}
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

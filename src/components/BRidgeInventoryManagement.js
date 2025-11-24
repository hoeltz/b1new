import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

import notificationService from '../services/notificationService';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';
import { fetchItems, createItem, createMovement, fetchInventoryMovements } from '../services/kepabeananService';

const BC_TYPES = [
  'BC 2.5',
  'BC 2.6.1',
  'BC 2.8',
  'BC 3.0',
  'BC 4.1',
  'BC 4.2',
  'BC 25',
  'BC 30'
];

const SHIPPING_STATUSES = [
  'Event',
  'Ready to Ship',
  'Domestic Sales'
];

const CUSTOMS_STATUSES = [
  'Import',
  'Export'
];

const BridgeInventoryManagement = ({ onNotification }) => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShippingStatus, setSelectedShippingStatus] = useState('all');
  const [selectedCustomsStatus, setSelectedCustomsStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    awb: '',
    bl: '',
    warehouseEntryDate: '',
    bcInputType: '',
    item: '',
    quantity: 0,
    location: '',
    area: '',
    lot: '',
    rack: '',
    consignee: '',
    shippingStatus: 'Event',
    description: '',
    customsStatus: 'Import',
    relatedDocuments: []
  });

  const [itemsList, setItemsList] = useState([]);

  const createSampleInventory = () => [
    {
      id: 'INV-2024-001',
      awb: 'AWB-2024-001-AB',
      bl: 'BL-2024-001',
      warehouseEntryDate: '2024-11-10',
      bcInputType: 'BC 2.5',
      item: 'Professional Wireless Microphone System',
      quantity: 24,
      location: 'Area A/01/05',
      area: 'A',
      lot: '01',
      rack: '05',
      consignee: 'PT. Event Pro Indonesia',
      shippingStatus: 'Event',
      description: 'Professional 4-channel wireless microphone system with handheld and lavalier options for corporate events',
      customsStatus: 'Import',
      relatedDocuments: ['BC2024/0001/001', 'Customs Declaration 001'],
      module: 'BRIDGE',
      moduleType: 'inventory_management',
      createdAt: '2024-11-10T08:30:00Z',
      updatedAt: '2024-11-10T08:30:00Z'
    },
    {
      id: 'INV-2024-002',
      awb: 'AWB-2024-002-CD',
      bl: 'BL-2024-002',
      warehouseEntryDate: '2024-11-12',
      bcInputType: 'BC 2.6.1',
      item: 'LED Spot Light Set',
      quantity: 18,
      location: 'Area B/03/12',
      area: 'B',
      lot: '03',
      rack: '12',
      consignee: 'CV. Lighting Solutions',
      shippingStatus: 'Ready to Ship',
      description: 'Quad-color LED spot lights with DMX control for professional event lighting installations',
      customsStatus: 'Import',
      relatedDocuments: ['BC2024/0002/001', 'Import Permit 002'],
      module: 'BRIDGE',
      moduleType: 'inventory_management',
      createdAt: '2024-11-12T10:15:00Z',
      updatedAt: '2024-11-12T10:15:00Z'
    },
    {
      id: 'INV-2024-003',
      awb: 'AWB-2024-003-EF',
      bl: 'BL-2024-003',
      warehouseEntryDate: '2024-11-13',
      bcInputType: 'BC 3.0',
      item: 'Commercial Grade Folding Chairs',
      quantity: 150,
      location: 'Area C/05/08',
      area: 'C',
      lot: '05',
      rack: '08',
      consignee: 'PT. Event Furniture Solutions',
      shippingStatus: 'Domestic Sales',
      description: 'Commercial grade steel frame folding chairs with vinyl upholstery for venue seating arrangements',
      customsStatus: 'Import',
      relatedDocuments: ['BC2024/0003/001', 'Re-export Document 003'],
      module: 'BRIDGE',
      moduleType: 'inventory_management',
      createdAt: '2024-11-13T14:20:00Z',
      updatedAt: '2024-11-13T14:20:00Z'
    },
    {
      id: 'INV-2024-004',
      awb: 'AWB-2024-004-GH',
      bl: 'BL-2024-004',
      warehouseEntryDate: '2024-11-13',
      bcInputType: 'BC 4.1',
      item: '4K Professional Projector',
      quantity: 8,
      location: 'Area A/02/15',
      area: 'A',
      lot: '02',
      rack: '15',
      consignee: 'PT. Visual Technology Solutions',
      shippingStatus: 'Event',
      description: 'High-resolution 4K laser projector for large venue presentations and corporate showcases',
      customsStatus: 'Export',
      relatedDocuments: ['BC2024/0004/001', 'Export License 004'],
      module: 'BRIDGE',
      moduleType: 'inventory_management',
      createdAt: '2024-11-13T16:45:00Z',
      updatedAt: '2024-11-13T16:45:00Z'
    },
    {
      id: 'INV-2024-005',
      awb: 'AWB-2024-005-IJ',
      bl: 'BL-2024-005',
      warehouseEntryDate: '2024-11-13',
      bcInputType: 'BC 2.8',
      item: 'Modular Platform Staging System',
      quantity: 32,
      location: 'Area D/01/20',
      area: 'D',
      lot: '01',
      rack: '20',
      consignee: 'PT. Stage Pro Equipment',
      shippingStatus: 'Ready to Ship',
      description: 'Modular aluminum platform staging system with adjustable height for outdoor and indoor events',
      customsStatus: 'Import',
      relatedDocuments: ['BC2024/0005/001', 'Bonded Warehouse Transfer 005'],
      module: 'BRIDGE',
      moduleType: 'inventory_management',
      createdAt: '2024-11-13T18:30:00Z',
      updatedAt: '2024-11-13T18:30:00Z'
    }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const apiResp = await fetchInventoryMovements();
      if (apiResp && Array.isArray(apiResp.rows)) {
        const mapped = apiResp.rows.map(mapMovementToInventory);
        setInventory(mapped);
      } else {
        setInventory([]);
      }
    } catch (error) {
      console.error('Error loading inventory data from API:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  function mapMovementToInventory(m) {
    return {
      id: m.id,
      awb: m.receipt_number || '',
      bl: m.doc_number || '',
      warehouseEntryDate: m.doc_date || '',
      bcInputType: m.doc_type || '',
      item: `${m.item_code || ''}${m.item_code && m.item_name ? ' - ' : ''}${m.item_name || ''}`,
      quantity: Number(m.qty || 0),
      location: '',
      area: '',
      lot: '',
      rack: '',
      consignee: m.sender_name || '',
      shippingStatus: 'Event',
      description: m.note || '',
      customsStatus: m.source && m.source.toLowerCase().includes('pib') ? 'Import' : 'Import',
      relatedDocuments: [],
      module: 'INVENTORY',
      moduleType: 'inventory_movement',
      createdAt: m.created_at || new Date().toISOString(),
      updatedAt: m.created_at || new Date().toISOString()
    };
  }

  useEffect(() => {
    // Do not automatically clear the inventory database on mount.
    // Load existing data; if none exists, seed with sample inventory.
    loadData();
    // fetch master items from inventory service
    (async () => {
      try {
        const itemsResp = await fetchItems();
        setItemsList(itemsResp.rows || []);
      } catch (e) {
        // silent fallback
        console.warn('Failed to fetch master items', e);
      }
    })();
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.awb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.consignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShippingStatus = selectedShippingStatus === 'all' || item.shippingStatus === selectedShippingStatus;
    const matchesCustomsStatus = selectedCustomsStatus === 'all' || item.customsStatus === selectedCustomsStatus;
    const matchesLocation = selectedLocation === 'all' || item.area === selectedLocation;

    return matchesSearch && matchesShippingStatus && matchesCustomsStatus && matchesLocation;
  });

  const getStats = () => {
    const totalItems = inventory.length;
    const shippingStatusCounts = {
      'Event': 0,
      'Ready to Ship': 0,
      'Domestic Sales': 0
    };
    const customsStatusCounts = {
      'Import': 0,
      'Export': 0
    };

    inventory.forEach(item => {
      shippingStatusCounts[item.shippingStatus] = (shippingStatusCounts[item.shippingStatus] || 0) + 1;
      customsStatusCounts[item.customsStatus] = (customsStatusCounts[item.customsStatus] || 0) + 1;
    });

    return { totalItems, shippingStatusCounts, customsStatusCounts };
  };

  const stats = getStats();

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateLocation = (area, lot, rack) => {
    const location = [area, lot, rack].filter(Boolean).join('/');
    setFormData(prev => ({
      ...prev,
      area,
      lot,
      rack,
      location: location
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!formData.awb || !formData.bl || !formData.item || !formData.consignee) {
        setLoading(false);
        return;
      }

      // Extract item_code and item_name from form
      let item_code = null;
      let item_name = formData.item || '';
      const mm = String(formData.item).match(/^([A-Z0-9\-]+)\s*-\s*(.+)$/i);
      if (mm) { 
        item_code = mm[1]; 
        item_name = mm[2]; 
      }
      if (!item_code) item_code = `MAN-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

      // Create/update master item
      try { 
        await createItem({ item_code, item_name, unit: '' }); 
      } catch (e) { 
        /* ignore duplicate item */ 
      }

      // Create movement record
      await createMovement({
        doc_type: formData.bcInputType || 'BRIDGE',
        doc_number: formData.bl || '',
        doc_date: formData.warehouseEntryDate || new Date().toISOString().slice(0, 10),
        receipt_number: formData.awb || '',
        receipt_date: formData.warehouseEntryDate || null,
        sender_name: formData.consignee || '',
        item_code,
        item_name,
        qty: Number(formData.quantity || 0),
        unit: '',
        value_amount: 0,
        value_currency: 'IDR',
        movement_type: 'IN',
        source: 'BRIDGE',
        note: formData.description || ''
      });

      // Reload data from API
      const apiResp = await fetchInventoryMovements();
      if (apiResp && Array.isArray(apiResp.rows)) {
        setInventory(apiResp.rows.map(mapMovementToInventory));
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        ...item,
        area: item.area || '',
        lot: item.lot || '',
        rack: item.rack || '',
        relatedDocuments: item.relatedDocuments || []
      });
    } else {
      setSelectedItem(null);
      setFormData({
        awb: '',
        bl: '',
        warehouseEntryDate: '',
        bcInputType: '',
        item: '',
        quantity: 0,
        location: '',
        area: '',
        lot: '',
        rack: '',
        consignee: '',
        shippingStatus: 'Event',
        description: '',
        customsStatus: 'Import',
        relatedDocuments: []
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.item}"?`)) {
      try {
        setLoading(true);
        // TODO: Implement API delete endpoint when needed
        // For now, just remove from local state
        const updatedInventory = inventory.filter(i => i.id !== item.id);
        setInventory(updatedInventory);
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Event':
        return 'primary';
      case 'Ready to Ship':
        return 'success';
      case 'Domestic Sales':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <BridgeHeader
        title="Inventory Management"
        subtitle="Warehouse Inventory Tracking System"
        actions={(
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ py: 1.5, px: 3 }}
            >
              Add Inventory Item
            </Button>
          </Box>
        )}
      />

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4}>
          <BridgeStatCard title="Total Items" value={stats.totalItems} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4}>
          <BridgeStatCard title="Event Status" value={stats.shippingStatusCounts['Event']} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4}>
          <BridgeStatCard title="Ready to Ship" value={stats.shippingStatusCounts['Ready to Ship']} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4}>
          <BridgeStatCard title="Import" value={stats.customsStatusCounts['Import']} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4} lg={2.4} xl={2.4}>
          <BridgeStatCard title="Export" value={stats.customsStatusCounts['Export']} gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search inventory..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Shipping Status</InputLabel>
            <Select
              value={selectedShippingStatus}
              onChange={(e) => setSelectedShippingStatus(e.target.value)}
              label="Shipping Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              {SHIPPING_STATUSES.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Customs Status</InputLabel>
            <Select
              value={selectedCustomsStatus}
              onChange={(e) => setSelectedCustomsStatus(e.target.value)}
              label="Customs Status"
            >
              <MenuItem value="all">All Customs</MenuItem>
              {CUSTOMS_STATUSES.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Location Area</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Location Area"
            >
              <MenuItem value="all">All Areas</MenuItem>
              <MenuItem value="A">Area A</MenuItem>
              <MenuItem value="B">Area B</MenuItem>
              <MenuItem value="C">Area C</MenuItem>
              <MenuItem value="D">Area D</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table sx={{ minWidth: 'max-content' }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>AWB</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>BL</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Status Pengiriman</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Dokumentasi Terkait</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Pemilik Barang</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Keterangan Detail</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Lokasi Penyimpanan</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Jumlah Unit</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Status Cukai</Typography>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          {inventory.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No inventory items found. Click "Add Inventory" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : filteredInventory.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No inventory items match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow
                key={item.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <TableCell sx={{ py: 2, fontFamily: 'monospace' }}>
                  {item.awb}
                </TableCell>
                <TableCell sx={{ py: 2, fontFamily: 'monospace' }}>
                  {item.bl}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={item.shippingStatus}
                    color={getStatusColor(item.shippingStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ py: 2, maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.relatedDocuments?.join(', ') || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, maxWidth: 180 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.consignee}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, maxWidth: 250 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2">
                    {item.location}
                  </Typography>
                  {item.area && item.lot && item.rack && (
                    <Typography variant="caption" color="textSecondary">
                      Area {item.area}/Lot {item.lot}/Rack {item.rack}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {(item.quantity || 0).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={item.customsStatus}
                    color={item.customsStatus === 'Import' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    sx={{
                      color: 'secondary.main',
                      '&:hover': { backgroundColor: 'rgba(118, 75, 162, 0.1)' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteItem(item)}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedItem ? `Edit Inventory Item - ${selectedItem.item}` : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="AWB"
                value={formData.awb}
                onChange={handleInputChange('awb')}
                required
                placeholder="e.g., AWB-2024-001-AB"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="BL"
                value={formData.bl}
                onChange={handleInputChange('bl')}
                required
                placeholder="e.g., BL-2024-001"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warehouse Entry Date"
                type="date"
                value={formData.warehouseEntryDate}
                onChange={handleInputChange('warehouseEntryDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>BC Input Type</InputLabel>
                <Select
                  value={formData.bcInputType}
                  onChange={handleInputChange('bcInputType')}
                  label="BC Input Type"
                >
                  {BC_TYPES.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item"
                value={formData.item}
                onChange={handleInputChange('item')}
                required
                placeholder="Item name"
                inputProps={{ list: 'items-list' }}
              />
              <datalist id="items-list">
                {itemsList.map(it => (
                  <option key={it.item_code} value={`${it.item_code} - ${it.item_name}`} />
                ))}
              </datalist>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Area"
                value={formData.area}
                onChange={(e) => updateLocation(e.target.value, formData.lot, formData.rack)}
                placeholder="e.g., A, B, C, D"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lot"
                value={formData.lot}
                onChange={(e) => updateLocation(formData.area, e.target.value, formData.rack)}
                placeholder="e.g., 01, 02, 03"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rack"
                value={formData.rack}
                onChange={(e) => updateLocation(formData.area, formData.lot, e.target.value)}
                placeholder="e.g., 05, 12, 15"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Consignee"
                value={formData.consignee}
                onChange={handleInputChange('consignee')}
                required
                placeholder="Company/Person receiving the items"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status Pengiriman</InputLabel>
                <Select
                  value={formData.shippingStatus}
                  onChange={handleInputChange('shippingStatus')}
                  label="Status Pengiriman"
                >
                  {SHIPPING_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status Cukai</InputLabel>
                <Select
                  value={formData.customsStatus}
                  onChange={handleInputChange('customsStatus')}
                  label="Status Cukai"
                >
                  {CUSTOMS_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dokumentasi Terkait"
                value={formData.relatedDocuments?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  relatedDocuments: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
                placeholder="Pisahkan dengan koma, contoh: BC2024/0001/001, Invoice-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keterangan Detail"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Keterangan detail barang"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : selectedItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BridgeInventoryManagement;
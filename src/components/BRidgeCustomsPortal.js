import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

import dataSyncService from '../services/dataSync';
import notificationService from '../services/notificationService';
import warehouseDataService from '../services/warehouseDataService';
import BridgeHeader from './BridgeHeader';
import BridgeStatCard from './BridgeStatCard';

// Portal Bea Cukai Integration for B-ridge - Focused on Item Data Management
const BRidgeCustomsPortal = ({ onNotification }) => {
  const [customsItems, setCustomsItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Status options for warehouse, event, BC
  const statusOptions = [
    { value: 'warehouse', label: 'Warehouse', color: 'primary' },
    { value: 'event', label: 'Event', color: 'success' },
    { value: 'bc_pending', label: 'BC Pending', color: 'warning' },
    { value: 'bc_approved', label: 'BC Approved', color: 'info' },
    { value: 'bc_rejected', label: 'BC Rejected', color: 'error' }
  ];
  // Add TPPB-specific statuses including rejected/damaged
  statusOptions.push(
    { value: 'TPPB_PENDING', label: 'TPPB Pending', color: 'warning' },
    { value: 'TPPB_APPROVED_FOR_SALE', label: 'TPPB Approved (Sale)', color: 'success' },
    { value: 'TPPB_APPROVED_FOR_REEXPORT', label: 'TPPB Approved (Re-export)', color: 'info' },
    { value: 'TPPB_TRANSFERRED', label: 'TPPB Transferred', color: 'primary' },
    { value: 'TPPB_RETURNED', label: 'TPPB Returned', color: 'default' },
    { value: 'TPPB_CLEARED', label: 'TPPB Cleared', color: 'success' },
    { value: 'TPPB_REJECTED', label: 'TPPB Rejected', color: 'error' },
    { value: 'TPPB_DAMAGED', label: 'TPPB Damaged', color: 'error' }
  );

  // Location options
  const locationOptions = [
    'Tanjung Priok Port',
    'Soekarno-Hatta Airport',
    'Changi Airport',
    'Warehouse A-1',
    'Warehouse B-2',
    'Warehouse C-1',
    'Bonded Zone Alpha',
    'Bonded Zone Beta'
  ];

  // Load customs items data
  const loadCustomsData = useCallback(async () => {
    setLoading(true);
    try {
      const customsItems = warehouseDataService.getCustomsItems();

      // Initialize with sample data if none exists
      if (!customsItems || customsItems.length === 0) {
        const sampleItems = [
          {
            id: 'CI-2024-001',
            itemName: 'Professional Wireless Microphone System',
            awbNumber: 'AWB-2024-001-AB',
            blNumber: 'BL-2024-001',
            location: 'Warehouse A-1',
            status: 'warehouse',
            quantity: 24,
            description: 'Professional 4-channel wireless microphone system with handheld and lavalier options for corporate events',
            supportingDocuments: [
              { id: 'doc_001', name: 'commercial_invoice.pdf', type: 'pdf', uploadDate: '2024-11-10' },
              { id: 'doc_002', name: 'packing_list.jpg', type: 'jpg', uploadDate: '2024-11-10' }
            ],
            createdAt: '2024-11-10T08:30:00Z',
            updatedAt: '2024-11-10T08:30:00Z'
          },
          {
            id: 'CI-2024-002',
            itemName: 'LED Spot Light Set',
            awbNumber: 'AWB-2024-002-CD',
            blNumber: 'BL-2024-002',
            location: 'Warehouse B-2',
            status: 'event',
            quantity: 18,
            description: 'Quad-color LED spot lights with DMX control for professional event lighting installations',
            supportingDocuments: [
              { id: 'doc_003', name: 'customs_declaration.pdf', type: 'pdf', uploadDate: '2024-11-12' }
            ],
            createdAt: '2024-11-12T10:15:00Z',
            updatedAt: '2024-11-12T10:15:00Z'
          },
          {
            id: 'CI-2024-003',
            itemName: 'Commercial Grade Folding Chairs',
            awbNumber: 'AWB-2024-003-EF',
            blNumber: 'BL-2024-003',
            location: 'Warehouse C-1',
            status: 'bc_pending',
            quantity: 150,
            description: 'Commercial grade steel frame folding chairs with vinyl upholstery for venue seating arrangements',
            supportingDocuments: [
              { id: 'doc_004', name: 'import_permit.pdf', type: 'pdf', uploadDate: '2024-11-13' },
              { id: 'doc_005', name: 'certificate_origin.jpg', type: 'jpg', uploadDate: '2024-11-13' }
            ],
            createdAt: '2024-11-13T14:20:00Z',
            updatedAt: '2024-11-13T14:20:00Z'
          },
          {
            id: 'CI-2024-004',
            itemName: '4K Professional Projector',
            awbNumber: 'AWB-2024-004-GH',
            blNumber: 'BL-2024-004',
            location: 'Bonded Zone Alpha',
            status: 'bc_approved',
            quantity: 8,
            description: 'High-resolution 4K laser projector for large venue presentations and corporate showcases',
            supportingDocuments: [
              { id: 'doc_006', name: 'export_license.pdf', type: 'pdf', uploadDate: '2024-11-13' }
            ],
            createdAt: '2024-11-13T16:45:00Z',
            updatedAt: '2024-11-13T16:45:00Z'
          },
          {
            id: 'CI-2024-005',
            itemName: 'Professional Sound Mixing Console',
            awbNumber: 'AWB-2024-005-IJ',
            blNumber: 'BL-2024-005',
            location: 'Warehouse A-1',
            status: 'warehouse',
            quantity: 6,
            description: '32-channel digital audio mixing console with built-in effects for professional concert and event sound management',
            supportingDocuments: [
              { id: 'doc_007', name: 'technical_specifications.pdf', type: 'pdf', uploadDate: '2024-11-14' },
              { id: 'doc_008', name: 'warranty_certificate.jpg', type: 'jpg', uploadDate: '2024-11-14' }
            ],
            createdAt: '2024-11-14T09:20:00Z',
            updatedAt: '2024-11-14T09:20:00Z'
          },
          {
            id: 'CI-2024-006',
            itemName: 'LED Video Wall Display Panels',
            awbNumber: 'AWB-2024-006-KL',
            blNumber: 'BL-2024-006',
            location: 'Soekarno-Hatta Airport',
            status: 'event',
            quantity: 32,
            description: 'High-resolution LED video wall panels for live event broadcasts and corporate presentation displays',
            supportingDocuments: [
              { id: 'doc_009', name: 'installation_manual.pdf', type: 'pdf', uploadDate: '2024-11-15' }
            ],
            createdAt: '2024-11-15T11:30:00Z',
            updatedAt: '2024-11-15T11:30:00Z'
          },
          {
            id: 'CI-2024-007',
            itemName: 'Professional Camera Equipment Set',
            awbNumber: 'AWB-2024-007-MN',
            blNumber: 'BL-2024-007',
            location: 'Warehouse B-2',
            status: 'bc_pending',
            quantity: 12,
            description: 'Complete professional camera kit with 4K broadcast cameras, lenses, tripods, and lighting equipment for corporate video production',
            supportingDocuments: [
              { id: 'doc_010', name: 'equipment_list.pdf', type: 'pdf', uploadDate: '2024-11-15' },
              { id: 'doc_011', name: 'import_license.pdf', type: 'pdf', uploadDate: '2024-11-15' },
              { id: 'doc_012', name: 'quality_certificate.jpg', type: 'jpg', uploadDate: '2024-11-15' }
            ],
            createdAt: '2024-11-15T14:45:00Z',
            updatedAt: '2024-11-15T14:45:00Z'
          },
          {
            id: 'CI-2024-008',
            itemName: 'Stage Lighting Control System',
            awbNumber: 'AWB-2024-008-OP',
            blNumber: 'BL-2024-008',
            location: 'Bonded Zone Beta',
            status: 'bc_approved',
            quantity: 15,
            description: 'Advanced digital lighting control system with DMX connectivity for theatrical and concert venue installations',
            supportingDocuments: [
              { id: 'doc_013', name: 'control_software.pdf', type: 'pdf', uploadDate: '2024-11-16' },
              { id: 'doc_014', name: 'safety_certification.pdf', type: 'pdf', uploadDate: '2024-11-16' }
            ],
            createdAt: '2024-11-16T10:15:00Z',
            updatedAt: '2024-11-16T10:15:00Z'
          },
          {
            id: 'CI-2024-009',
            itemName: 'Professional Audio Recording Studio Set',
            awbNumber: 'AWB-2024-009-QR',
            blNumber: 'BL-2024-009',
            location: 'Changi Airport',
            status: 'bc_rejected',
            quantity: 8,
            description: 'Complete recording studio equipment including microphones, audio interfaces, monitors, and acoustic treatment for corporate audio production',
            supportingDocuments: [
              { id: 'doc_015', name: 'studio_layout_plan.pdf', type: 'pdf', uploadDate: '2024-11-16' },
              { id: 'doc_016', name: 'electrical_specifications.jpg', type: 'jpg', uploadDate: '2024-11-16' }
            ],
            createdAt: '2024-11-16T13:30:00Z',
            updatedAt: '2024-11-16T13:30:00Z'
          }
        ];

        warehouseDataService.saveCustomsItems(sampleItems);
        setCustomsItems(sampleItems);
      } else {
        setCustomsItems(customsItems);
      }

    } catch (error) {
      console.error('Error loading customs items data:', error);
      notificationService.showError('Failed to load customs items data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomsData();
  }, [loadCustomsData]);

  // Filter customs items
  const filteredItems = customsItems.filter(item => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.blNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get status color and label
  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  // Get document icon
  const getDocumentIcon = (type) => {
    return type === 'pdf' ? <PdfIcon /> : <ImageIcon />;
  };

  // Customs Item Form Dialog
  const CustomsItemFormDialog = ({ open, onClose, onSave, item, loading }) => {
    const [formData, setFormData] = useState(item || {
      itemName: '',
      awbNumber: '',
      blNumber: '',
      location: '',
      status: 'warehouse',
      quantity: 1,
      description: '',
      supportingDocuments: [],
      // TPPB / Customs fields for consistency with Inventory form
      tppb_number: '',
      tppb_date_start: '',
      tppb_date_end: '',
      hs_code: '',
      manifest_number: '',
      manifest_line_no: '',
      approval_by: '',
      approval_date: '',
      approval_status: 'pending',
      country_of_origin: '',
      export_destination: '',
      tppb_custodian: '',
      tppb_contact: '',
      fob_value: 0,
      cif_value: 0,
      condition: 'baik',
      qty_condition_breakdown: ''
    });

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleSave = async () => {
      const itemData = {
        ...formData,
        supportingDocuments: [...formData.supportingDocuments, ...uploadedFiles]
      };
      await onSave(itemData);
      setDialogOpen(false);
      setUploadedFiles([]);
    };

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files);
      const validFiles = files.filter(file =>
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg'
      );

      const newDocuments = validFiles.map(file => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type === 'application/pdf' ? 'pdf' : 'jpg',
        uploadDate: new Date().toISOString().split('T')[0],
        file: file // Store the actual file for processing
      }));

      setUploadedFiles(prev => [...prev, ...newDocuments]);
    };

    const removeUploadedFile = (index) => {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {item ? 'Edit Customs Item' : 'Add New Customs Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.itemName}
                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="AWB Number"
                value={formData.awbNumber}
                onChange={(e) => setFormData({...formData, awbNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="BL Number"
                value={formData.blNumber}
                onChange={(e) => setFormData({...formData, blNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  label="Location"
                >
                  {locationOptions.map(location => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  label="Status"
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Grid>

            {/* TPPB / Customs Extra Fields for consistency */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>TPPB / Customs Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="TPPB Number"
                value={formData.tppb_number}
                onChange={(e) => setFormData({...formData, tppb_number: e.target.value})}
                placeholder="e.g., TPPB-2025-00001"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HS Code"
                value={formData.hs_code}
                onChange={(e) => setFormData({...formData, hs_code: e.target.value})}
                placeholder="e.g., 3916.90.20"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manifest Number"
                value={formData.manifest_number}
                onChange={(e) => setFormData({...formData, manifest_number: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manifest Line No"
                value={formData.manifest_line_no}
                onChange={(e) => setFormData({...formData, manifest_line_no: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  label="Condition"
                >
                  <MenuItem value="baik">Baik</MenuItem>
                  <MenuItem value="rusak">Rusak</MenuItem>
                  <MenuItem value="cacat">Cacat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Approval Status</InputLabel>
                <Select
                  value={formData.approval_status}
                  onChange={(e) => setFormData({...formData, approval_status: e.target.value})}
                  label="Approval Status"
                >
                  <MenuItem value="pending">pending</MenuItem>
                  <MenuItem value="approved">approved</MenuItem>
                  <MenuItem value="rejected">rejected</MenuItem>
                  <MenuItem value="for_inspection">for_inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Country of Origin" value={formData.country_of_origin} onChange={(e) => setFormData({...formData, country_of_origin: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Export Destination" value={formData.export_destination} onChange={(e) => setFormData({...formData, export_destination: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="FOB Value" type="number" value={formData.fob_value} onChange={(e) => setFormData({...formData, fob_value: Number(e.target.value || 0)})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="CIF Value" type="number" value={formData.cif_value} onChange={(e) => setFormData({...formData, cif_value: Number(e.target.value || 0)})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Qty Condition Breakdown" value={formData.qty_condition_breakdown} onChange={(e) => setFormData({...formData, qty_condition_breakdown: e.target.value})} placeholder="e.g., 90 baik, 8 rusak, 2 cacat" />
            </Grid>

            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Supporting Documents (PDF/JPG)
              </Typography>
              <input
                accept=".pdf,.jpg,.jpeg"
                style={{ display: 'none' }}
                id="document-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Documents
                </Button>
              </label>

              {/* Existing Documents */}
              {formData.supportingDocuments?.map((doc, index) => (
                <Box key={doc.id} display="flex" alignItems="center" gap={1} mb={1}>
                  {getDocumentIcon(doc.type)}
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{doc.name}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                    ({doc.uploadDate})
                  </Typography>
                </Box>
              ))}

              {/* Uploaded Files */}
              {uploadedFiles.map((file, index) => (
                <Box key={file.id} display="flex" alignItems="center" gap={1} mb={1}>
                  {getDocumentIcon(file.type)}
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{file.name}</Typography>
                  <IconButton size="small" onClick={() => removeUploadedFile(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.itemName || !formData.description}
          >
            {loading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Handle save customs item
  const handleSaveItem = async (itemData) => {
    try {
      const currentItems = warehouseDataService.getCustomsItems();

      if (selectedItem) {
        // Update existing item
        const updatedItems = currentItems.map(item =>
          item.id === selectedItem.id ? {
            ...item,
            ...itemData,
            updatedAt: new Date().toISOString()
          } : item
        );
        warehouseDataService.saveCustomsItems(updatedItems);
        notificationService.showSuccess('Customs item updated successfully');
      } else {
        // Add new item
        const newItem = {
          ...itemData,
          id: `CI-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        warehouseDataService.saveCustomsItems([...currentItems, newItem]);
        notificationService.showSuccess('Customs item added successfully');
      }
      loadCustomsData();
    } catch (error) {
      console.error('Error saving customs item:', error);
      notificationService.showError('Failed to save customs item');
    }
  };

  return (
    <Box>
      <BridgeHeader
        title="Bea Cukai Portal"
        subtitle="BridGe Warehouse Management - Customs Item Data & Documentation"
        actions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedItem(null);
              setDialogOpen(true);
            }}
            sx={{ py: 1.5, px: 3 }}
          >
            Add Customs Item
          </Button>
        )}
      />

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Total Items" value={customsItems.length} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Warehouse Items" value={customsItems.filter(item => item.status === 'warehouse').length} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="Event Items" value={customsItems.filter(item => item.status === 'event').length} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BridgeStatCard title="BC Approved" value={customsItems.filter(item => item.status === 'bc_approved').length} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Bea Cukai Portal:</strong> Focused customs item data management with AWB/BL tracking,
        location monitoring, status updates, and supporting document management for efficient customs processing.
      </Alert>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search items..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Location</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              label="Filter by Location"
            >
              <MenuItem value="all">All Locations</MenuItem>
              {locationOptions.map(location => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Customs Items Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Item Name</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>AWB</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>BL</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Location</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Status</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Quantity</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Description</Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Documents</Typography>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'inherit', fontWeight: 'bold' }}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.04)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {item.itemName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {item.awbNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {item.blNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.location}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={statusInfo.label}
                      size="small"
                      color={statusInfo.color}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2, maxWidth: 250 }}>
                    <Typography variant="body2" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {item.supportingDocuments?.slice(0, 2).map((doc, index) => (
                        <Tooltip key={doc.id} title={`${doc.name} (${doc.uploadDate})`}>
                          <Box display="flex" alignItems="center">
                            {getDocumentIcon(doc.type)}
                          </Box>
                        </Tooltip>
                      ))}
                      {item.supportingDocuments?.length > 2 && (
                        <Typography variant="body2" color="textSecondary">
                          +{item.supportingDocuments.length - 2}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedItem(item);
                        setDialogOpen(true);
                      }}
                      sx={{
                        color: 'secondary.main',
                        '&:hover': { backgroundColor: 'rgba(118, 75, 162, 0.1)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'rgba(103, 126, 234, 0.1)' }
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    No customs items found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <CustomsItemFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem}
        loading={loading}
      />
    </Box>
  );
};

export default BRidgeCustomsPortal;
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { initializeSampleData } from './services/localStorage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#d63031', marginBottom: '16px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#636e72', marginBottom: '16px' }}>
            The application encountered an unexpected error. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0984e3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ color: '#d63031', cursor: 'pointer' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    LocalShipping as ShippingIcon,
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    Assessment as AssessmentIcon,
    Business as BusinessIcon,
    AccountBalance as AccountBalanceIcon,
    Analytics as AnalyticsIcon,
    ShoppingCart as PurchaseIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    Category as CategoryIcon,
    Inventory as InventoryIcon,
    TrackChanges as CourierIcon,
    Schedule as ScheduleIcon,
    AccountBalanceWallet as FinanceIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Description as DescriptionIcon,
    TrendingDown as TrendingDownIcon,
    Storage as StorageIcon,
  } from '@mui/icons-material';

// Components
import Dashboard from './components/Dashboard';
import BRidge from './components/BRidge';
import CustomerManagement from './components/CustomerManagement';
import Quotation from './components/Quotation';
import QuotationApproval from './components/Quotation-Approval';
import BRidgeQuotationEvent from './components/BRidgeQuotationEvent';
import OperationalCost from './components/OperationalCost';
import ShippingManagement from './components/ShippingManagement';
import VendorManagement from './components/VendorManagement';
import PurchaseOrder from './components/PurchaseOrder';
import FinanceReporting from './components/FinanceReporting';
import Analytics from './components/Analytics';
import CourierManagement from './components/CourierManagement';
import ProfitLossReport from './components/ProfitLossReport';
import BalanceSheetReport from './components/BalanceSheetReport';
import CashFlowReport from './components/CashFlowReport';
import AgingReport from './components/AgingReport';

// B-ridge Components
import BRidgeDashboard from './components/BRidgeDashboard';
import BLINKDashboard from './components/BLINKDashboard';
import BIGDashboard from './components/BIGDashboard';
import BRidgeCustomerManagement from './components/BRidgeCustomerManagement';
import BRidgeInventoryManagement from './components/BRidgeInventoryManagement';
import BRidgeAccountingLedger from './components/BRidgeAccountingLedger';
import CustomsPortalMenuDemo from './components/CustomsPortalMenuDemo';

import BRidgeCustomsPortal from './components/BRidgeCustomsPortal';
import BRidgeKepabeanan from './components/BRidgeKepabeanan';
import InboundReport from './components/kepabeanan/InboundReport';
import OutboundReport from './components/kepabeanan/OutboundReport';
import WipReport from './components/kepabeanan/WipReport';
import MutasiBahanReport from './components/kepabeanan/MutasiBahanReport';
import MutasiProdukReport from './components/kepabeanan/MutasiProdukReport';
import MutasiAssetReport from './components/kepabeanan/MutasiAssetReport';
import RejectReport from './components/kepabeanan/RejectReport';
import WarehouseManagement from './components/WarehouseManagement';
import InventoryManagement from './components/InventoryManagement';
import SalesOrderManagement from './components/SalesOrderManagement';
import SalesOrderManagementApproval from './components/SalesOrderManagement-Approval';

// Import OperationalCost component (defined in Quotation.js)

const drawerWidth = 280;

const menuItems = [
  // Main Dashboard
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', category: 'main' },

  // BRiDGE - Warehouse Management Suite (FREIGHT FORWARDING CORE MODULE)
  { text: 'BridGe - Warehouse Management', icon: <InventoryIcon />, path: '/bridge', category: 'bridge', isParent: true },
  { text: 'Customer Management', icon: <PeopleIcon />, path: '/bridge/customer', category: 'bridge' },
  { text: 'Warehouse Management', icon: <InventoryIcon />, path: '/bridge/warehouse', category: 'bridge' },
  { text: 'Inventory Management', icon: <CategoryIcon />, path: '/bridge/inventory', category: 'bridge' },
  { text: 'Quotation Management', icon: <MoneyIcon />, path: '/bridge/quotation', category: 'bridge' },
  { text: 'Sales Order Management', icon: <AssignmentIcon />, path: '/bridge/enhanced-sales-order', category: 'bridge' },
  { text: 'Accounting Ledger', icon: <AccountBalanceIcon />, path: '/bridge/accounting', category: 'bridge' },
  { text: 'Kepabeanan', icon: <WarningIcon />, path: '/bridge/kepabeanan', category: 'bridge' },

  // BLiNK - Freight & Forwarder (OPERATIONS MODULE)
  { text: 'BlinK - Freight & Forward Management', icon: <TrendingUpIcon />, path: '/blink', category: 'blink', isParent: true },
  { text: 'Customer Management', icon: <PeopleIcon />, path: '/blink/customer', category: 'blink' },
  { text: 'Vendor Management', icon: <BusinessIcon />, path: '/blink/vendor', category: 'blink' },
  { text: 'Quotation Management', icon: <MoneyIcon />, path: '/blink/quotation', category: 'blink' },
  { text: 'Sales Order Management', icon: <AssignmentIcon />, path: '/blink/enhanced-sales-order', category: 'blink' },
  { text: 'Operation Management', icon: <ShippingIcon />, path: '/blink/operation', category: 'blink' },
  { text: 'Accounting Management', icon: <AccountBalanceIcon />, path: '/blink/accounting', category: 'blink' },

  // BiG - Event Management
  { text: 'BiG - Event Management', icon: <BusinessIcon />, path: '/big', category: 'big', isParent: true },
  { text: 'Customer Management', icon: <PeopleIcon />, path: '/big/customer', category: 'big' },
  { text: 'Vendor Management', icon: <BusinessIcon />, path: '/big/vendor', category: 'big' },
  { text: 'Quotation Management', icon: <MoneyIcon />, path: '/big/quotation', category: 'big' },
  { text: 'Sales Order Management', icon: <AssignmentIcon />, path: '/big/enhanced-sales-order', category: 'big' },
  { text: 'Accounting Management', icon: <AccountBalanceIcon />, path: '/big/accounting', category: 'big' },
  { text: 'Timeline Management', icon: <ScheduleIcon />, path: '/big/timeline', category: 'big' },

  // Reports (Standalone)
  { text: 'Financial Reports', icon: <AssessmentIcon />, path: '/financial-reports', category: 'reports' },
  { text: 'Analytics & Insights', icon: <AnalyticsIcon />, path: '/analytics', category: 'reports' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({}); // Track expanded submenu
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let initialized = false;

    // Initialize sample data on app start with delay to prevent blocking
    const initTimer = setTimeout(() => {
      if (!initialized) {
        try {
          initialized = true;
          initializeSampleData();
        } catch (error) {
          console.error('Error initializing sample data:', error);
          // Continue with the app even if sample data initialization fails
        }
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSubmenuToggle = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Bakhtera 1
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => {
          const prevCategory = index > 0 ? menuItems[index - 1].category : null;
          const showDivider = prevCategory && prevCategory !== item.category && !item.isHeader;

          // Special handling for Kepabeanan menu
          if (item.text === 'Kepabeanan' && item.category === 'bridge') {
            const isExpanded = expandedMenus['kepabeanan'];
            const kepabeananSubmenus = [
              { label: 'Laporan Pemasukan Barang', path: '/bridge/kepabeanan/inbound', icon: <DescriptionIcon /> },
              { label: 'Laporan Pengeluaran Barang', path: '/bridge/kepabeanan/outbound', icon: <TrendingDownIcon /> },
              { label: 'Laporan Posisi WIP', path: '/bridge/kepabeanan/wip', icon: <StorageIcon /> },
              { label: 'Laporan Mutasi Bahan Baku', path: '/bridge/kepabeanan/mutasi_bahan', icon: <DescriptionIcon /> },
              { label: 'Laporan Mutasi Barang Jadi', path: '/bridge/kepabeanan/mutasi_produk', icon: <DescriptionIcon /> },
              { label: 'Laporan Mutasi Mesin', path: '/bridge/kepabeanan/mutasi_asset', icon: <DescriptionIcon /> },
              { label: 'Laporan Barang Reject/Scrap', path: '/bridge/kepabeanan/reject', icon: <WarningIcon /> },
            ];

            return (
              <React.Fragment key={item.text}>
                {showDivider && <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />}
                
                {/* Kepabeanan Parent Menu - Collapsible */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSubmenuToggle('kepabeanan')}
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: 'rgba(63, 81, 181, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: 'bold',
                          fontSize: '1.0rem',
                          color: 'white',
                          lineHeight: 1.3
                        }
                      }}
                    />
                    {isExpanded ? <ExpandLessIcon sx={{ color: 'white' }} /> : <ExpandMoreIcon sx={{ color: 'white' }} />}
                  </ListItemButton>
                </ListItem>

                {/* Kepabeanan Submenu Items */}
                {isExpanded && kepabeananSubmenus.map((submenu) => (
                  <ListItem key={submenu.path} disablePadding>
                    <ListItemButton
                      selected={location.pathname === submenu.path}
                      onClick={() => handleMenuClick(submenu.path)}
                      sx={{
                        pl: 6,
                        py: 1.2,
                        borderLeft: location.pathname === submenu.path ? '3px solid #fff' : '3px solid transparent',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {submenu.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={submenu.label}
                        sx={{
                          '& .MuiTypography-root': {
                            fontSize: '0.85rem',
                            fontWeight: 'normal',
                            color: 'white'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={item.text}>
              {showDivider && <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />}
              
              {/* Parent Menu Items (Clickable with Dashboard Navigation) */}
              {item.isParent && (
                <ListItem disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: 'rgba(63, 81, 181, 0.1)',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: 'bold',
                          fontSize: '1.0rem',
                          color: 'white',
                          lineHeight: 1.3
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
              
              {/* Child Menu Items with Proper Indentation */}
              {!item.isParent && (
                <ListItem disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{
                      pl: 6, // Consistent indentation for all child items
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '0.9rem',
                          fontWeight: 'normal',
                          color: 'white'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Bakhtera 1 - Freight Forwarding Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Routes>
           <Route path="/" element={<Dashboard />} />
           
           {/* BLINK Module Routes */}
           <Route path="/blink" element={<BLINKDashboard />} />
           <Route path="/blink/customer" element={<BRidgeCustomerManagement />} />
           <Route path="/blink/quotation" element={<QuotationApproval />} />
           <Route path="/blink/enhanced-sales-order" element={<SalesOrderManagementApproval />} />
           <Route path="/blink/operation" element={<ShippingManagement />} />
           <Route path="/blink/accounting" element={<BRidgeAccountingLedger />} />
           
           {/* BRiDGE Module Routes */}
           <Route path="/bridge" element={<BRidgeDashboard />} />
           <Route path="/bridge/customer" element={<BRidgeCustomerManagement />} />
           <Route path="/bridge/warehouse" element={<WarehouseManagement />} />
           <Route path="/bridge/inventory" element={<InventoryManagement />} />
           <Route path="/bridge/quotation" element={<BRidgeQuotationEvent />} />
           <Route path="/bridge/quotation-approval" element={<QuotationApproval />} />
           <Route path="/bridge/sales-order" element={<SalesOrderManagementApproval />} />
           <Route path="/bridge/enhanced-sales-order" element={<SalesOrderManagementApproval />} />
           <Route path="/bridge/customs-menu-demo" element={<CustomsPortalMenuDemo />} />

           <Route path="/bridge/accounting" element={<BRidgeAccountingLedger />} />
           <Route path="/bridge/kepabeanan" element={<BRidgeKepabeanan />} />
           <Route path="/bridge/kepabeanan/inbound" element={<InboundReport />} />
           <Route path="/bridge/kepabeanan/outbound" element={<OutboundReport />} />
           <Route path="/bridge/kepabeanan/wip" element={<WipReport />} />
           <Route path="/bridge/kepabeanan/mutasi_bahan" element={<MutasiBahanReport />} />
           <Route path="/bridge/kepabeanan/mutasi_produk" element={<MutasiProdukReport />} />
           <Route path="/bridge/kepabeanan/mutasi_asset" element={<MutasiAssetReport />} />
           <Route path="/bridge/kepabeanan/reject" element={<RejectReport />} />
           
           {/* BIG Module Routes */}
           <Route path="/big" element={<BIGDashboard />} />
           <Route path="/big/customer" element={<BRidgeCustomerManagement />} />
           <Route path="/big/quotation" element={<QuotationApproval />} />
           <Route path="/big/enhanced-sales-order" element={<SalesOrderManagementApproval />} />
           <Route path="/big/accounting" element={<BRidgeAccountingLedger />} />
           <Route path="/big/timeline" element={<Analytics />} />
           
           {/* Reports */}
           <Route path="/financial-reports" element={<FinanceReporting />} />
           <Route path="/analytics" element={<Analytics />} />
         </Routes>
      </Box>
   </Box>
 );
}

// Wrap App with Error Boundary only (Router is in index.js)
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
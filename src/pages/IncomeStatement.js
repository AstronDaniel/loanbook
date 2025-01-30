import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Zoom,
  Stack,
  Divider,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Printer,
  FileSpreadsheet,
  Edit as EditIcon,
  Save as SaveIcon,
  PieChart,
  BarChart as BarChartIcon,
  Table as TableIcon,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';

const IncomeStatementDashboard = () => {
  const initialFinancialData = {
    revenue: {
      'Interest from customers': [12025083, 14445100, 15751875],
      'Bank Interest': [18350, 35628, 35440],
      'Interest charged on Bad Debtors Recovered': [0, 0, 0],
      'Bad Debtors Recovered': [0, 0, 0]
    },
    expenses: {
      'Service Charge': [-2875, -2875, -2875],
      'Withdraw charges': [-68900, -43000, -10350],
      'Bad Debtors Written Off': [0, 0, 0],
      'Transport': [0, 0, 0],
      'Transfer fees': [0, 0, 0],
      'Annual debit card fee': [0, 0, 0],
      'Withholding Tax': [-2752, -8612, -5316],
      'Airtime and Data': [0, 0, -800000]
    }
  };

  const months = ['Jan-24', 'Feb-24', 'Mar-24'];
  const [financialData, setFinancialData] = useState(initialFinancialData);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editableItem, setEditableItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calculate totals
  const calculateTotals = (data) => {
    const totals = {
      'Total Revenue Generated': months.map((_, idx) => 
        Object.values(data.revenue).reduce((sum, values) => sum + values[idx], 0)
      ),
      'Total Expenses': months.map((_, idx) => 
        Object.values(data.expenses).reduce((sum, values) => sum + values[idx], 0)
      )
    };
    
    totals['Net Profit'] = months.map((_, idx) => 
      totals['Total Revenue Generated'][idx] + totals['Total Expenses'][idx]
    );
    
    totals['Distribution to Shareholders'] = totals['Net Profit'].map(profit => -profit * 0.45);
    
    totals['Retained Earning'] = months.map((_, idx) => 
      totals['Net Profit'][idx] + totals['Distribution to Shareholders'][idx]
    );
    
    return totals;
  };

  const totals = calculateTotals(financialData);

  const handleValueEdit = (category, item, monthIndex, currentValue) => {
    setEditableItem({
      category,
      item,
      monthIndex,
      currentValue: Math.abs(currentValue), // Always show positive value in input
      month: months[monthIndex],
      newValue: Math.abs(currentValue)
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = (newValue) => {
    const { category, item, monthIndex } = editableItem;
    const updatedData = {
      ...financialData,
      [category]: {
        ...financialData[category],
        [item]: financialData[category][item].map((val, idx) => 
          idx === monthIndex ? newValue : val
        )
      }
    };
    
    setFinancialData(updatedData);
    setSnackbar({
      open: true,
      message: 'Value updated successfully',
      severity: 'success'
    });
  };

  // Chart data preparation
  const chartData = months.map((month, idx) => ({
    name: month,
    revenue: totals['Total Revenue Generated'][idx],
    expenses: Math.abs(totals['Total Expenses'][idx]),
    profit: totals['Net Profit'][idx]
  }));

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card 
        sx={{ 
          height: '100%', 
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8]
          },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: `linear-gradient(45deg, transparent, ${color}15)`,
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }}
        />
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {title}
              </Typography>
              <Box
                sx={{
                  backgroundColor: `${color}15`,
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={24} color={color} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UGX',
                maximumFractionDigits: 0
              }).format(value)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {change > 0 ? (
                <ArrowUpRight color={color} size={20} />
              ) : (
                <ArrowDownRight color={color} size={20} />
              )}
              <Typography
                variant="body2"
                sx={{ color, fontWeight: 500 }}
              >
                {Math.abs(change).toFixed(1)}% from last month
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );

  const EditValueDialog = () => {
    const [localValue, setLocalValue] = useState(editableItem?.newValue?.toLocaleString() || '');

    useEffect(() => {
      setLocalValue(editableItem?.newValue?.toLocaleString() || '');
    }, [editableItem]);

    const handleSave = () => {
      const finalValue = parseInt(localValue.replace(/,/g, ''), 10); // Remove commas for parsing
      const newValue = editableItem.category === 'expenses' ? -Math.abs(finalValue) : Math.abs(finalValue);

      handleEditSave(newValue); // Pass the new value to handleEditSave
      setEditDialogOpen(false);
    };

    return (
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        TransitionComponent={Fade}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.default'
        }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Edit {editableItem?.item}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update the value for {editableItem?.month}
            </Typography>
          </Stack>
          <IconButton 
            onClick={() => setEditDialogOpen(false)} 
            sx={{ 
              '&:hover': { 
                bgcolor: 'error.lighter',
                color: 'error.main'
              }
            }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Value"
            type="text"
            value={localValue}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  UGX
                </InputAdornment>
              ),
              inputProps: {
                onFocus: (e) => e.target.select() // Select the text on focus
              }
            }}
            onChange={(e) => {
              // Allow only numbers and commas
              const value = e.target.value.replace(/[^0-9,]/g, '');
              setLocalValue(value);
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Enter the value without currency symbol
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            startIcon={<X size={18} />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'error.lighter', color: 'error.main' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Check size={18} />}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              px: 3
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              Income Statement
            </Typography>
            <Typography color="text.secondary">
              Financial performance overview for {months[selectedMonth]}
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Total Revenue"
                value={totals['Total Revenue Generated'][selectedMonth]}
                change={5.2}
                icon={TrendingUp}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Total Expenses"
                value={Math.abs(totals['Total Expenses'][selectedMonth])}
                change={-2.1}
                icon={TrendingDown}
                color="#f44336"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Net Profit"
                value={totals['Net Profit'][selectedMonth]}
                change={7.8}
                icon={BarChartIcon}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard
                title="Retained Earnings"
                value={totals['Retained Earning'][selectedMonth]}
                change={3.4}
                icon={PieChart}
                color="#ff9800"
              />
            </Grid>
          </Grid>

          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                pt: 2
              }}
            >
              <Tab 
                icon={<TableIcon size={18} />} 
                label="Statement" 
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab 
                icon={<BarChartIcon size={18} />} 
                label="Analysis" 
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            </Tabs>

            <Box hidden={activeTab !== 0} sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                      {months.map(month => (
                        <TableCell key={month} align="right" sx={{ fontWeight: 600 }}>
                          {month}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Revenue Section */}
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        sx={{ 
                          bgcolor: 'primary.lighter',
                          color: 'primary.dark',
                          fontWeight: 600 
                        }}
                      >
                        Revenue
                      </TableCell>
                    </TableRow>
                    {Object.entries(financialData.revenue).map(([item, values]) => (
                      <TableRow 
                        key={item}
                        hover
                        sx={{ 
                          '&:hover': { 
                            '& .edit-button': { opacity: 1 }
                          }
                        }}
                      >
                        <TableCell>{item}</TableCell>
                        {values.map((value, idx) => (
                          <TableCell 
                            key={idx} 
                            align="right"
                            onClick={() => handleValueEdit('revenue', item, idx, value)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              {value.toLocaleString()}
                              <EditIcon 
                                size={16} 
                                className="edit-button" 
                                style={{ opacity: 0, transition: 'opacity 0.2s' }}
                              />
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                    {/* Expenses Section */}
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        sx={{ 
                          bgcolor: 'error.lighter',
                          color: 'error.dark',
                          fontWeight: 600 
                        }}
                      >
                        Expenses
                      </TableCell>
                    </TableRow>
                    {Object.entries(financialData.expenses).map(([item, values]) => (
                      <TableRow 
                        key={item}
                        hover
                        sx={{ 
                          '&:hover': { 
                            '& .edit-button': { opacity: 1 }
                          }
                        }}
                      >
                        <TableCell>{item}</TableCell>
                        {values.map((value, idx) => (
                          <TableCell 
                            key={idx} 
                            align="right"
                            onClick={() => handleValueEdit('expenses', item, idx, value)}
                            sx={{ 
                              cursor: 'pointer',
                              color: value < 0 ? 'error.main' : 'inherit',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              {value.toLocaleString()}
                              <EditIcon 
                                size={16} 
                                className="edit-button" 
                                style={{ opacity: 0, transition: 'opacity 0.2s' }}
                              />
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                    {/* Totals Section */}
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        sx={{ 
                          bgcolor: 'grey.100',
                          fontWeight: 600 
                        }}
                      >
                        Summary
                      </TableCell>
                    </TableRow>
                    {Object.entries(totals).map(([item, values]) => (
                      <TableRow 
                        key={item} 
                        sx={{ 
                          bgcolor: 'grey.50',
                          '&:last-child td': { fontWeight: 600 }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{item}</TableCell>
                        {values.map((value, idx) => (
                          <TableCell 
                            key={idx} 
                            align="right"
                            sx={{ 
                              color: value < 0 ? 'error.main' : 'success.main',
                              fontWeight: 500
                            }}
                          >
                            {value.toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Analysis View */}
            <Box hidden={activeTab !== 1} sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue vs Expenses Trend
                      </Typography>
                      <Box sx={{ height: 400, mt: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis 
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#ccc' }}
                              tickFormatter={(value) => 
                                new Intl.NumberFormat('en-US', {
                                  notation: 'compact',
                                  compactDisplay: 'short'
                                }).format(value)
                              }
                            />
                            <RechartsTooltip 
                              formatter={(value) => 
                                new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'UGX',
                                  maximumFractionDigits: 0
                                }).format(value)
                              }
                            />
                            <Bar 
                              dataKey="revenue" 
                              name="Revenue" 
                              fill="#2196f3"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="expenses" 
                              name="Expenses" 
                              fill="#f44336"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="profit" 
                              name="Net Profit" 
                              fill="#4caf50"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Profit Trend
                      </Typography>
                      <Box sx={{ height: 300, mt: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#ccc' }}
                            />
                            <YAxis 
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#ccc' }}
                              tickFormatter={(value) => 
                                new Intl.NumberFormat('en-US', {
                                  notation: 'compact',
                                  compactDisplay: 'short'
                                }).format(value)
                              }
                            />
                            <RechartsTooltip 
                              formatter={(value) => 
                                new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'UGX',
                                  maximumFractionDigits: 0
                                }).format(value)
                              }
                            />
                            <Line 
                              type="monotone" 
                              dataKey="profit" 
                              stroke="#4caf50" 
                              strokeWidth={3}
                              dot={{ 
                                r: 6, 
                                fill: '#4caf50',
                                strokeWidth: 2,
                                stroke: '#fff'
                              }}
                              activeDot={{ 
                                r: 8,
                                strokeWidth: 2,
                                stroke: '#fff'
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Printer size={20} />}
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileSpreadsheet size={20} />}
              onClick={() => {
                // Add export logic
              }}
            >
              Export to Excel
            </Button>
          </Box>
        </main>
      </div>

      {/* Edit Dialog */}
      <EditValueDialog />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default IncomeStatementDashboard;
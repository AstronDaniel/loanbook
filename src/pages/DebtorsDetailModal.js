import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  TableContainer,
  Fade,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase"; // Adjust the path as necessary

const db = getFirestore(app);

const DebtorDetailModal = ({ open, onClose, debtor, onUpdateDebtor }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [newPayment, setNewPayment] = useState({
    principalPaid: "",
    interestPaid: "",
    principalAdvance: "",
    interestCharge: "",
  });
  const [editRecord, setEditRecord] = useState(null);
  const [loanDueDate, setLoanDueDate] = useState(null);

  useEffect(() => {
    if (debtor) {
      setSelectedDate(new Date());
      resetForm();
    }
  }, [debtor?.id]);

  useEffect(() => {
    const fetchLoanDueDate = async () => {
      if (debtor?.loanId) {
        const loanDoc = await getDoc(doc(db, "loans", debtor.loanId));
        if (loanDoc.exists()) {
          setLoanDueDate(loanDoc.data().dueDate);
        }
      }
    };

    fetchLoanDueDate();
  }, [debtor?.loanId]);

  const resetForm = () => {
    setNewPayment({
      principalPaid: "",
      interestPaid: "",
      principalAdvance: "",
      interestCharge: "",
    });
    setActiveTab(0);
  };

  const validateTransaction = () => {
    const errors = [];

    if (!Object.values(newPayment).some((val) => val !== "")) {
      errors.push("Please enter at least one value");
    }

    // Only check date constraints if we have records
    if (debtor?.monthlyRecords?.length > 0) {
      // Temporarily ignore this validation
      // const firstRecordDate = new Date(debtor.monthlyRecords[0].date);
      // if (selectedDate && isBefore(selectedDate, firstRecordDate)) {
      //   errors.push('Transaction date cannot be before the first record');
      // }
    }

    if (selectedDate && isAfter(selectedDate, new Date())) {
      errors.push("Transaction date cannot be in the future");
    }

    return errors;
  };

  const handleNewPayment = async () => {
    const errors = validateTransaction();
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors[0],
        severity: "error",
      });
      return;
    }

    let newRecord;
    try {
      setLoading(true);
      setTransactionInProgress(true);
      // Replace this part in handleNewPayment:
      const lastRecord =
        debtor.monthlyRecords[debtor.monthlyRecords.length - 1];

      // With this:
      // First, sort the existing records by date
      const sortedRecords = [...debtor.monthlyRecords].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Find the record that comes immediately before the selected date
      const previousRecord = sortedRecords
        .filter((record) => isBefore(new Date(record.date), selectedDate))
        .pop();

      // If no previous record exists, use the last record
      const referenceRecord =
        previousRecord || sortedRecords[sortedRecords.length - 1];

      // Then use referenceRecord instead of lastRecord
      newRecord = {
        id: Date.now(),
        date: format(selectedDate, "yyyy-MM-dd"),
        month: format(selectedDate, "yyyy-MM"),
        openingPrinciple: referenceRecord.outstandingPrinciple,
        principleAdvance: Number(newPayment.principalAdvance) || 0,
        principlePaid: Number(newPayment.principalPaid) || 0,
        outstandingPrinciple:
          referenceRecord.outstandingPrinciple +
          (Number(newPayment.principalAdvance) || 0) -
          (Number(newPayment.principalPaid) || 0),
        openingInterest: referenceRecord.outstandingInterest,
        interestCharge: Number(newPayment.interestCharge) || 0,
        intrestPaid: Number(newPayment.interestPaid) || 0,
        outstandingInterest:
          referenceRecord.outstandingInterest +
          (Number(newPayment.interestCharge) || 0) -
          (Number(newPayment.interestPaid) || 0),
      };
      console.log("payment: ", newPayment, "Record: ", newRecord);
      // Sort records by date before adding new record
      const updatedRecords = [...debtor.monthlyRecords, newRecord].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const updatedDebtor = {
        ...debtor,
        monthlyRecords: updatedRecords,
        currentOpeningPrincipal: newRecord.outstandingPrinciple,
        currentOpeningInterest: newRecord.outstandingInterest,
        lastUpdated: new Date().toISOString(),
        status: newRecord.outstandingPrinciple === 0 && newRecord.outstandingInterest === 0
          ? 'completed'
          : new Date() > new Date(loanDueDate) && (newRecord.outstandingPrinciple > 0 || newRecord.outstandingInterest > 0)
          ? 'overdue'
          : debtor.status
      };

      await onUpdateDebtor(updatedDebtor);

      resetForm();
      setSnackbar({
        open: true,
        message: "Transaction added successfully",
        severity: "success",
      });

      // Auto-switch to Monthly Records tab to show the new transaction
      setTimeout(() => setActiveTab(1), 1000);
    } catch (error) {
      // Rollback the transaction by removing the new record
      const updatedRecords = debtor.monthlyRecords.filter(
        (record) => record.id !== newRecord.id
      );
      const lastRecord = updatedRecords[updatedRecords.length - 1];
      const updatedDebtor = {
        ...debtor,
        monthlyRecords: updatedRecords,
        currentOpeningPrincipal: lastRecord.outstandingPrinciple,
        currentOpeningInterest: lastRecord.outstandingInterest,
        lastUpdated: new Date().toISOString(),
      };

      await onUpdateDebtor(updatedDebtor);

      setSnackbar({
        open: true,
        message:
          "Error adding transaction: " + (error.message || "Unknown error"),
        severity: "error",
      });
    } finally {
      setLoading(false);
      setTransactionInProgress(false);
    }
  };

  const handleRollback = async () => {
    if (debtor.monthlyRecords.length <= 1) {
      setSnackbar({
        open: true,
        message: 'No transactions to roll back',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const updatedRecords = debtor.monthlyRecords.slice(0, -1);
      const lastRecord = updatedRecords[updatedRecords.length - 1];

      const updatedDebtor = {
        ...debtor,
        monthlyRecords: updatedRecords,
        currentOpeningPrincipal: lastRecord.outstandingPrinciple,
        currentOpeningInterest: lastRecord.outstandingInterest,
        lastUpdated: new Date().toISOString()
      };

      await onUpdateDebtor(updatedDebtor);

      setSnackbar({
        open: true,
        message: 'Transaction rolled back successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error rolling back transaction: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecordChange = (field, value) => {
    setEditRecord({ ...editRecord, [field]: value });
  };

  const handleSaveRecord = async () => {
    try {
      setLoading(true);
      const updatedRecords = debtor.monthlyRecords.map(record =>
        record.id === editRecord.id ? editRecord : record
      );

      const updatedDebtor = {
        ...debtor,
        monthlyRecords: updatedRecords,
        currentOpeningPrincipal: updatedRecords[updatedRecords.length - 1].outstandingPrinciple,
        currentOpeningInterest: updatedRecords[updatedRecords.length - 1].outstandingInterest,
        lastUpdated: new Date().toISOString(),
        status: updatedRecords[updatedRecords.length - 1].outstandingPrinciple === 0 && updatedRecords[updatedRecords.length - 1].outstandingInterest === 0
          ? 'completed'
          : new Date() > new Date(loanDueDate) && (updatedRecords[updatedRecords.length - 1].outstandingPrinciple > 0 || updatedRecords[updatedRecords.length - 1].outstandingInterest > 0)
          ? 'overdue'
          : debtor.status
      };

      await onUpdateDebtor(updatedDebtor);
      setEditRecord(null);
      setSnackbar({
        open: true,
        message: 'Record updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating record: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotals = () => {
    if (!debtor?.monthlyRecords)
      return {
        totalPrincipalPaid: 0,
        totalInterestPaid: 0,
        totalPrincipalAdvance: 0,
        totalInterestCharge: 0,
      };

    return debtor.monthlyRecords.reduce(
      (acc, record) => ({
        totalPrincipalPaid:
          acc.totalPrincipalPaid + (Number(record.principlePaid) || 0),
        totalInterestPaid:
          acc.totalInterestPaid + (Number(record.intrestPaid) || 0),
        totalPrincipalAdvance:
          acc.totalPrincipalAdvance + (Number(record.principleAdvance) || 0),
        totalInterestCharge:
          acc.totalInterestCharge + (Number(record.interestCharge) || 0),
      }),
      {
        totalPrincipalPaid: 0,
        totalInterestPaid: 0,
        totalPrincipalAdvance: 0,
        totalInterestCharge: 0,
      }
    );
  };

  const formatNumberWithCommas = (number) => {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePrincipalAdvanceChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    setNewPayment({ ...newPayment, principalAdvance: value });
  };

  const handlePrincipalPaidChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    setNewPayment({ ...newPayment, principalPaid: value });
  };

  const handleInterestChargeChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    setNewPayment({ ...newPayment, interestCharge: value });
  };

  const handleInterestPaidChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    setNewPayment({ ...newPayment, interestPaid: value });
  };

  if (!debtor) return null;

  const totals = calculateTotals();
  const chartData = debtor.monthlyRecords.map((record) => ({
    month: format(new Date(record.date), "MMM yyyy"),
    principal: record.outstandingPrinciple,
    interest: record.outstandingInterest,
  }));

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            bgcolor: theme.palette.primary.main,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">{debtor.customerName}</Typography>
            {loading && <CircularProgress size={20} sx={{ color: "white" }} />}
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{ px: 2 }}
            >
              <Tab label="Summary" />
              <Tab label="Monthly Records" />
              <Tab label="New Transaction" />
            </Tabs>
          </Box>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        color: "white",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Principal Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            Total Advanced
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(totals.totalPrincipalAdvance)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">Total Paid</Typography>
                          <Typography variant="h6">
                            {formatCurrency(totals.totalPrincipalPaid)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">Outstanding</Typography>
                          <Typography variant="h6">
                            {formatCurrency(debtor.currentOpeningPrincipal)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                        color: "white",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Interest Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2">Total Charged</Typography>
                          <Typography variant="h6">
                            {formatCurrency(totals.totalInterestCharge)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">Total Paid</Typography>
                          <Typography variant="h6">
                            {formatCurrency(totals.totalInterestPaid)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">Outstanding</Typography>
                          <Typography variant="h6">
                            {formatCurrency(debtor.currentOpeningInterest)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    height: isMobile ? 300 : 400,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("en", {
                            notation: "compact",
                            compactDisplay: "short",
                          }).format(value)
                        }
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{ fontSize: isMobile ? 12 : 14 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="principal"
                        stroke={theme.palette.primary.main}
                        name="Principal"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interest"
                        stroke={theme.palette.secondary.main}
                        name="Interest"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
            )}

            {activeTab === 1 && (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: isMobile ? "calc(100vh - 200px)" : 600,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Principal Advance</TableCell>
                      <TableCell align="right">Principal Paid</TableCell>
                      <TableCell align="right">Interest Charge</TableCell>
                      <TableCell align="right">Interest Paid</TableCell>
                      <TableCell align="right">Outstanding Principal</TableCell>
                      <TableCell align="right">Outstanding Interest</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...debtor.monthlyRecords].reverse().map((record) => (
                      <TableRow
                        key={record.id}
                        sx={{
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          {format(new Date(record.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.principleAdvance)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.principlePaid)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.interestCharge)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.intrestPaid)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.outstandingPrinciple)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(record.outstandingInterest)}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditRecord(record)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {editRecord && (
              <Dialog open={Boolean(editRecord)} onClose={() => setEditRecord(null)}>
                <DialogTitle>Edit Record</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Principal Advance"
                        type="text"
                        value={formatNumberWithCommas(editRecord.principleAdvance.toString())}
                        onChange={(e) => handleEditRecordChange('principleAdvance', e.target.value.replace(/,/g, ''))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Principal Paid"
                        type="text"
                        value={formatNumberWithCommas(editRecord.principlePaid.toString())}
                        onChange={(e) => handleEditRecordChange('principlePaid', e.target.value.replace(/,/g, ''))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Interest Charge"
                        type="text"
                        value={formatNumberWithCommas(editRecord.interestCharge.toString())}
                        onChange={(e) => handleEditRecordChange('interestCharge', e.target.value.replace(/,/g, ''))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Interest Paid"
                        type="text"
                        value={formatNumberWithCommas(editRecord.intrestPaid.toString())}
                        onChange={(e) => handleEditRecordChange('intrestPaid', e.target.value.replace(/,/g, ''))}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditRecord(null)} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRecord} color="primary">
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {activeTab === 2 && (
              <Box>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    mb: 3,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Transaction Date"
                          value={selectedDate}
                          onChange={(newDate) =>
                            setSelectedDate(newDate || new Date())
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={
                                (selectedDate &&
                                  isAfter(selectedDate, new Date())) ||
                                (debtor?.monthlyRecords?.length > 0 &&
                                  selectedDate &&
                                  isBefore(
                                    selectedDate,
                                    new Date(debtor.monthlyRecords[0].date)
                                  ))
                              }
                              helperText={
                                selectedDate &&
                                isAfter(selectedDate, new Date())
                                  ? "Date cannot be in the future"
                                  : debtor?.monthlyRecords?.length > 0 &&
                                    selectedDate &&
                                    isBefore(
                                      selectedDate,
                                      new Date(debtor.monthlyRecords[0].date)
                                    )
                                  ? "Date cannot be before the first record"
                                  : ""
                              }
                            />
                          )}
                          // maxDate={new Date()}
                          // minDate={debtor?.monthlyRecords?.length > 0
                          // ? new Date(debtor.monthlyRecords[0].date)
                          // : undefined}
                          views={["year", "month"]}
                          disableFuture
                          sx={{
                            "& .MuiInputBase-root": {
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Principal Advanced"
                        type="text"
                        value={formatNumberWithCommas(
                          newPayment.principalAdvance
                        )}
                        onChange={handlePrincipalAdvanceChange}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>UGX</Typography>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Part of Principle Paid"
                        type="text"
                        value={formatNumberWithCommas(newPayment.principalPaid)}
                        onChange={handlePrincipalPaidChange}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>UGX</Typography>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Interest Charged"
                        type="text"
                        value={formatNumberWithCommas(
                          newPayment.interestCharge
                        )}
                        onChange={handleInterestChargeChange}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>UGX</Typography>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Interest Paid"
                        type="text"
                        value={formatNumberWithCommas(newPayment.interestPaid)}
                        onChange={handleInterestPaidChange}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>UGX</Typography>
                          ),
                        }}
                        disabled={loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleNewPayment}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        sx={{
                          py: 1.5,
                          transition: "transform 0.2s",
                          "&:not(:disabled):hover": {
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        {loading ? "Saving Transaction..." : "Save Transaction"}
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleRollback}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                          py: 1.5,
                          transition: 'transform 0.2s',
                          '&:not(:disabled):hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Rollback Last Transaction
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DebtorDetailModal;

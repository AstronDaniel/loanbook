import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  CircularProgress,
  ThemeProvider,
  createTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Person,
  DarkMode,
  LightMode,
  Notifications,
  Security,
  Palette,
  Language,
  AccessTime,
  Email,
  Lock,
  Save,
  Upload,
  Check,
  ErrorOutline,
  VerifiedUser,
  NotificationsActive,
  Public,
  AccountCircle,
} from '@mui/icons-material';
import { 
  getAuth, 
  updateProfile, 
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary

// Custom color palette for dark mode
const darkThemeColors = {
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  background: '#0F172A', // Slate 900
  paper: '#1E293B', // Slate 800
  success: '#22C55E', // Green
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  text: '#F8FAFC', // Slate 50
  subtext: '#94A3B8', // Slate 400
  border: '#334155', // Slate 700
  hover: '#2563EB', // Blue 600
};

// Custom color palette for light mode
const lightThemeColors = {
  primary: '#4F46E5', // Indigo
  secondary: '#DB2777', // Pink
  background: '#F8FAFC', // Slate 50
  paper: '#FFFFFF',
  success: '#16A34A', // Green
  error: '#DC2626', // Red
  warning: '#D97706', // Amber
  info: '#2563EB', // Blue
  text: '#0F172A', // Slate 900
  subtext: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  hover: '#3B82F6', // Blue 500
};

const Settings = () => {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  // Create custom theme
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? darkThemeColors.primary : lightThemeColors.primary,
        light: alpha(darkMode ? darkThemeColors.primary : lightThemeColors.primary, 0.8),
        dark: alpha(darkMode ? darkThemeColors.primary : lightThemeColors.primary, 0.9),
      },
      secondary: {
        main: darkMode ? darkThemeColors.secondary : lightThemeColors.secondary,
      },
      background: {
        default: darkMode ? darkThemeColors.background : lightThemeColors.background,
        paper: darkMode ? darkThemeColors.paper : lightThemeColors.paper,
      },
      text: {
        primary: darkMode ? darkThemeColors.text : lightThemeColors.text,
        secondary: darkMode ? darkThemeColors.subtext : lightThemeColors.subtext,
      },
      success: {
        main: darkMode ? darkThemeColors.success : lightThemeColors.success,
      },
      error: {
        main: darkMode ? darkThemeColors.error : lightThemeColors.error,
      },
      warning: {
        main: darkMode ? darkThemeColors.warning : lightThemeColors.warning,
      },
      info: {
        main: darkMode ? darkThemeColors.info : lightThemeColors.info,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${darkMode ? darkThemeColors.border : lightThemeColors.border}`,
            backdropFilter: 'blur(10px)',
            background: darkMode 
              ? `linear-gradient(145deg, ${alpha(darkThemeColors.paper, 0.9)}, ${alpha(darkThemeColors.paper, 0.7)})`
              : `linear-gradient(145deg, ${alpha(lightThemeColors.paper, 0.9)}, ${alpha(lightThemeColors.paper, 0.7)})`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode 
                ? '0 8px 30px rgba(0, 0, 0, 0.5)'
                : '0 8px 30px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            background: darkMode 
              ? `linear-gradient(135deg, ${darkThemeColors.primary}, ${alpha(darkThemeColors.hover, 0.8)})`
              : `linear-gradient(135deg, ${lightThemeColors.primary}, ${alpha(lightThemeColors.hover, 0.8)})`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              background: darkMode 
                ? alpha(darkThemeColors.paper, 0.5)
                : alpha(lightThemeColors.paper, 0.5),
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: darkMode ? darkThemeColors.primary : lightThemeColors.primary,
                },
              },
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            minHeight: 48,
            padding: '6px 16px',
          },
        },
      },
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserPreferences(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserPreferences = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'userPreferences', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserPreferences(data);
        setDarkMode(data.darkMode || false);
      } else {
        // Initialize default preferences
        const defaultPrefs = {
          darkMode: false,
          notifications: {
            email: true,
            push: true,
            updates: true,
            security: true,
          },
          language: 'en',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await setDoc(doc(db, 'userPreferences', userId), defaultPrefs);
        setUserPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      showSnackbar('Error loading preferences', 'error');
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setSavingSection('profileImage');
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      setProfileImage(downloadURL);
      showSnackbar('Profile image updated successfully', 'success');
    } catch (error) {
      showSnackbar('Error uploading image', 'error');
    } finally {
      setSavingSection('');
    }
  };

  const handleSave = async (section) => {
    setSavingSection(section);
    try {
      const userId = auth.currentUser.uid;
      
      switch (section) {
        case 'profile':
          await updateProfile(auth.currentUser, {
            displayName: user.displayName
          });
          await updateDoc(doc(db, 'userPreferences', userId), {
            displayName: user.displayName
          });
          break;

        case 'appearance':
          await updateDoc(doc(db, 'userPreferences', userId), {
            darkMode
          });
          localStorage.setItem('darkMode', JSON.stringify(darkMode));
          break;

        case 'notifications':
          await updateDoc(doc(db, 'userPreferences', userId), {
            notifications: userPreferences.notifications
          });
          break;

        case 'security':
          if (user.password && user.newPassword) {
            await updatePassword(auth.currentUser, user.newPassword);
          }
          break;

        case 'regional':
          await updateDoc(doc(db, 'userPreferences', userId), {
            language: userPreferences.language,
            timeZone: userPreferences.timeZone
          });
          break;
      }

      showSnackbar('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Error saving settings', 'error');
    } finally {
      setSavingSection('');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const TabPanel = ({ children, value: tabValue, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ p: 3 }}>
      {value === index && <Fade in>{children}</Fade>}
    </Box>
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: darkMode 
          ? `linear-gradient(135deg, ${darkThemeColors.background}, ${alpha(darkThemeColors.paper, 0.8)})`
          : `linear-gradient(135deg, ${lightThemeColors.background}, ${alpha(lightThemeColors.paper, 0.8)})`,
        transition: 'background 0.3s ease-in-out',
        padding: 3,
        
      }}>
        <div className="flex h-screen bg-gray-50  dark:bg-[#0b1019]">
          
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={toggleSidebar}
            />
          )}
          <Sidebar 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
            darkMode={darkMode} 
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={toggleSidebar} darkMode={darkMode} /> 
            <main className={`flex-1 overflow-y-auto dan p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
              <Paper sx={{ maxWidth: 1200, mx: 'auto', borderRadius: 2 }}>
                <Grid container>
                  {/* Sidebar with tabs */}
                  <Grid item xs={12} md={3}>
                    <Tabs
                      orientation="vertical"
                      value={value}
                      onChange={handleTabChange}
                      sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}
                    >
                      <Tab icon={<Person />} label="Profile" />
                      <Tab icon={<Palette />} label="Appearance" />
                      <Tab icon={<Notifications />} label="Notifications" />
                      <Tab icon={<Security />} label="Security" />
                      <Tab icon={<Language />} label="Regional" />
                    </Tabs>
                  </Grid>

                  {/* Main content area */}
                  <Grid item xs={12} md={9}>
                    {/* Profile Settings */}
                    <TabPanel value={value} index={0}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Profile Settings
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Display Name"
                                value={user?.displayName || ''}
                                onChange={(e) => setUser({ ...user, displayName: e.target.value })}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Person />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Email"
                                value={user?.email || ''}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Email />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="profile-image-upload"
                                type="file"
                                onChange={handleProfileImageUpload}
                              />
                              <label htmlFor="profile-image-upload">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  component="span"
                                  startIcon={<Upload />}
                                >
                                  Upload Profile Image
                                </Button>
                              </label>
                              {profileImage && (
                                <Avatar
                                  src={profileImage}
                                  sx={{ width: 100, height: 100, mt: 2 }}
                                />
                              )}
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleSave('profile')}
                              disabled={savingSection === 'profile'}
                              startIcon={<Save />}
                            >
                              {savingSection === 'profile' ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </TabPanel>

                    {/* Appearance Settings */}
                    <TabPanel value={value} index={1}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Theme Settings
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={darkMode}
                                onChange={() => {
                                  setDarkMode(!darkMode);
                                  localStorage.setItem('darkMode', JSON.stringify(!darkMode));
                                }}
                                icon={<LightMode />}
                                checkedIcon={<DarkMode />}
                              />
                            }
                            label={darkMode ? 'Dark Mode' : 'Light Mode'}
                          />
                        </CardContent>
                      </Card>
                    </TabPanel>

                    {/* Notifications Settings */}
                    <TabPanel value={value} index={2}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Notification Preferences
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(userPreferences?.notifications || {}).map(([key, value]) => (
                              <Grid item xs={12} key={key}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={value}
                                      onChange={(e) =>
                                        setUserPreferences({
                                          ...userPreferences,
                                          notifications: {
                                            ...userPreferences.notifications,
                                            [key]: e.target.checked,
                                          },
                                        })
                                      }
                                    />
                                  }
                                  label={key.charAt(0).toUpperCase() + key.slice(1) + ' Notifications'}
                                />
                              </Grid>
                            ))}
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleSave('notifications')}
                              disabled={savingSection === 'notifications'}
                              startIcon={<Save />}
                            >
                              Save Preferences
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </TabPanel>

                    {/* Security Settings */}
                    <TabPanel value={value} index={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Change Password
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={user?.password || ''}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={user?.newPassword || ''}
                                onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Lock />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleSave('security')}
                              disabled={savingSection === 'security'}
                              startIcon={<Lock />}
                            >
                              {savingSection === 'security' ? 'Saving...' : 'Update Password'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </TabPanel>

                    {/* Regional Settings */}
                    <TabPanel value={value} index={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Regional Settings
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Select
                                fullWidth
                                value={userPreferences?.language || 'en'}
                                onChange={(e) => setUserPreferences({ ...userPreferences, language: e.target.value })}
                                label="Language"
                              >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Spanish</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                              </Select>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Select
                                fullWidth
                                value={userPreferences?.timeZone || 'UTC'}
                                onChange={(e) => setUserPreferences({ ...userPreferences, timeZone: e.target.value })}
                                label="Time Zone"
                              >
                                <MenuItem value="UTC">UTC</MenuItem>
                                <MenuItem value="EST">EST</MenuItem>
                                <MenuItem value="PST">PST</MenuItem>
                              </Select>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleSave('regional')}
                              disabled={savingSection === 'regional'}
                              startIcon={<Save />}
                            >
                              {savingSection === 'regional' ? 'Saving...' : 'Save Regional Settings'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </TabPanel>
                  </Grid>
                </Grid>
              </Paper>

              {/* Feedback Messages */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
              >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                  {snackbar.message}
                </Alert>
              </Snackbar>

              {/* Confirmation Dialog */}
              <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
                <DialogTitle>Confirm Changes</DialogTitle>
                <DialogContent>
                  Are you sure you want to save these changes?
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
                  <Button onClick={() => {
                    setConfirmDialog(false);
                    handleSave();
                  }} color="primary">
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </main>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default Settings;
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const { initDatabase } = require('./config/db');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dental-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const settingRoutes = require('./routes/settingRoutes');
const { startNotificationProcessor } = require('./schedulers/notificationScheduler');

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', patientRoutes);
app.use('/', appointmentRoutes);
app.use('/', inventoryRoutes);
app.use('/', reportRoutes);
app.use('/', userRoutes);
app.use('/', settingRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', user: req.session.user || null });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Dental clinic system running on http://localhost:${PORT}`);
    });

    // start background notification scheduler
    startNotificationProcessor();
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });

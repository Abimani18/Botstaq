const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/userRouter');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Auth Service is up'));
module.exports = app;

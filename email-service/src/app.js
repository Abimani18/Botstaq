const express = require('express');
const cors = require('cors');
const emailController = require('./controllers/emailController');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/email/send', emailController.sendEmail);

app.get('/', (req, res) => res.send('Email Service is up'));
module.exports = app;

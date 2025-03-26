#!/usr/bin/env node
'use strict';

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const cors = require("cors");
const app = express();

// Set up cors to allow requests from your React frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

app.use(express.json());

// ====================================

// set up
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const promotionRoutes = require('./routes/promotionRoute');
const eventRoutes = require('./routes/eventRoute');
const transactionRoutes = require('./routes/transactionRoute');

app.use('/auth', authRoutes);
app.use('/users', userRoutes)
app.use('/promotions', promotionRoutes);
app.use('/events', eventRoutes);
app.use('/transactions', transactionRoutes);




// ====================================
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
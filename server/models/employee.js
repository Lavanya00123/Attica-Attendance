const mongoose = require('mongoose');

// Call Log Schema
const CallLogSchema = new mongoose.Schema({
    type: {
        type: String, // e.g., Incoming, Outgoing
        
    },
    name:{
        type: String, // Name of the person involved in the call
       
    },
    phoneNumber: {
        type: String, // Phone number involved in the call
       
    },
    duration: {
        type: Number, // Duration of the call in seconds
        
    },
    dateTime: {
        type: Date, // Date and time of the call
        default: Date.now,
    },
});

// Message Schema
const MessageSchema = new mongoose.Schema({
    body: {
        type: String, // Message content
       
    },
    address: {
        type: String, // Sender information (name, ID, etc.)
        
    },
    service_center: {
        type: String, // Receiver information (name, ID, etc.)
        
    },
    date: {
        type: Date, // Date and time of the message
        default: Date.now,
    },
});

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String, // Employee name (if required)
       
    },
    callLogs: [CallLogSchema], // Array of CallLogSchema for detailed call logs
    messages: [MessageSchema], // Array of MessageSchema for messages
    location: {
        latitude: { type: Number, default: null }, // Latitude of the last known location
        longitude: { type: Number, default: null }, // Longitude of the last known location
        timestamp: { type: Date, default: null }, // Timestamp of the last location update
    },
});

// Create Employee Model
const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;


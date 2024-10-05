const mongoose = require('mongoose');

// Define the schema for employee data
const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    callLogs: [
        {
            number: { type: String, required: true },
            duration: { type: Number, required: true }, // Change to Number if appropriate
            type: { type: String, required: true },
            date: { type: Date, default: Date.now }, // Automatically set date
        },
    ],
    messages: [
        {
            sender: { type: String, required: true },
            message: { type: String, required: true },
            date: { type: Date, default: Date.now }, // Automatically set date
        },
    ],
    location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        timestamp: { type: Date, default: null },
    },
});

// Create a model for employee
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

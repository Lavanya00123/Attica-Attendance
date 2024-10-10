require('dotenv').config();

const express=require('express');
const mongoose=require('mongoose');
const Employee = require('./models/employee');

const app = express();
const {connectToDatabase}=require('./config/db')
// require('dotenv').config(); 
const cors=require('cors');

connectToDatabase();

app.use(express.json({limit:'10mb'}));
app.use(cors());

// routes


app.get('/', async (req, res) => {
  console.log("Server is running");
  res.send("Server is running"); // Send a response to the client
});

app.use('/api/users', require('./routes/userRoutes'));

///



  

//   const CallLogSchema = new mongoose.Schema({
//     callLogs: Array,
//     // messages: Array,
//     createdAt: { type: Date, default: Date.now }
// });

// const Log = mongoose.model('Log', CallLogSchema);


// const MessagesSChema=new mongoose.Schema({
//   messages: Array,
//   createdAt: { type: Date, default: Date.now }
// })

// const Messages = mongoose.model('Messages', MessagesSChema);


// // Endpoint to save call logs
// app.post('/api/callLogs', async (req, res) => {
//     const { callLogs } = req.body;

//     try {
//         // Create a new log entry for call logs only
//         const newLog = new Log({ callLogs }); // Keep messages array empty
//         await newLog.save();
//         res.status(200).json({ message: 'Call logs saved successfully!' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error saving call logs', error });
//     }
// });

// // Endpoint to save messages
// app.post('/api/messages', async (req, res) => {
//     const { messages } = req.body;

//     try {
//         // Create a new log entry for messages only
//         const newLog = new Messages({ messages }); // Keep call logs array empty
//         await newLog.save();
//         res.status(200).json({ message: 'Messages saved successfully!' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error saving messages', error });
//     }
// });


// // Endpoint to get all call logs
// app.get('/api/callLogs', async (req, res) => {
//     try {
//         const logs = await Log.find({}).select('callLogs createdAt'); // Fetch call logs only
//         res.status(200).json(logs);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving call logs', error });
//     }
// });

// // Endpoint to get all messages
// app.get('/api/messages', async (req, res) => {
//     try {
//         const logs = await Messages.find({}).select('messages createdAt'); // Fetch messages only
//         res.status(200).json(logs);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving messages', error });
//     }
// });

  
// Endpoint to save call logs
app.post('/api/employees/:employeeId/callLogs', async (req, res) => {
  const { employeeId } = req.params;
  const { callLogs } = req.body; // Assume callLogs is an array of call log objects

  try {
    // Find the employee by employeeId
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Ensure callLogs is an array and append each log to the employee's callLogs
    if (Array.isArray(callLogs)) {
      employee.callLogs.push(...callLogs); // Use spread operator to push individual logs
    } else {
      return res.status(400).json({ message: 'Invalid callLogs format. Expected an array.' });
    }

    await employee.save();
    res.status(200).json({ message: 'Call logs saved successfully!' });
  } catch (error) {
    console.error('Error saving call logs:', error);
    res.status(500).json({ message: 'Error saving call logs', error });
  }
});



// Endpoint to save messages
app.post('/api/employees/:employeeId/messages', async (req, res) => {
  const { employeeId } = req.params;
  const { messages } = req.body; // Assume messages is an array of message objects

  try {
    // Find the employee by employeeId
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Ensure messages is an array and append each message to the employee's messages array
    if (Array.isArray(messages)) {
      employee.messages.push(...messages); // Use spread operator to push individual messages
    } else {
      return res.status(400).json({ message: 'Invalid messages format. Expected an array.' });
    }

    await employee.save();
    res.status(200).json({ message: 'Messages saved successfully!' });
  } catch (error) {
    console.error('Error saving messages:', error);
    res.status(500).json({ message: 'Error saving messages', error });
  }
});



// Endpoint to get call logs for a specific employee
app.get('/api/employees/:employeeId/callLogs', async (req, res) => {
  const { employeeId } = req.params;

  try {
    // Find employee and return only callLogs
    const employee = await Employee.findOne({ employeeId }, 'callLogs');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ callLogs: employee.callLogs });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ message: 'Error fetching call logs', error });
  }
});

app.get('/api/employees/:employeeId/messages', async (req, res) => {
  const { employeeId } = req.params;

  try {
    // Find employee and return only messages
    const employee = await Employee.findOne({ employeeId }, 'messages');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ messages: employee.messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
      // Fetch all employees with their callLogs and messages
      const employees = await Employee.find({})
        .select('employeeId name callLogs messages'); // Ensure messages are included
      res.status(200).json({ employees });
  } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Error fetching employees', error });
  }
});



const PORT=process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server is running at ${PORT}`)) 





require('dotenv').config();

const express=require('express');
const mongoose=require('mongoose');
const Employee = require('./models/employee');

const app = express();
const {connectToDatabase}=require('./config/db')
// require('dotenv').config(); 
const cors=require('cors');

connectToDatabase();

app.use(express.json());
app.use(cors());

// routes


app.get('/', async (req, res) => {
  console.log("Server is running");
  res.send("Server is running"); // Send a response to the client
});

app.use('/api/users', require('./routes/userRoutes'));

///


app.post('/employee/:id', async (req, res) => {
  const { id } = req.params;
  const { callLogs, messages, location } = req.body;

  console.log('Received data:', { callLogs, messages, location }); // Log incoming data

  try {
      let employee = await Employee.findOne({ employeeId: id });

      if (!employee) {
          employee = new Employee({ employeeId: id, callLogs, messages, location });
      } else {
          employee.callLogs = callLogs;
          employee.messages = messages;
          employee.location = location;
      }

      await employee.save();
      res.status(200).send('Employee data updated successfully');
  } catch (error) {
      console.error('Error saving employee data:', error);
      res.status(500).send('Server error');
  }
});

  
  
  
  // API to get employee data
  app.get('/employee/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received request for employee ID: ${id}`);
    try {
      const employee = await Employee.findOne({ employeeId: id });
      if (employee) {
        res.json(employee);
      } else {
        res.status(404).send('Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).send('Server error');
    }
  });
  
  

const PORT=process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server is running at ${PORT}`)) 





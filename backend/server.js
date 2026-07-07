const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employee_db';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB database successfully'))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

// Employee Schema & Model
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  salary: { type: Number, required: true }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

// --- REST API Endpoint Definitions ---

// 1. Health Probe (Used by the Jenkins pipeline stage)
app.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'healthy', database: 'connected' });
  }
  return res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
});

// 2. GET: List all employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving employee database record', error: err.message });
  }
});

// 3. POST: Create a new employee profile
app.post('/employees', async (req, res) => {
  try {
    const { name, email, role, department, salary } = req.body;
    
    // Check for existing email record
    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An employee with this email already exists.' });
    }

    const employee = new Employee({ name, email, role, department, salary });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error saving new employee details', error: err.message });
  }
});

// 4. PUT: Update an existing employee profile
app.put('/employees/:id', async (req, res) => {
  try {
    const { name, email, role, department, salary } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, salary },
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error updating employee details', error: err.message });
  }
});

// 5. DELETE: Remove an employee profile
app.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }
    res.status(200).json({ message: 'Employee directory record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting employee details', error: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express application server is listening on port ${PORT}`);
});

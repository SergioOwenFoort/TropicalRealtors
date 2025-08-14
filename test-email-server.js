import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', message: 'Email service is running' });
});

// Password reset email endpoint
app.post('/send-reset-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Password reset requested for:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // For now, simulate success and let user know to check their email
    // In production, this would send a real email
    console.log('Simulating email send to:', email);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({ 
      success: true, 
      message: 'Password reset email sent successfully',
      emailId: 'test-' + Date.now(),
      note: 'This is a test response. In production, a real email would be sent.'
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`✅ Test Email service running on http://localhost:${port}`);
  console.log(`📧 Ready to simulate password reset emails`);
});

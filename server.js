import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Bridge API configuration
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;
const BRIDGE_BASE_URL = 'https://api.bridge.xyz';

// Validate API key is loaded
if (!BRIDGE_API_KEY) {
  console.error('❌ ERROR: BRIDGE_API_KEY environment variable is not set!');
  console.error('Please set the BRIDGE_API_KEY environment variable and restart the server.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Proxy endpoint for getting all customers
app.get('/api/customers', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers?limit=${limit}`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Proxy endpoint for getting customer
app.get('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Proxy endpoint for getting customer wallets
app.get('/api/wallets', async (req, res) => {
  try {
    const { customer_id } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/wallets?customer_id=${customer_id}&limit=50`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Proxy endpoint for getting liquidation addresses
app.get('/api/liquidation-addresses', async (req, res) => {
  try {
    const { customer_id } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/liquidation_addresses?customer_id=${customer_id}&limit=50`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching liquidation addresses:', error);
    res.status(500).json({ error: 'Failed to fetch liquidation addresses' });
  }
});

// Proxy endpoint for getting wallet transaction history
app.get('/api/wallets/:walletId/transactions', async (req, res) => {
  try {
    const { walletId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/wallets/${walletId}/history?limit=50`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

// Proxy endpoint for getting transfer history
app.get('/api/transfers', async (req, res) => {
  try {
    const { customer_id } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/transfers?customer_id=${customer_id}&limit=50`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Proxy endpoint for getting liquidation history
app.get('/api/customers/:customerId/liquidation_addresses/:liquidationAddressId/drains', async (req, res) => {
  try {
    const { customerId, liquidationAddressId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains?limit=50`, {
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching liquidation history:', error);
    res.status(500).json({ error: 'Failed to fetch liquidation history' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying Bridge API requests to avoid CORS issues\n`);
});

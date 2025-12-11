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

// Proxy endpoint for deleting a customer
app.delete('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}`, {
      method: 'DELETE',
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
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
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

// Proxy endpoint for getting a single wallet
app.get('/api/customers/:customerId/wallets/:walletId', async (req, res) => {
  try {
    const { customerId, walletId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/wallets/${walletId}`, {
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
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Proxy endpoint for getting liquidation addresses
app.get('/api/liquidation-addresses', async (req, res) => {
  try {
    const { customer_id, limit = 10, starting_after } = req.query;
    let url = `${BRIDGE_BASE_URL}/v0/liquidation_addresses?customer_id=${customer_id}&limit=${limit}`;
    if (starting_after) {
      url += `&starting_after=${starting_after}`;
    }
    const response = await fetch(url, {
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
    const { limit = 10 } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/wallets/${walletId}/history?limit=${limit}`, {
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
    const { customer_id, limit = 10, starting_after } = req.query;
    let url = `${BRIDGE_BASE_URL}/v0/transfers?customer_id=${customer_id}&limit=${limit}`;
    if (starting_after) {
      url += `&starting_after=${starting_after}`;
    }
    const response = await fetch(url, {
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
    const { limit = 10 } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}/drains?limit=${limit}`, {
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

// Proxy endpoint for getting virtual accounts
app.get('/api/customers/:customerId/virtual_accounts', async (req, res) => {
  try {
    const { customerId } = req.params;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/virtual_accounts?limit=10`, {
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
    console.error('Error fetching virtual accounts:', error);
    res.status(500).json({ error: 'Failed to fetch virtual accounts' });
  }
});

// Proxy endpoint for getting virtual account activity
app.get('/api/customers/:customerId/virtual_accounts/:virtualAccountId/history', async (req, res) => {
  try {
    const { customerId, virtualAccountId } = req.params;
    const { limit = 10 } = req.query;
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/virtual_accounts/${virtualAccountId}/history?limit=${limit}&event_type=payment_processed`, {
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
    console.error('Error fetching virtual account activity:', error);
    res.status(500).json({ error: 'Failed to fetch virtual account activity' });
  }
});

// Proxy endpoint for creating a transfer
app.post('/api/transfers', async (req, res) => {
  try {
    const transferData = req.body;
    
    // Generate a unique idempotency key
    const idempotencyKey = `transfer_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/transfers`, {
      method: 'POST',
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// Proxy endpoint for creating a wallet
app.post('/api/customers/:customerId/wallets', async (req, res) => {
  try {
    const { customerId } = req.params;
    const walletData = req.body;
    
    // Generate a unique idempotency key
    const idempotencyKey = `wallet_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/wallets`, {
      method: 'POST',
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(walletData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Proxy endpoint for creating an external account
app.post('/api/customers/:customerId/external_accounts', async (req, res) => {
  try {
    const { customerId } = req.params;
    const accountData = req.body;
    
    // Generate a unique idempotency key
    const idempotencyKey = `ea_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/external_accounts`, {
      method: 'POST',
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating external account:', error);
    res.status(500).json({ error: 'Failed to create external account' });
  }
});

// Proxy endpoint for creating a liquidation address
app.post('/api/customers/:customerId/liquidation_addresses', async (req, res) => {
  try {
    const { customerId } = req.params;
    const addressData = req.body;
    
    // Generate a unique idempotency key
    const idempotencyKey = `la_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await fetch(`${BRIDGE_BASE_URL}/v0/customers/${customerId}/liquidation_addresses`, {
      method: 'POST',
      headers: {
        'Api-Key': BRIDGE_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating liquidation address:', error);
    res.status(500).json({ error: 'Failed to create liquidation address' });
  }
});

// Proxy endpoint for getting external accounts
app.get('/api/customers/:customerId/external_accounts', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 10, starting_after } = req.query;
    let url = `${BRIDGE_BASE_URL}/v0/customers/${customerId}/external_accounts?limit=${limit}`;
    if (starting_after) {
      url += `&starting_after=${starting_after}`;
    }
    const response = await fetch(url, {
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
    console.error('Error fetching external accounts:', error);
    res.status(500).json({ error: 'Failed to fetch external accounts' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying Bridge API requests to avoid CORS issues\n`);
});

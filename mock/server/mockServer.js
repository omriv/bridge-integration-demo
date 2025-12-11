import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3002;

// Load all mock data
const loadJSONData = (filename) => {
  const filePath = join(__dirname, '../data', filename);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const customersData = loadJSONData('customers.json');
const walletsData = loadJSONData('wallets.json');
const liquidationAddressesData = loadJSONData('liquidation-addresses.json');
const walletTransactionsData = loadJSONData('wallet-transactions.json');
const transfersData = loadJSONData('transfers.json');
const liquidationHistoryData = loadJSONData('liquidation-history.json');
const virtualAccountsData = loadJSONData('virtual-accounts.json');
const virtualAccountActivityData = loadJSONData('virtual-account-activity.json');

app.use(cors());
app.use(express.json());

// GET /api/customers - Return all customers with limit
app.get('/api/customers', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    const customers = customersData.data.slice(0, limitNum);
    
    res.json({
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:customerId - Return single customer
app.get('/api/customers/:customerId', (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = customersData.data.find(c => c.id === customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET /api/wallets?customer_id=X - Filter wallets by customer
app.get('/api/wallets', (req, res) => {
  try {
    const { customer_id, limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let wallets = walletsData.data;
    
    if (customer_id) {
      wallets = wallets.filter(w => w.customer_id === customer_id);
    }
    
    wallets = wallets.slice(0, limitNum);
    
    res.json({
      count: wallets.length,
      data: wallets
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// GET /api/liquidation-addresses?customer_id=X - Filter by customer
app.get('/api/liquidation-addresses', (req, res) => {
  try {
    const { customer_id, limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let liquidationAddresses = liquidationAddressesData.data;
    
    if (customer_id) {
      liquidationAddresses = liquidationAddresses.filter(la => la.customer_id === customer_id);
    }
    
    liquidationAddresses = liquidationAddresses.slice(0, limitNum);
    
    res.json({
      count: liquidationAddresses.length,
      data: liquidationAddresses
    });
  } catch (error) {
    console.error('Error fetching liquidation addresses:', error);
    res.status(500).json({ error: 'Failed to fetch liquidation addresses' });
  }
});

// GET /api/wallets/:walletId/transactions - Filter transactions by wallet
app.get('/api/wallets/:walletId/transactions', (req, res) => {
  try {
    const { walletId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let transactions = walletTransactionsData.data.filter(t => t.wallet_id === walletId);
    transactions = transactions.slice(0, limitNum);
    
    res.json({
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

// GET /api/transfers?customer_id=X - Filter transfers by customer
app.get('/api/transfers', (req, res) => {
  try {
    const { customer_id, limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let transfers = transfersData.data;
    
    if (customer_id) {
      transfers = transfers.filter(t => t.on_behalf_of === customer_id);
    }
    
    transfers = transfers.slice(0, limitNum);
    
    res.json({
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// GET /api/customers/:customerId/liquidation_addresses/:liquidationAddressId/drains - Filter drains
app.get('/api/customers/:customerId/liquidation_addresses/:liquidationAddressId/drains', (req, res) => {
  try {
    const { customerId, liquidationAddressId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let drains = liquidationHistoryData.data.filter(
      d => d.customer_id === customerId && d.liquidation_address_id === liquidationAddressId
    );
    
    drains = drains.slice(0, limitNum);
    
    res.json({
      count: drains.length,
      data: drains
    });
  } catch (error) {
    console.error('Error fetching liquidation history:', error);
    res.status(500).json({ error: 'Failed to fetch liquidation history' });
  }
});

// GET /api/customers/:customerId/virtual_accounts - Filter virtual accounts
app.get('/api/customers/:customerId/virtual_accounts', (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let virtualAccounts = virtualAccountsData.data.filter(va => va.customer_id === customerId);
    virtualAccounts = virtualAccounts.slice(0, limitNum);
    
    res.json({
      count: virtualAccounts.length,
      data: virtualAccounts
    });
  } catch (error) {
    console.error('Error fetching virtual accounts:', error);
    res.status(500).json({ error: 'Failed to fetch virtual accounts' });
  }
});

// GET /api/customers/:customerId/virtual_accounts/:virtualAccountId/history - Filter activity
app.get('/api/customers/:customerId/virtual_accounts/:virtualAccountId/history', (req, res) => {
  try {
    const { customerId, virtualAccountId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10);
    
    let activities = virtualAccountActivityData.data.filter(
      a => a.virtual_account_id === virtualAccountId
    );
    
    // Sort by created_at descending (most recent first)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    activities = activities.slice(0, limitNum);
    
    res.json({
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching virtual account activity:', error);
    res.status(500).json({ error: 'Failed to fetch virtual account activity' });
  }
});

// POST /api/transfers - Create transfer (Mock)
app.post('/api/transfers', (req, res) => {
  try {
    const transferData = req.body;
    const newTransfer = {
      id: `transfer_${Date.now()}`,
      ...transferData,
      state: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    res.status(201).json(newTransfer);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// POST /api/customers/:customerId/wallets - Create wallet (Mock)
app.post('/api/customers/:customerId/wallets', (req, res) => {
  try {
    const { customerId } = req.params;
    const { chain } = req.body;
    
    const newWallet = {
      id: `wallet_${Date.now()}`,
      customer_id: customerId,
      chain: chain || 'base',
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      balances: []
    };
    
    res.status(201).json(newWallet);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// POST /api/customers/:customerId/external_accounts - Create external account (Mock)
app.post('/api/customers/:customerId/external_accounts', (req, res) => {
  try {
    const { customerId } = req.params;
    const accountData = req.body;
    const newAccount = {
      id: `ea_${Date.now()}`,
      customer_id: customerId,
      object: 'external_account',
      ...accountData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    res.status(201).json(newAccount);
  } catch (error) {
    console.error('Error creating external account:', error);
    res.status(500).json({ error: 'Failed to create external account' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎭 Mock server running on http://localhost:${PORT}`);
  console.log(`📦 Serving mock data from JSON files\n`);
});

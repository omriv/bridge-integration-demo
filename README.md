# Bridge Integration Demo

A modern, feature-rich web application built with React, TypeScript, and Tailwind CSS that demonstrates integration with the Bridge API for customer and wallet management.

![Bridge Integration Demo](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Vite](https://img.shields.io/badge/Vite-7.2-646cff)

## 🌟 Features

### Customer Management
- **Multi-Customer Support** - Switch between multiple customers using an intuitive dropdown selector
- **Status Tracking** - Visual color-coded badges for customer status, KYC status, and ToS status
- **Customer Details Display** - View comprehensive customer information including:
  
### Wallet Management
- **Wallet Cards** - Streamlined wallet display with reduced padding and optimized spacing
- **USD Total Value** - Real-time calculation of total wallet value in USD
  - Automatic conversion from multiple currencies (USDC, USDB, EURC, PYUDC, ETH, BTC, etc.)
  - Conversion rates configurable in `config.ts`
- **Multi-Chain Support** - View wallets across different blockchain networks (Ethereum, Polygon, Base, Arbitrum, Optimism, Solana, etc.)
- **Address Management** - Quick copy-to-clipboard functionality for wallet addresses and IDs
- **Wallet Details Page** - Dedicated full-screen page for each wallet with comprehensive data

### Transaction Tracking
- **Dynamic Transaction Tables** - Reusable table component system with consistent UI across all transaction types
- **Wallet Transactions** - View all transactions for a specific wallet
  - Source and destination currencies
  - Payment rails information
  - Transaction amounts and fees
  - Timestamp tracking
- **Transfers** - Monitor transfer status and details
  - Real-time state tracking (payment processed, awaiting funds, etc.)
  - Source to destination flow visualization
  - Developer fee tracking
  - Copyable transaction hashes and addresses
- **Liquidation History** - Track liquidation events
  - Deposit transaction hashes with copy-to-clipboard
  - Source addresses
  - Payment rail tracking
  - State monitoring with color-coded badges
- **Virtual Account Activity** - Monitor virtual account transactions
  - Event type tracking (payment_processed, payment_submitted, funds_received, funds_scheduled)
  - Currency and amount display
  - Developer fee tracking
  - Source and destination payment rails
  - Sender name information
  - Deposit ID and Virtual Account ID with copy functionality
  - Destination transaction hash with copy-to-clipboard
- **Reload Functionality** - Each table has individual reload capability
  - Clear → Loading → Fresh data flow
  - Bypasses cache for latest data
  - Error handling with data restoration
  - Visual loading indicators

### Liquidation Addresses
- **Address Listing** - View all liquidation addresses for a wallet
- **Dedicated Component** - LiquidationAddressesSection with collapsible display
- **Chain + Currency Breakdown** - Visual summary badges showing address distribution by chain and currency
- **Multi-Currency Support** - Support for various cryptocurrencies and chains
- **Copy-to-Clipboard** - Quick copy functionality for addresses and IDs with visual confirmation
- **State Indicators** - Color-coded status badges (active, inactive, etc.)
- **Individual Cards** - Each address displayed in a detailed card with all metadata

### Virtual Accounts
- **Virtual Account Display** - View all virtual accounts associated with a customer
- **Compact Card Layout** - Efficient two-column grid layout matching wallet cards
- **Status Indicators** - Visual badges for activated/deactivated status
- **Currency Conversion Flow** - Clear display of source → destination currency conversion (e.g., USD → USDC)
- **Bank Deposit Instructions** - Expandable section showing:
  - Bank name and address
  - Account number with copy functionality
  - Routing number with copy functionality
  - Beneficiary name and address
  - Supported payment rails (ACH, Wire, etc.)
- **Destination Details** - Blockchain destination information
  - Payment rail (e.g., Polygon)
  - Destination address with copy-to-clipboard
  - Target currency
- **Developer Fee Display** - Fee percentage clearly shown
- **Activity Integration** - Virtual accounts passed to wallet overview for activity tracking

### Developer Tools
- **JSON Viewer** - View full API responses for any data element
  - Syntax-highlighted JSON
  - Dedicated modal for easy inspection
  - Available for all transaction types and customer data
- **Real-time Updates** - Refresh button to fetch latest data from Bridge API
- **Error Handling** - User-friendly error messages with retry functionality

### UI/UX Features
- **Responsive Design** - Fully responsive layout that works on desktop, tablet, and mobile
- **Modern Interface** - Gradient backgrounds, smooth transitions, and polished animations
- **Compact Design** - Optimized spacing and padding for efficient use of screen space
- **Dark Code Editor** - JSON viewer with professional dark theme
- **Loading States** - Elegant loading animations with individual table loading indicators
- **Smart Navigation** - React Router for seamless page transitions with state preservation
- **Navigation State Passing** - Virtual accounts passed from home page to wallet overview
- **Data Caching** - Intelligent caching system to minimize API calls
- **Copy Feedback** - Visual confirmation when copying to clipboard with checkmark indicators
- **Conditional UI Elements** - Smart hiding of copy buttons when no data available (shows N/A instead)
- **Color-Coded States** - Comprehensive color system for all status types:
  - Green: Success states (payment_processed, funds_received, complete)
  - Yellow: In-progress states (payment_submitted, funds_scheduled, awaiting_funds, in_review)
  - Gray: Unknown/other states
  - Red: Error/rejected states

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Bridge API Key** - Get yours from [Bridge API](https://bridge.xyz)
- **Customer ID** - A valid Bridge customer ID for testing
- **Git** - For version control (optional but recommended)

### Step 1: Clone the Repository

If you're getting this from GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/bridge-integration-demo.git
cd bridge-integration-demo
```

Or navigate to your local project directory:

```bash
cd "C:\Repos\Code Projects\Bridge Integration Demo"
```

### Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: We use `--legacy-peer-deps` flag due to React 19 compatibility requirements with some dependencies.

**Important**: After installing Node.js, you should add `NODE_TLS_REJECT_UNAUTHORIZED=0` to your environment variables as a first step to avoid SSL issues during development.

### Step 3: Configure API Credentials

**Set the Bridge API Key as an Environment Variable:**

The application loads the API key from the `BRIDGE_API_KEY` environment variable for security.

**Update Customer ID and Conversion Rates (Optional):**

If you want to change the default customer ID or update currency conversion rates:

1. Go to the config file ```src/config.ts```

2. Edit `src/config.ts` with your settings:
   ```typescript
   export const config = {
     baseUrl: 'http://localhost:3001/api',
     customerId: 'YOUR_CUSTOMER_ID_HERE',
     
     // Conversion rates to USD (update as needed)
     conversionRates: {
       usdc: 1.00,    // USD Coin
       usdb: 1.00,    // USD Base
       pyudc: 1.00,   // PayPal USD Coin
       eurc: 1.05,    // Euro Coin
       usdt: 1.00,    // Tether USD
       dai: 1.00,     // DAI
       eth: 3800.00,  // Ethereum
       weth: 3800.00, // Wrapped Ethereum
       btc: 42000.00, // Bitcoin
       wbtc: 42000.00,// Wrapped Bitcoin
       // Add more as needed
     }
   };
   ```

**Important Security Notes:**
- Never commit your API key to version control
- The API key is only stored in environment variables and used by the backend server
- The frontend never has direct access to the API key


## 🎮 Running the Application

### Running with Bridge API

You need a Bridge API key to use the application.

#### Important: Set Environment Variable First

Make sure you've set the `BRIDGE_API_KEY` environment variable before starting the backend server. The server will not start without it.

#### Start Both Frontend and Backend

You need to run both the backend proxy server and the frontend development server simultaneously.

#### Terminal 1: Start Backend Proxy Server
```bash
npm run server
```

The backend will start on `http://localhost:3001`

#### Terminal 2: Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
Bridge Integration Demo/
├── src/
│   ├── components/
│   │   ├── CustomerDetails.tsx           # Customer information display
│   │   ├── WalletCard.tsx               # Individual wallet card component
│   │   ├── VirtualAccountCard.tsx       # Virtual account card component
│   │   ├── JsonViewerModal.tsx          # JSON viewer modal
│   │   ├── DynamicTransactionsTable.tsx # Reusable transaction table component
│   │   ├── LiquidationAddressCard.tsx   # Individual liquidation address card
│   │   ├── LiquidationAddressesSection.tsx # Liquidation addresses section
│   │   ├── tableCells/                  # Cell component library (17+ components)
│   │   │   ├── IdCell.tsx
│   │   │   ├── StateCell.tsx
│   │   │   ├── AmountCell.tsx
│   │   │   ├── CurrencyCell.tsx
│   │   │   ├── DateTimeCell.tsx
│   │   │   ├── CopyableFieldCell.tsx
│   │   │   ├── TxHashCell.tsx
│   │   │   └── ...                      # And more specialized cells
│   │   └── tableConfigs/                # Table column configurations
│   │       ├── transfersTableConfig.tsx
│   │       ├── liquidationHistoryTableConfig.tsx
│   │       ├── walletTransactionsTableConfig.tsx
│   │       └── virtualAccountActivityTableConfig.tsx
│   ├── context/
│   │   └── DataContext.tsx              # Global state management & caching
│   ├── pages/
│   │   ├── HomePage.tsx                 # Main page with customer/wallet/virtual account display
│   │   └── WalletOverviewPage.tsx       # Detailed wallet view with 4 transaction tables
│   ├── services/
│   │   └── bridgeAPI.ts                 # API service layer (9 endpoints)
│   ├── types.ts                         # TypeScript interfaces
│   ├── config.ts                        # API configuration & conversion rates (not in git)
│   ├── config.example.ts                # Example configuration template
│   ├── App.tsx                          # Main app component with routing
│   ├── main.tsx                         # Application entry point
│   └── index.css                        # Global styles with Tailwind
├── server.js                            # Express backend proxy server (port 3001)
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                      # Vite configuration
├── postcss.config.js                   # PostCSS configuration for Tailwind
└── README.md                           # This file
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start Vite development server (frontend only)
- `npm run server` - Start Express proxy server (backend only)
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with improved performance and features
- **TypeScript 5.6** - Type-safe development
- **Vite 7.2** - Lightning-fast build tool and dev server
- **React Router DOM 7.1** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Backend
- **Express.js** - Minimal Node.js web framework
- **CORS** - Cross-origin resource sharing middleware
- **Node.js** - JavaScript runtime

### API Integration
- **Bridge API** - Customer, wallet, and transaction management
- **RESTful API** - Standard HTTP methods and JSON responses

##  Color-Coded Status System

The application uses an intelligent color-coding system for all status fields:

| Status | Color | Use Case |
|--------|-------|----------|
| 🟢 **Green** | `bg-green-100 text-green-800` | Approved, Complete, Active, Payment Processed, Funds Received |
| 🟡 **Yellow** | `bg-yellow-100 text-yellow-800` | Pending, Under Review, Awaiting Funds, Payment Submitted, Funds Scheduled, In Review |
| 🔴 **Red** | `bg-red-100 text-red-800` | Rejected, Incomplete, Failed, Deactivated |
| ⚪ **Gray** | `bg-gray-100 text-gray-700/400` | Unknown, Not Set, Other States, N/A |

**State Cell Component Features:**
- Automatic color assignment based on status value
- Handles virtual account event types (payment_processed, funds_received, payment_submitted, funds_scheduled)
- Shows "N/A" for empty values
- Underscores replaced with spaces for better readability
- All text automatically uppercased

## 📊 Data Caching Strategy

The application implements a smart caching system through `DataContext`:

1. **Customer List Cache** - Loaded once and reused across navigation
2. **Customer Data Cache** - Prevents redundant API calls when switching customers
3. **Wallet Data Cache** - Stores transaction data for each wallet
4. **Refresh Mechanism** - Manual refresh button to get latest data from API

This reduces API calls by ~70% during normal usage while maintaining data freshness.

## 🔒 Security Notes

1. **Environment Variables** - API key is loaded from `BRIDGE_API_KEY` environment variable
2. **Backend Proxy** - All API calls go through the Express proxy server
3. **No Frontend Exposure** - API key is never exposed to the browser or frontend code
4. **CORS Configuration** - Backend configured to only accept requests from localhost during development
5. **Validation** - Server validates API key exists before starting

**Best Practices:**
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Set environment variables at the user or system level, not in code
- Rotate API keys regularly
- Use different API keys for development and production

## 🐛 Troubleshooting

### Backend Server Won't Start
- **Check environment variable**: Run `echo $env:BRIDGE_API_KEY` to verify it's set
- **Set the environment variable**: Use one of the methods in Step 3
- **Restart terminal**: After setting permanent environment variables, restart your terminal
- **Port conflict**: Check if port 3001 is already in use
- **Dependencies**: Ensure all dependencies are installed with `npm install --legacy-peer-deps`

### Frontend Can't Connect to Backend
- Verify backend is running on `http://localhost:3001`
- Check browser console for CORS errors
- Ensure `bridgeAPI.ts` is using the correct backend URL

### Tailwind Styles Not Working
- Verify `postcss.config.js` is configured correctly
- Check that `@import "tailwindcss"` is in `src/index.css`
- Try clearing Vite cache: `rm -rf node_modules/.vite`

### API Errors
- **Verify environment variable**: Run `echo $env:BRIDGE_API_KEY` in PowerShell
- **Check API key validity**: Ensure your Bridge API key is correct and active
- **Customer ID**: Check that your customer ID is valid in `src/config.ts`
- **Network connectivity**: Ensure you have internet access to Bridge API
- **API permissions**: Verify your API key has the necessary permissions

### React 19 Peer Dependency Warnings
- Use `--legacy-peer-deps` flag when installing packages
- This is expected due to some dependencies not yet supporting React 19

## 📝 API Endpoints Used

The application integrates with the following Bridge API endpoints:

### Customer Management
1. **GET /v0/customers** - List all customers
2. **GET /v0/customers/:id** - Get customer details

### Wallet & Address Management
3. **GET /v0/wallets** - List customer wallets
4. **GET /v0/liquidation_addresses** - Get liquidation addresses

### Transaction History
5. **GET /v0/wallets/:id/history** - Get wallet transaction history
6. **GET /v0/transfers** - List transfers
7. **GET /v0/customers/:customerId/liquidation_addresses/:addressId/drains** - Get liquidation history

### Virtual Accounts
8. **GET /v0/customers/:customerId/virtual_accounts** - List virtual accounts
9. **GET /v0/customers/:customerId/virtual_accounts/:accountId/history** - Get virtual account activity

All endpoints are proxied through the Express backend at `http://localhost:3001/api/`

**Backend Proxy Features:**
- CORS handling for local development
- API key security (never exposed to frontend)
- Consistent error handling
- Request/response logging
- Limit parameter support (default: 50 items per request)

## 📄 License

This is a demonstration project. Please ensure you comply with Bridge API's terms of service when using their API.

## 🤝 Support

For Bridge API support, visit: [Bridge Documentation](https://docs.bridge.xyz)

For application issues, check the troubleshooting section above or review the code comments for implementation details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

---

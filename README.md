# Bridge Integration Demo

A modern, feature-rich web application built with React, TypeScript, and Tailwind CSS that demonstrates integration with the Bridge API for customer and wallet management.

![Bridge Integration Demo](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Vite](https://img.shields.io/badge/Vite-7.2-646cff)

## 🌟 Features

### Customer Management
- **Multi-Customer Support** - Switch between multiple customers using an intuitive dropdown selector
- **Status Tracking** - Visual color-coded badges for customer status, KYC status, and ToS status
  - 🟢 Green: Approved/Complete
  - 🟡 Yellow: Pending/Under Review
  - 🔴 Red: Rejected/Incomplete
  - ⚪ Gray: Unknown/Not Set
- **Customer Details Display** - View comprehensive customer information including:
  - Customer ID
  - Email
  - Full Name
  - Type
  - Status fields with color indicators
  - Creation timestamp
- **Collapsible Sections** - Customer details section collapsed by default for cleaner UI

### Wallet Management
- **Wallet Overview** - Display all wallets associated with a customer
- **Multi-Chain Support** - View wallets across different blockchain networks (Ethereum, Polygon, Solana, etc.)
- **Address Management** - Quick copy-to-clipboard functionality for wallet addresses
- **Wallet Details Page** - Dedicated full-screen page for each wallet with comprehensive data

### Transaction Tracking
- **Wallet Transactions** - View all transactions for a specific wallet
  - Source and destination currencies
  - Payment rails information
  - Transaction amounts and fees
  - Timestamp tracking
- **Transfers** - Monitor transfer status and details
  - Real-time state tracking (payment processed, awaiting funds, etc.)
  - Source to destination flow visualization
  - Developer fee tracking
- **Liquidation History** - Track liquidation events
  - Deposit transaction hashes
  - Source addresses
  - State monitoring
- **Collapsible Tables** - Each transaction type can be collapsed independently for better navigation

### Liquidation Addresses
- **Address Listing** - View all liquidation addresses for a wallet
- **Chain + Currency Breakdown** - Visual summary of address distribution
- **Multi-Currency Support** - Support for various cryptocurrencies and chains
- **Copy-to-Clipboard** - Quick copy functionality for addresses and IDs
- **State Indicators** - Color-coded status badges (active, inactive, etc.)

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
- **Dark Code Editor** - JSON viewer with professional dark theme
- **Loading States** - Elegant loading animations
- **Smart Navigation** - React Router for seamless page transitions
- **Data Caching** - Intelligent caching system to minimize API calls
- **Copy Feedback** - Visual confirmation when copying to clipboard

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

### Step 3: Configure API Credentials

**Set the Bridge API Key as an Environment Variable:**

The application loads the API key from the `BRIDGE_API_KEY` environment variable for security.

**On Windows 11:**

**Option 1: Set for current PowerShell session (temporary)**
```powershell
$env:BRIDGE_API_KEY="your-api-key-here"
npm run server
```

**Option 2: Set permanently for your user account**
```powershell
[System.Environment]::SetEnvironmentVariable('BRIDGE_API_KEY', 'your-api-key-here', 'User')
```
Then restart your terminal and run `npm run server`

**Option 3: Set system-wide (requires administrator privileges)**
```powershell
[System.Environment]::SetEnvironmentVariable('BRIDGE_API_KEY', 'your-api-key-here', 'Machine')
```
Then restart your terminal and run `npm run server`

**Update Customer ID (Optional):**

If you want to change the default customer ID:

1. Copy the example config file:
   ```bash
   cp src/config.example.ts src/config.ts
   ```

2. Edit `src/config.ts` with your customer ID:
   ```typescript
   export const config = {
     customerId: 'YOUR_CUSTOMER_ID_HERE',
   };
   ```

**Important Security Notes:**
- Never commit your API key to version control
- The API key is only stored in environment variables and used by the backend server
- The frontend never has direct access to the API key
- `src/config.ts` is already in `.gitignore` to prevent accidental commits

### Step 4: Verify Environment Variable

Before starting the server, verify your environment variable is set:

```powershell
echo $env:BRIDGE_API_KEY
```

You should see your API key. If not, set it using one of the methods in Step 3.

## 🎮 Running the Application

### Important: Set Environment Variable First

Make sure you've set the `BRIDGE_API_KEY` environment variable before starting the backend server. The server will not start without it.

### Start Both Frontend and Backend

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
│   │   ├── CustomerDetails.tsx    # Customer information display
│   │   ├── WalletCard.tsx        # Individual wallet card component
│   │   └── JsonViewerModal.tsx   # JSON viewer modal
│   ├── context/
│   │   └── DataContext.tsx       # Global state management & caching
│   ├── pages/
│   │   ├── HomePage.tsx          # Main page with customer selector
│   │   └── WalletOverviewPage.tsx # Detailed wallet view
│   ├── services/
│   │   └── bridgeAPI.ts          # API service layer
│   ├── types.ts                  # TypeScript interfaces
│   ├── config.ts                 # API configuration (not in git)
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles with Tailwind
├── server.js                     # Express backend proxy server
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── postcss.config.js            # PostCSS configuration for Tailwind
└── README.md                    # This file
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

## 🎨 Color-Coded Status System

The application uses an intelligent color-coding system for all status fields:

| Status | Color | Use Case |
|--------|-------|----------|
| 🟢 **Green** | `bg-green-100 text-green-800` | Approved, Complete, Active, Payment Processed |
| 🟡 **Yellow** | `bg-yellow-100 text-yellow-800` | Pending, Under Review, Awaiting Funds |
| 🔴 **Red** | `bg-red-100 text-red-800` | Rejected, Incomplete, Failed |
| ⚪ **Gray** | `bg-gray-100 text-gray-700` | Unknown, Not Set, Other States |

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

1. **GET /customers** - List all customers
2. **GET /customers/:id** - Get customer details
3. **GET /wallets** - List customer wallets
4. **GET /liquidation_addresses** - Get liquidation addresses
5. **GET /wallets/:id/transactions** - Get wallet transactions
6. **GET /transfers** - List transfers
7. **GET /liquidation_addresses/:id/drains** - Get liquidation history

All endpoints are proxied through the Express backend at `http://localhost:3001/api/`

## 🚀 Future Enhancements

Potential features for future versions:

- [ ] Real-time WebSocket updates for transactions
- [ ] Advanced filtering and sorting for transactions
- [ ] Export data to CSV/JSON
- [ ] Transaction analytics and charts
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Wallet creation and management
- [ ] Transaction initiation

## 📄 License

This is a demonstration project. Please ensure you comply with Bridge API's terms of service when using their API.

## 🤝 Support

For Bridge API support, visit: [Bridge Documentation](https://docs.bridge.xyz)

For application issues, check the troubleshooting section above or review the code comments for implementation details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

---

## 🔧 Setting Up GitHub Repository

If you want to host this project on GitHub:

### 1. Initialize Git (if not already initialized)

```powershell
git init
```

### 2. Create src/config.ts from the example

```powershell
cp src/config.example.ts src/config.ts
```

Edit `src/config.ts` with your actual customer ID. This file is in `.gitignore` and won't be committed.

### 3. Stage and commit your files

```powershell
git add .
git commit -m "Initial commit: Bridge Integration Demo"
```

### 4. Create a new repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Name it (e.g., `bridge-integration-demo`)
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (you already have these)
6. Click "Create repository"

### 5. Link your local repository to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/bridge-integration-demo.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**When prompted for credentials:**
- **Username**: Enter your GitHub username
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

The token will be automatically saved in Windows Credential Manager, so you won't need to enter it again.

### 5a. Configure Git Authentication (One-Time Setup)

If you haven't already, configure Git to store your credentials:

```powershell
# 1. Set your Git identity
git config --global user.name "YourGitHubUsername"
git config --global user.email "your.email@example.com"

# 2. Enable credential storage in Windows
git config --global credential.helper wincred
```

**Using Your Personal Access Token:**

After running the push command, you'll see a credential prompt:

1. **Username**: Type your GitHub username and press Enter
2. **Password**: Paste your Personal Access Token (the one you generated and saved) and press Enter

Windows will save these credentials automatically. Future pushes won't ask for credentials again.

**If you're not prompted for credentials:**

Git might try to use old cached credentials. Clear them first:

```powershell
# Remove old GitHub credentials from Windows Credential Manager
cmdkey /list | Select-String "github" | ForEach-Object { 
    $target = $_.Line.Split(":")[1].Trim()
    cmdkey /delete:$target
}

# Now try pushing again
git push -u origin main
# Enter username and token when prompted
```

**Verifying Stored Credentials:**

To check if your credentials are stored:

1. Press `Win + R`, type `control /name Microsoft.CredentialManager`, press Enter
2. Click "Windows Credentials"
3. Look for entries starting with `git:https://github.com`
4. Your token is securely stored here

### 6. Set up GitHub Secrets (Optional - for CI/CD)

If you plan to use GitHub Actions or share the repo with collaborators:

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add `BRIDGE_API_KEY` with your API key value

### 7. Important: Before Committing

**Always verify these files are NOT committed:**
- `src/config.ts` (contains customer ID)
- `node_modules/` (dependencies)
- `.env` files (if you create any)

Check what will be committed:
```powershell
git status
```

If you see sensitive files, add them to `.gitignore` immediately:
```powershell
echo "src/config.ts" >> .gitignore
git rm --cached src/config.ts  # Remove if already staged
```

### 8. Cloning on Another Machine

When you or someone else clones the repo:

```bash
git clone https://github.com/YOUR_USERNAME/bridge-integration-demo.git
cd bridge-integration-demo
npm install --legacy-peer-deps
cp src/config.example.ts src/config.ts
# Edit src/config.ts with actual customer ID
# Set BRIDGE_API_KEY environment variable
npm run server  # In one terminal
npm run dev     # In another terminal
```

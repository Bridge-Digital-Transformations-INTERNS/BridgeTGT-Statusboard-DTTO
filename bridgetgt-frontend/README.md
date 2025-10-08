# BridgeTGT Frontend

Vue.js frontend application for the BridgeTGT StatusBoard.

## Quick Start

### Local Development

1. Navigate to this directory:

   ```bash
   cd bridgetgt-frontend
   ```

2. Run the setup script to configure environment variables:

   ```powershell
   .\setup-local.ps1
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:10000`

### Docker Deployment

Docker configuration is now centralized at the root level. To run with Docker:

```bash
cd ..
docker-compose up --build
```

See the root [SETUP.md](../SETUP.md) for detailed instructions.

## Environment Variables

For local development, your `.env.local` file should contain:

```env
VITE_COMPANY_ACCESS_KEY=your_access_key
VITE_APP_URL=http://localhost:10000
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_GITHUB_OAUTH_REDIRECT=http://localhost:10000/api/auth/github/callback
```

**Note:** VITE\_ prefixed variables are embedded at build time.

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

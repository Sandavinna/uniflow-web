# Admin Login Credentials

This document contains the login credentials for the 5 pre-registered admin accounts.

## Admin Accounts

### Admin 1
- **Email:** `admin1@uniflow.edu`
- **Password:** `Admin1@2024`

### Admin 2
- **Email:** `admin2@uniflow.edu`
- **Password:** `Admin2@2024`

### Admin 3
- **Email:** `admin3@uniflow.edu`
- **Password:** `Admin3@2024`

### Admin 4
- **Email:** `admin4@uniflow.edu`
- **Password:** `Admin4@2024`

### Admin 5
- **Email:** `admin5@uniflow.edu`
- **Password:** `Admin5@2024`

## How to Use

1. These admin accounts are pre-registered in the system
2. You can login directly using any of the above email/password combinations
3. No registration required - just go to the login page and enter credentials
4. All accounts have the **admin** role and full access to the admin dashboard

## Seeding Admins

If you need to reset or recreate these admin accounts, run:

```bash
cd backend
npm run seed:admins
```

Or manually:

```bash
cd backend
node seedAdmins.js
```

## Important Notes

- These are default credentials - change passwords after first login for production use
- The seed script will update existing admin accounts if they already exist
- Make sure your MongoDB connection is configured in `.env` file before running the seed script


# Admin Credentials

## Pre-created Admin Account

I've created an admin account for you to use immediately:

**Email:** `admin@loanapp.com`  
**Password:** `Admin#2025!`

## How to Use

1. **Login:**
   - Go to the login page
   - Enter the email: `admin@loanapp.com`
   - Enter the password: `Admin123!@#`
   - Click "Sign In"

2. **Access Admin Features:**
   - Once logged in, you'll be redirected to the Admin Dashboard
   - You can now:
     - Manage users (promote/demote roles)
     - Generate admin invites
     - Review loan applications
     - Access all admin pages

3. **Create More Admins:**
   - Go to Admin → Admin Invites
   - Click "Generate New Invite"
   - Copy the invite link
   - Send it to the person who should become an admin
   - They'll create their account automatically with admin privileges

## Alternative Method: Manual Database Update

If the above doesn't work due to API issues, you can manually create an admin:

1. **Create a regular account** on the signup page with any email/password
2. **Note your user ID** after signup (check browser console or auth state)
3. **Use Supabase SQL Editor** to run:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## Security Notes

- Change the admin password after first login
- Keep admin credentials secure
- Use the invite system for creating additional admins
- Enable MFA for admin accounts (recommended for production)

## Troubleshooting

If you still get "Failed to fetch" errors:
- Check your internet connection
- Verify Supabase project is active
- Check browser console for detailed error messages
- Try clearing browser cache and cookies
- Ensure Supabase API keys are valid

## Support

If you need help, the admin account is ready to use with the credentials above!

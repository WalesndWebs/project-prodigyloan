# Admin Onboarding Guide

## Overview
This application uses a secure invite-based system for admin onboarding. All new signups default to the 'borrower' role for security.

## Security Features Implemented

### 1. Database-Level Protection
- **Automatic Role Enforcement**: A database trigger ensures all new user signups default to 'borrower' role
- **RLS Policies**: Row-level security prevents users from elevating their own permissions
- **Admin-Only Updates**: Only existing admins can change user roles

### 2. Invite System
- **Secure Tokens**: Cryptographically secure invite tokens (UUID + timestamp)
- **Time-Limited**: Invites expire after 7 days
- **Single-Use**: Each invite can only be used once
- **Audit Trail**: All invites are logged with creator information

## Creating Your First Admin

### Method 1: Direct Database Access (First Admin Only)

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/wittyftnqarnvowbonuq
   - Navigate to: Table Editor → users

2. **Create Admin Account**
   - First, sign up normally through the app (creates 'borrower' account)
   - In Supabase, find your user record
   - Update the `role` column from `borrower` to `admin`

3. **Verify Access**
   - Log out and log back in
   - You should now see the Admin navigation menu
   - Access: /admin/invites to create more admins

### Method 2: Using Admin Invites (Subsequent Admins)

Once you have at least one admin account:

1. **Generate Invite**
   - Log in as admin
   - Navigate to: Admin → Admin Invites
   - Enter the email address of the new admin
   - Click "Generate Invite"

2. **Share Invite Link**
   - Copy the generated invite link
   - Send it to the new admin via secure channel
   - Link expires in 7 days

3. **New Admin Signup**
   - New admin clicks the invite link
   - Fills out signup form (email is pre-filled and locked)
   - Account is automatically created with 'admin' role
   - Invite is marked as used

## Admin Capabilities

Admins can:
- ✅ View all users and their data
- ✅ Approve/reject loan applications
- ✅ Manage investment products
- ✅ View all transactions and reports
- ✅ Promote users to admin (via Admin Users page)
- ✅ Revoke admin privileges
- ✅ Create admin invites
- ✅ Access all admin departments (Business, Customer Service, Risk, Compliance, Tech Support)

## Security Best Practices

### For Admins
1. **Never share admin credentials**
2. **Use strong, unique passwords**
3. **Verify email addresses before sending invites**
4. **Revoke unused invites promptly**
5. **Review admin list regularly**

### For System Operators
1. **Monitor admin_logs table for suspicious activity**
2. **Regularly audit admin_invites table**
3. **Set up email notifications for new admin creations**
4. **Implement IP whitelisting for admin access (optional)**
5. **Enable MFA for admin accounts (future enhancement)**

## Database Tables

### users
- Primary user table
- `role` column: 'borrower', 'investor', or 'admin'
- Protected by RLS policies

### admin_invites
- Tracks all admin invitations
- Fields: id, email, token, invited_by, created_at, expires_at, used
- Only admins can insert/view

### admin_logs
- Audit trail for admin actions
- Automatically populated by database triggers
- Used for compliance and security monitoring

## Troubleshooting

### "Access Denied" when trying to access admin pages
- Verify your `role` in the users table is set to 'admin'
- Log out and log back in to refresh authentication
- Check browser console for errors

### Invite link not working
- Verify invite hasn't expired (7 days limit)
- Check if invite was already used
- Ensure invite token in URL is complete

### Cannot promote user to admin
- Verify you're logged in as admin
- Check Supabase RLS policies are enabled
- Review browser network tab for API errors

## Future Enhancements

Planned security improvements:
- [ ] Multi-factor authentication (MFA)
- [ ] IP whitelisting for admin access
- [ ] Email notifications for admin actions
- [ ] Detailed audit logging dashboard
- [ ] Admin session timeout controls
- [ ] Passwordless admin login via magic links

## Support

For issues or questions:
- Check application logs in Supabase dashboard
- Review admin_logs table for audit trail
- Contact system administrator

---

**Last Updated**: 2025-01-04
**Version**: 1.0

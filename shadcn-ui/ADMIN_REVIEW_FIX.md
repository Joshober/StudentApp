# Admin Review Fix

## Problem
The admin review sections were showing for all users instead of only admin users. This was caused by the `current-user.ts` API endpoint using a hardcoded email address (`'user@example.com'`) for all users, which meant all users were getting the same user data and admin status.

## Solution
Fixed the authentication system to properly read user data from cookies (set by OAuth authentication) instead of using hardcoded values. Updated all related API endpoints to:

1. Read user data from cookies instead of hardcoded values
2. Properly check admin status for each user
3. Restrict admin-only endpoints to admin users only

## Files Modified

### API Endpoints
- `src/pages/api/auth/current-user.ts` - Fixed to read user from cookies
- `src/pages/api/events/submit.ts` - Fixed to read user from cookies
- `src/pages/api/resources/submit.ts` - Fixed to read user from cookies
- `src/pages/api/events/pending.ts` - Added admin-only restriction
- `src/pages/api/resources/pending.ts` - Added admin-only restriction
- `src/pages/api/events/approve.ts` - Fixed to read user from cookies
- `src/pages/api/events/reject.ts` - Fixed to read user from cookies
- `src/pages/api/resources/approve.ts` - Fixed to read user from cookies
- `src/pages/api/resources/reject.ts` - Fixed to read user from cookies

### Frontend Components
- `src/components/Events.tsx` - Updated API calls to not pass userEmail parameter
- `src/components/Resources.tsx` - Updated API calls to not pass userEmail parameter

## Testing

### 1. Create an Admin User
Use the existing create-admin endpoint:

```bash
curl -X POST http://localhost:3000/api/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass123",
    "name": "Admin User"
  }'
```

### 2. Create a Regular User
Use the existing create-admin endpoint with `isAdmin: false`:

```bash
curl -X POST http://localhost:3000/api/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "userpass123",
    "name": "Regular User"
  }'
```

### 3. Test Admin Review Sections

#### For Admin Users:
1. Sign in with admin credentials
2. Navigate to `/events` or `/resources`
3. Admin review sections should be visible
4. Should be able to approve/reject pending items

#### For Regular Users:
1. Sign in with regular user credentials
2. Navigate to `/events` or `/resources`
3. Admin review sections should NOT be visible
4. Should NOT be able to access admin-only endpoints

### 4. Test API Endpoints

#### Admin-only endpoints (should return 403 for non-admin users):
- `GET /api/events/pending`
- `GET /api/resources/pending`
- `POST /api/events/approve`
- `POST /api/events/reject`
- `POST /api/resources/approve`
- `POST /api/resources/reject`

#### User-specific endpoints (should work for authenticated users):
- `GET /api/auth/current-user`
- `POST /api/events/submit`
- `POST /api/resources/submit`

## OAuth Authentication
The system now properly supports OAuth authentication through:
- Google OAuth (`/api/auth/google`)
- Brightspace OAuth (`/api/auth/brightspace`)

When users authenticate through OAuth, their user data is stored in cookies and the system properly identifies their admin status.

## Security Notes
- All admin-only endpoints now properly check authentication and admin status
- User data is read from secure cookies instead of hardcoded values
- API endpoints return appropriate HTTP status codes (401 for unauthenticated, 403 for unauthorized)
- Admin review sections are only rendered for users with admin privileges

# Formly - Quick Start Guide

## Overview

Formly is a complete forms management system built following the same architecture patterns as your Assist project. It supports multi-tenant domains, JWT authentication, form building, and submission management.

## Installation

All dependencies are already installed! The database has been created and Prisma client generated.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3005`

### Production Build

```bash
npm run build
npm run preview
```

## Key Routes

### Admin Routes (Require Admin Token)

**Forms Dashboard**
- URL: `/.well-known/placenet/admin?token=YOUR_JWT_TOKEN`
- Create, view, edit, delete forms
- Toggle form active/inactive status
- View submission counts

**Form Builder**
- URL: `/admin/forms/[hashid]?token=YOUR_JWT_TOKEN`
- Visual form builder with drag-and-drop field types
- Support for 9 field types:
  - Text, Textarea, Email, Number, Phone, Date
  - Dropdown, Radio buttons, Checkboxes
- Required field validation
- Field reordering

**Submissions Viewer**
- URL: `/admin/submissions/[hashid]?token=YOUR_JWT_TOKEN`
- View all form submissions
- Export to CSV or JSON
- Beautiful card-based layout

### User Routes (Public)

**Form Filling**
- URL: `/form/[hashid]?token=YOUR_JWT_TOKEN` (token optional)
- Clean, modern form interface
- Client and server-side validation
- Success confirmation screen

**Integration Endpoint**
- URL: `/.well-known/placenet/views`
- Returns available admin views for parent app integration

## Architecture Highlights

### Following Assist Patterns

✅ **Multi-Tenancy**
- Domain-based isolation (domain_id)
- Avatar-based user separation
- All data scoped to domain

✅ **Authentication**
- JWT with JWKS validation
- Same auth.js implementation
- Token via headers, query params, or postMessage

✅ **Database**
- SQLite with Prisma ORM
- Same schema patterns (domains → resources → nested data)
- Cascade deletes for cleanup

✅ **Routing**
- SvelteKit file-based routing
- Server actions for mutations
- +page.server.js for data loading

✅ **UI/UX**
- Svelte 5 with runes ($state, $effect, $props)
- Tailwind CSS (v4)
- Enhanced forms with use:enhance
- Responsive design

✅ **Deployment**
- Dockerfile following assist pattern
- Environment-based configuration
- Ready for Kubernetes

## Data Flow

### Admin Creates Form
1. Admin accesses `/.well-known/placenet/admin?token=JWT`
2. Clicks "Create New Form"
3. Enters title and description
4. Redirected to Form Builder
5. Adds fields, configures options
6. Saves form

### User Fills Form
1. User accesses `/form/[hashid]?token=JWT` (or without token)
2. Fills out form fields
3. Client validates required fields
4. Submits to server
5. Server validates and stores submission
6. Success screen shown

### Admin Views Submissions
1. Admin accesses `/admin/submissions/[hashid]?token=JWT`
2. Views all submissions in cards
3. Can export to CSV or JSON

## Environment Variables

Required in `.env`:

```env
DATABASE_URL=file:./database.sqlite
VITE_JWKS_ENDPOINT=https://api.example.com/.well-known/jwks.json
HASHID_SALT=your_random_salt_here
```

## Form Field Types

| Type | Description | Options |
|------|-------------|---------|
| Text | Single-line text input | Placeholder, Required |
| Textarea | Multi-line text | Placeholder, Required |
| Email | Email validation | Placeholder, Required |
| Number | Numeric input | Placeholder, Required |
| Tel | Phone number | Placeholder, Required |
| Date | Date picker | Required |
| Select | Dropdown menu | Custom options, Required |
| Radio | Radio buttons | Custom options, Required |
| Checkbox | Multiple selection | Custom options, Required |

## API Endpoints

### Form Submission
```
POST /form/[hashid]?/submit&token=JWT
Content-Type: multipart/form-data

field_[id]: value
```

### Admin Actions
```
POST /.well-known/placenet/admin?/createForm&token=JWT
POST /.well-known/placenet/admin?/deleteForm&token=JWT
POST /.well-known/placenet/admin?/toggleActive&token=JWT

POST /admin/forms/[hashid]?/updateForm&token=JWT
```

## Database Schema

```prisma
domains {
  domain_id String @id
  forms []
}

forms {
  id Int @id
  domain_id String
  title String
  description String?
  fields String // JSON
  is_active Boolean
  submissions []
}

submissions {
  id Int @id
  form_id Int
  domain_id String
  avatar_id String
  data String // JSON
}
```

## Docker Deployment

```bash
# Build
docker build -t formly .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=file:./database.sqlite \
  -e VITE_JWKS_ENDPOINT=https://api.example.com/.well-known/jwks.json \
  -e HASHID_SALT=your_salt \
  formly
```

## Integration with Parent Apps

Formly can be embedded in iframes and communicates via postMessage (same as Assist):

```javascript
// Parent app
iframe.contentWindow.postMessage({
  type: 'auth',
  token: 'YOUR_JWT_TOKEN'
}, '*');

// Formly sends READY signal when loaded
window.addEventListener('message', (event) => {
  if (event.data === 'READY') {
    // Send auth token
  }
});
```

## Next Steps

1. **Test locally**: Run `npm run dev` and visit `http://localhost:3005`
2. **Update JWT endpoint**: Change `VITE_JWKS_ENDPOINT` in `.env` to your actual JWKS endpoint
3. **Generate JWT tokens**: Create admin and user tokens with proper claims:
   - `domain_id`: Your organization ID
   - `avatar_id`: User identifier
   - `role`: 'admin' for admin access
4. **Access admin**: Navigate to `/.well-known/placenet/admin?token=YOUR_ADMIN_TOKEN`
5. **Create your first form**: Click "Create New Form" and start building!

## Troubleshooting

**Build fails?**
- Ensure all dependencies are installed: `npm install`
- Regenerate Prisma client: `npx prisma generate`

**Database errors?**
- Run `npx prisma db push` to sync schema
- Check DATABASE_URL in .env

**Authentication fails?**
- Verify VITE_JWKS_ENDPOINT is correct
- Ensure JWT token has required claims (domain_id, role)
- Check token expiration

## Features Comparison with Assist

| Feature | Assist | Formly |
|---------|--------|--------|
| Multi-tenancy | ✅ | ✅ |
| JWT/JWKS Auth | ✅ | ✅ |
| Prisma + SQLite | ✅ | ✅ |
| SvelteKit | ✅ | ✅ |
| Svelte 5 Runes | ✅ | ✅ |
| Tailwind CSS | ✅ | ✅ |
| Docker Deploy | ✅ | ✅ |
| Admin Interface | ✅ | ✅ |
| User Interface | Chat UI | Form Filling UI |
| Domain Resource | Threads | Forms |
| Nested Resource | Messages | Submissions |
| Special Feature | OpenAI + RAG | Form Builder |

Both systems share the same core architecture, making it easy to understand and maintain!

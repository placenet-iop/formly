# Formly - Forms Management System

A modern, multi-tenant forms system built with SvelteKit, following the same architecture patterns as the Assist project.

## Features

### Admin Features
- 📝 Create and manage forms with a visual form builder
- 🎨 Support for multiple field types:
  - Text input, textarea, email, number, phone, date
  - Dropdown (select), radio buttons, checkboxes
- ✅ Required field validation
- 🔄 Activate/deactivate forms
- 📊 View submissions in a beautiful interface
- 📥 Export submissions to CSV or JSON
- 🗑️ Delete forms (with cascade deletion of submissions)

### User Features
- 📄 Fill out forms with a clean, modern interface
- ✔️ Client and server-side validation
- ✅ Success confirmation after submission
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: SvelteKit 2.x + Svelte 5 (with runes)
- **Backend**: SvelteKit server routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with JWKS validation
- **Styling**: Tailwind CSS
- **Deployment**: Docker + Kubernetes

## Architecture

### Multi-Tenancy
- Domain-based isolation (each organization has a separate `domain_id`)
- Avatar-based user separation within domains
- All data is scoped to the domain

### Authentication
- JWT tokens validated using JWKS endpoint
- Token can be passed via:
  - `x-auth-token` header
  - `token` query parameter
  - postMessage (for iframe embedding)

### Data Model
```
domains
├── forms (one-to-many)
│   └── submissions (one-to-many)
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

The app will be available at `http://localhost:3005`

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=file:./database.sqlite
VITE_JWKS_ENDPOINT=https://api.example.com/.well-known/jwks.json
HASHID_SALT=your_random_salt_here
```

## Routes

### Admin Routes (requires admin role)
- `/.well-known/placenet/admin?token=<jwt>` - Forms management dashboard
- `/admin/forms/[hashid]?token=<jwt>` - Form builder/editor
- `/admin/submissions/[hashid]?token=<jwt>` - View submissions

### User Routes (public)
- `/form/[hashid]?token=<jwt>` - Fill out a form

### API Routes
- `/.well-known/placenet/views` - List available admin views (for integration)

## Deployment

### Docker

```bash
# Build image
docker build -t formly .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=file:./database.sqlite \
  -e VITE_JWKS_ENDPOINT=https://api.example.com/.well-known/jwks.json \
  -e HASHID_SALT=your_salt \
  formly
```

### Kubernetes

Similar to the Assist project deployment pattern.

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Form Builder

The form builder allows you to:

1. **Add fields** - Click field types from the sidebar
2. **Configure fields** - Set labels, placeholders, required status
3. **Reorder fields** - Use up/down arrows
4. **Add options** - For select, radio, and checkbox fields
5. **Delete fields** - Remove unwanted fields

## Submission Viewing

View all form submissions with:
- Organized cards showing all responses
- Filter by submission ID or user
- Export to CSV or JSON
- Responsive design for mobile viewing

## Integration

This system can be embedded in iframes and communicates via postMessage, following the same pattern as the Assist project.

## License

MIT

# SewingGem Email Creator

A lightweight email template management system that enables easy creation and management of email templates with dynamic placeholders.

## Features

- **Admin Dashboard**: Secure login for template management
- **Template Creation**: Create reusable email templates with markdown support
- **Dynamic Placeholders**: Use {{PLACEHOLDER_NAME}} syntax for dynamic content
- **Public Access**: Share template URLs with query parameters for instant personalization
- **Copy to Clipboard**: One-click copying of generated emails

## Tech Stack

- **Framework**: Next.js 15.4 with React 19
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Authentication**: JWT-based auth
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd email-creator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sewinggem_email"
JWT_SECRET="your-very-secure-jwt-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-very-secure-nextauth-secret"
ADMIN_USERNAME="gemma"
ADMIN_PASSWORD="changethispassword"
```

4. Set up the database:
```bash
npm run db:push
npm run db:generate
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Usage

### Admin Access

1. Navigate to `/login`
2. Login with your admin credentials
3. Create and manage templates from the dashboard

### Creating Templates

Templates support markdown and placeholders:
- Use `{{PLACEHOLDER_NAME}}` for dynamic content
- Placeholders must be UPPERCASE with underscores
- Example: `{{CUSTOMER_NAME}}`, `{{ORDER_NUMBER}}`

### Public Template Access

Access templates via: `/template/[template-slug]`

Add query parameters for placeholders:
```
/template/welcome?CUSTOMER_NAME=John&EMAIL=john@example.com
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `DATABASE_URL` (use Vercel Postgres)
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Deploy

### Database Setup on Vercel

1. Create a Vercel Postgres database
2. Copy the connection string to `DATABASE_URL`
3. Run migrations:
```bash
npx prisma db push
npx prisma db seed
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Admin dashboard
│   ├── login/          # Login page
│   ├── template/       # Public template viewer
│   └── templates/      # Template editor pages
├── components/         # React components
│   ├── ui/            # UI components
│   ├── admin/         # Admin-specific components
│   └── public/        # Public-facing components
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication helpers
│   ├── db.ts          # Database connection
│   ├── markdown.ts    # Markdown processing
│   └── placeholder.ts # Placeholder handling
└── types/             # TypeScript type definitions
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Protected admin routes with middleware
- Sanitized markdown output to prevent XSS
- URL parameters are properly decoded and sanitized

## License

Private - SewingGem Internal Use Only

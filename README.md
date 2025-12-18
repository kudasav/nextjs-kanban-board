##  Next JS Kanban Board

A modern, full-stack kanban board application built with Next.js, TypeScript, and Supabase

### Features:

* Drag-and-drop task management with ([@hello-pangea/dnd](https://github.com/hello-pangea/dnd))
* User authentication (JWT + Google OAuth)
* Support for multiple users
* Support for multiple project boards
* Real-time data persistence with ([Supabase](https://supabase.com))

### Getting Started

#### Prerequisites:

* Node.js 20.x or higher
* npm or yarn package manager
* A Supabase account ([sign up here](https://supabase.com))
* Supabase CLI ([installation guide](https://supabase.com/docs/guides/cli))

#### Project setup:

Clone the repo

```bash
git clone https://bla
```

Install dependancies

```bash
yarn install
```

#### Environment Variables:

Create a `.env.local` file in the root directory with the following variables:

| variable | description |
| ----------------------| ------------------------ |
| NEXT_PUBLIC_BASE_URL | Base URL for the application (e.g., http://localhost:3000) |
| JWT_SECRET | Secret key for JWT token encryption (min 32 characters) |
| SUPABASE_ACCESS_TOKEN | Personal access token for Supabase API authentication |
| NEXT_PUBLIC_SUPABASE_URL | URL of your Supabase project |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Anonymous/public key for Supabase client-side access |
| NEXT_PUBLIC_OAUTH_CLIENT | Google OAuth 2.0 client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth 2.0 client secret |
| GOOGLE_REDIRECT_URI | OAuth callback URL (e.g., http://localhost:3000/sso) |

#### Database setup:

Link your supabase project:

```bash
supabase login
```

```bash
supabase link
```

Run supabase migrations to create the required tables from the app's schema:

```bash
supabase db push
```


### Future Improvements:

- [ ] Email notification functionality for user updates and account recovery
- [ ] Support for multiple collaborators on boards

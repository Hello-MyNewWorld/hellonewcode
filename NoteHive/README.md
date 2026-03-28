# NoteHive

A complete, production-ready note-taking web app with Vanilla JS, Supabase Auth/Database/Storage, responsive design, dark/light mode, markdown editor, Pomodoro timer, global search, tags, todos, stats dashboard, and full CRUD functionality.

## Features

- 🔐 **Supabase Authentication** (Email/Password & Google Sign-In)
- 📝 **Rich Note Taking** with tagging system
- 🎯 **Task Management** (To-Do Lists)
- 📊 **Statistics Dashboard** with charts
- ⏰ **Pomodoro Timer** for productivity
- 🌙 **Dark/Light Mode** with theme persistence
- 🔍 **Global Search** across notes and tags
- 📱 **Responsive Design** for all devices
- ☁️ **File Storage** with Supabase Storage

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase Console](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Get your project URL and anon key from the API settings
4. Create a bucket named "notehive-uploads" in the Storage section

### 2. Configuration

1. Replace the placeholder values in `src/js/supabase-config.js` with your actual Supabase config:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Database Tables

Create these tables in your Supabase database:

#### Notes Table
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  content TEXT,
  tags TEXT[],
  files JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  modified_at TIMESTAMP DEFAULT NOW()
);
```

#### Todos Table
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Supabase Security Rules

Set up Row Level Security (RLS) for your tables:

```sql
-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Todos policies
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Supabase Storage Security Rules

Set up these security rules in your Supabase Storage:

```
bucket notehive-uploads {
  allow upload: if (exists (auth.uid));
  allow download: if (exists (auth.uid));
  allow delete: if (exists (auth.uid));
}
```

### 6. Authentication Providers

Enable Email and Google authentication in your Supabase project:
1. Go to Authentication → Settings
2. Enable Email signup
3. Enable Google OAuth provider
4. Configure Google OAuth credentials

## Deployment

### Using any static hosting service:

1. Upload all files from the `src` directory to your hosting service
2. Configure your domain settings if needed

## Project Structure

```
NoteHive/
├── src/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── supabase-config.js
│   │   ├── auth.js
│   │   ├── app.js
│   │   ├── editor.js
│   │   ├── todos.js
│   │   ├── stats.js
│   │   ├── theme.js
│   │   └── pomodoro.js
│   └── assets/
└── README.md
```

## Development

To run locally:

1. Serve the `src` directory using any local server:
```bash
# If you have Python installed
python -m http.server 8000

# Or with Node.js (install live-server first)
npx live-server --port=8000
```

2. Visit `http://localhost:8000` in your browser

## Customization

- **Styling**: Modify `src/css/styles.css` to change the look and feel
- **Functionality**: Extend modules in the `src/js/` directory
- **Features**: Add new components by creating additional JavaScript modules

## Dependencies

- [Supabase SDK](https://supabase.com/docs/guides/getting-started/tutorials/with-javascript)
- [Font Awesome](https://fontawesome.com/) (for icons)
- [Chart.js](https://www.chartjs.org/) (for statistics)

All dependencies are loaded via CDN in the `index.html` file.

## Browser Support

NoteHive works on all modern browsers that support:
- ES6 JavaScript
- Supabase v2+
- CSS Grid and Flexbox

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Supabase for backend services
- Font Awesome for icons
- Chart.js for data visualization
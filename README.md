# Post + Nested Comments System

A modern Next.js application with post creation and infinitely nested comments. Features drag & drop uploads, emoji picker, local GIF search, and dark mode - all without external APIs.

## 📸 Screenshots

> **Note:** Add screenshots in the `screenshots/` folder and update the paths below.

### Main Feed (Light Mode)
<img width="1119" height="867" alt="Screenshot 2025-12-11 190034" src="https://github.com/user-attachments/assets/2be40f63-2c9e-4d37-b5d3-14d5b6457018" />


### Dark Mode
<img width="1147" height="863" alt="Screenshot 2025-12-11 190100" src="https://github.com/user-attachments/assets/4941436f-ac64-454d-bb9a-f036903c4655" />


### Nested Comments
<img width="980" height="566" alt="Screenshot 2025-12-11 190142" src="https://github.com/user-attachments/assets/0574026a-f67a-43bf-ad7f-198a1e588dc4" />


### Post Creation
<img width="1180" height="542" alt="Screenshot 2025-12-11 190122" src="https://github.com/user-attachments/assets/e9e84f1d-53dc-4b15-b4a5-1f28dcea3688" />


## ✨ Features

**Core Functionality**
- Create posts with text and file uploads (images/documents)
- Multi-post feed with social media-style layout
- Infinite nested comments with visual threading
- Rich comment content: text, emojis, images, and GIFs
- Per-post comment counting and threading
- Collapse/expand comment threads

**Enhanced UX**
- Drag & drop file uploads
- Dark mode with localStorage persistence
- Local GIF search and filtering
- Real-time preview for uploads
- Smooth animations and transitions
- Performance optimized (memoization, memory management)

**Technical**
- In-memory mock backend (RESTful API)
- No external APIs or databases
- TypeScript with strict typing
- Responsive design for all devices

## 🛠️ Tech Stack

- **Next.js ** (App Router) with TypeScript
- **Tailwind CSS ** (modern styling with custom variants)
- **emoji-picker-react** (local emoji selection)
- **date-fns** (timestamp formatting)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**Available Commands**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
post-comments-app/
├── app/
│   ├── api/
│   │   ├── comments/route.ts    # Comment API
│   │   └── post/route.ts        # Post API
│   ├── globals.css              # Global styles + dark mode
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main feed page
├── components/
│   ├── PostForm.tsx             # Post creation with drag & drop
│   ├── PostView.tsx             # Post display
│   ├── CommentSection.tsx       # Comments container
│   ├── CommentForm.tsx          # Comment form with emoji/GIF
│   └── CommentItem.tsx          # Individual comment (nested)
├── data/
│   └── store.ts                 # In-memory storage
├── lib/
│   └── buildCommentTree.ts      # Nested comment tree builder
├── public/
│   └── gifs.json                # Local GIF database
└── types/
    └── index.ts                 # TypeScript definitions
```

## 💾 Data Models

### Post Type
```typescript
type Post = {
  id: string;
  username: string;
  text: string;
  fileUrl?: string;       // base64 or blob URL
  fileName?: string;
  createdAt: string;      // ISO string
};
```

### Comment Type
```typescript
type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  text?: string;
  image?: string;         // base64 or blob URL
  gif?: string;           // URL from gifs.json
  createdAt: string;
};
```

## 🎨 UI/UX Highlights

- Modern gradient design with glass-morphism effects
- Dark mode toggle with system preference detection
- Drag & drop file uploads with preview
- Smooth animations and micro-interactions
- Visual threading with collapse/expand
- Real-time comment counting
- Responsive for mobile/tablet/desktop

## 📝 Usage

**Create a Post**
- Type your message (required)
- Drag & drop or click to upload image/file
- Click "Post" to publish

**Add Comments**
- Click "Add comment" on any post
- Type text and optionally add emoji/image/GIF
- Hit "Comment" to submit

**Reply to Comments**
- Click "Reply" on any comment
- Nested reply form appears inline
- Supports same features as top-level comments

**Dark Mode**
- Click the sun/moon icon in header
- Preference saved to localStorage

## ✅ Assignment Compliance

**Core Requirements**
- Next.js App Router + TypeScript
- Post creation (text + file upload)
- Image/file preview & base64 conversion
- Post display (username, timestamp, content, comment count)
- Infinite nested comments with visual indentation
- Comments support: text, emojis, images, GIFs
- Mock backend API (in-memory storage)
- No external APIs or databases

**Bonus Features**
- Drag & drop uploads
- Local GIF search
- Dark mode toggle
- Thread animations
- Optimistic UI updates
- Performance optimizations

## 💡 Technical Notes

**Storage**: In-memory server-side arrays. Data resets on server restart (intentional per requirements).

**Dark Mode**: Uses Tailwind v4 custom variant (`@custom-variant dark`) for proper class-based theming.

**Performance**: Optimized with React hooks (`useCallback`, `useMemo`) and memory leak prevention.

**GIF Data**: Stored in `public/gifs.json`. Add more GIFs by updating the JSON file with local GIF URLs.

## 📄 License

Demo project for assignment purposes.

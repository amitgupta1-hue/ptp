# Chat History Sidebar Feature

## Overview
The chat interface now includes a **right sidebar** that displays your chat history, allowing you to manage multiple conversations and see statistics about your chats.

## Features

### 🗂️ Chat History Table
- **Visual list** of all your chat sessions
- **Click to load** any previous conversation
- **Delete button** to remove unwanted chats (hover to see)
- **Active indicator** shows current chat with blue highlight

### ✨ Each Chat Entry Shows:
- **Title**: First message of the conversation (truncated)
- **Date**: When the chat was created (YYYY-MM-DD format)
- **Message Count**: Total number of messages in the chat
- **Preview**: Last message snippet

### 🆕 New Chat Button
- **Plus (+) icon** button in the sidebar header
- Click to **start a fresh conversation**
- Clears current messages and resets context

### 📊 Statistics Panel
Located at the bottom of the sidebar:
- **Total Chats**: Number of all saved conversations
- **Today**: Number of chats created today

## How to Use

### Starting a New Chat
1. Click the **[+]** button in the sidebar header
2. Current chat clears
3. Start typing your new message

### Loading Previous Chat
1. Browse the **Chat History** list in the sidebar
2. Click on any chat entry
3. That chat becomes active (highlighted in blue)
4. *(Note: In this demo, messages aren't persisted yet)*

### Deleting a Chat
1. Hover over any chat entry
2. **Delete icon** (trash) appears on the right
3. Click the delete icon
4. Chat is removed from history
5. If it was the active chat, a new blank chat starts

### Chat Auto-Save
- Chats are **automatically created** when you send your first message
- The **title** is taken from your first message (max 40 chars)
- **Message count** updates as conversation grows
- **Last message preview** updates with each AI response

## UI Layout

```
┌─────────────────────────────────────────────┬──────────────────────┐
│                                             │  Chat History        │
│                                             │  [+] New Chat        │
│           Chat Interface                    ├──────────────────────┤
│           (Main Area)                       │  ┌─────────────────┐ │
│                                             │  │ Chat Title      │ │
│  • Welcome Screen                           │  │ Date • 8 msgs   │ │
│  • Message Bubbles                          │  │ Last message... │ │
│  • Input Area                               │  └─────────────────┘ │
│  • Repository Selector                      │                      │
│                                             │  ┌─────────────────┐ │
│                                             │  │ Another Chat    │ │
│                                             │  │ Date • 12 msgs  │ │
│                                             │  │ Preview text... │ │
│                                             │  └─────────────────┘ │
│                                             ├──────────────────────┤
│                                             │  Total Chats: 3      │
│                                             │  Today: 1            │
└─────────────────────────────────────────────┴──────────────────────┘
```

## Visual Design

### Colors
- **Active Chat**: Blue background (#EFF6FF) with blue border (#1268FB)
- **Hover State**: Blue border with subtle shadow
- **Delete Button**: Red on hover (#DC2626)
- **Stats**: Large blue numbers (#1268FB) in Georgia serif

### Dimensions
- **Sidebar Width**: 340px on desktop
- **Chat Entry**: Rounded corners (10px), padding (12px)
- **Spacing**: 10px between entries

### Responsive Behavior
On mobile (< 880px):
- Sidebar moves **below** the chat interface
- Width becomes **100%**
- Max height of **300px** for scrolling

## Sample Chat Sessions

The app comes with 3 demo chat sessions:

1. **"Next.js Setup Help"**
   - Date: 2026-06-17
   - 8 messages
   - Last: "Great! That worked perfectly."

2. **"React Hooks Question"**
   - Date: 2026-06-16
   - 12 messages
   - Last: "Thanks for the explanation!"

3. **"API Integration"**
   - Date: 2026-06-15
   - 5 messages
   - Last: "How do I handle errors?"

## Technical Details

### State Management
```javascript
const [chatSessions, setChatSessions] = useState([
  { id, title, date, msgCount, lastMsg }
]);
const [currentSessionId, setCurrentSessionId] = useState(null);
```

### Functions
- `startNewChat()` - Creates a blank chat
- `loadChatSession(sessionId)` - Loads existing chat (demo only)
- `deleteChatSession(sessionId)` - Removes chat from history

### Auto-Save Logic
- First message: Creates new session
- Subsequent messages: Updates message count and preview
- Uses `Date.now()` as unique session ID
- Title: First 40 characters of first message

## Future Enhancements

### Planned Features
- [ ] **Persist chats** to localStorage or database
- [ ] **Load actual messages** when clicking a chat
- [ ] **Search/filter** chat history
- [ ] **Sort by date** or message count
- [ ] **Export chat** as text/PDF
- [ ] **Rename chat** custom titles
- [ ] **Pin important** chats to the top
- [ ] **Archive old** chats
- [ ] **Share chat** with others

### Storage Implementation
```javascript
// Example localStorage integration
const saveChat = (session, messages) => {
  localStorage.setItem(`chat_${session.id}`, JSON.stringify({
    session,
    messages,
    repos: selectedRepos
  }));
};

const loadChat = (sessionId) => {
  const data = localStorage.getItem(`chat_${sessionId}`);
  return JSON.parse(data);
};
```

## Keyboard Shortcuts (Future)
- `Ctrl+N` / `Cmd+N` - New chat
- `Ctrl+K` / `Cmd+K` - Search chats
- `Ctrl+D` / `Cmd+D` - Delete current chat

## Examples

### Example 1: Creating Your First Chat
```
1. Open the app (Chat tab is default)
2. Type: "How do I use React hooks?"
3. Press Enter
4. New chat appears in sidebar titled "How do I use React hooks?"
5. Message count shows: "2 messages"
6. Continue conversation...
```

### Example 2: Switching Between Chats
```
1. Start chat about "Next.js routing"
2. Click [+] to start new chat
3. Ask about "CSS Grid layout"
4. Click the first chat in sidebar
5. It becomes active (blue highlight)
6. Click [+] to create a third new chat
```

### Example 3: Deleting Old Chats
```
1. Hover over any chat in the sidebar
2. Trash icon appears on the right
3. Click the trash icon
4. Chat is removed
5. If it was active, new blank chat starts
```

## Troubleshooting

### Sidebar Not Showing
- **Check screen width**: Sidebar is on the right on desktop (> 880px)
- **On mobile**: Scroll down to see it below the chat

### Chats Not Saving
- Currently **demo mode**: chats are saved in component state only
- They will **reset** when you refresh the page
- See "Future Enhancements" for persistence

### Delete Button Hidden
- **Hover over** the chat entry
- Delete button has **fade-in effect** on hover
- Click it while hovering

### Active Chat Not Highlighting
- Click the chat entry again
- Ensure `currentSessionId` matches chat ID
- Check browser console for errors

## Styling Classes

```css
.chat-layout          // Flex container for chat + sidebar
.chat-sidebar         // Sidebar container (340px)
.chat-sidebar-header  // Header with title + new chat button
.new-chat-btn         // Plus button to start new chat
.chat-history-list    // Scrollable list of chats
.chat-history-item    // Individual chat entry
.chat-history-item.active  // Active chat (blue highlight)
.chat-history-delete  // Trash icon button
.chat-stats           // Statistics panel at bottom
.chat-stat-item       // Individual stat (Total / Today)
```

## Build Status

✅ **Build Successful**  
📦 **Bundle Size**: 12.8 kB (+0.7 kB from chat history feature)  
🚀 **First Load JS**: 100 kB  
✅ **No Errors**  
✅ **No Warnings**  

## Summary

The chat history sidebar adds powerful conversation management to your Blueprint app:
- ✅ See all your past conversations
- ✅ Start new chats anytime
- ✅ Delete unwanted chats
- ✅ Track chat statistics
- ✅ Clean, intuitive UI
- ✅ Mobile responsive

Perfect for managing multiple topics, contexts, and repository-specific conversations!

---

**Built on**: June 17, 2026  
**Version**: 1.1.0  
**Technology**: Next.js 14, React 18

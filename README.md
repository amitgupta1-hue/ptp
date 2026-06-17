# Blueprint - Policybazaar Internal Knowledge Layer

A Next.js application showcasing an internal knowledge management system with live JIRA integration, requirement solutioning, and automated workflow from requirements to deployment.

## Features

- **Knowledge Base**: Query indexed codebase, services, and live JIRA issues
- **Living Documentation**: Auto-generated docs from connected repos
- **Requirement Drafts**: Capture and track requirements from Slack
- **Solutioning Engine**: AI-powered requirement analysis and refinement
- **BRD Generation**: Automated Business Requirement Document creation
- **JIRA Integration**: Convert requirements into JIRA stories
- **Self-Ship**: AI-generated code changes with PR creation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
blueprint/
├── app/
│   ├── components/
│   │   ├── Blueprint.js    # Main component
│   │   └── data.js         # JIRA data and constants
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Home page
├── package.json
├── next.config.js
└── README.md
```

## Usage

### Navigation

The app has 7 main sections accessible from the left sidebar:

1. **Knowledge** - Ask questions about the codebase
2. **Docs** - Browse living documentation
3. **Drafts** - View requirement drafts from Slack
4. **Solutioning** - Refine requirements through Q&A
5. **BRD** - Review generated Business Requirement Documents
6. **JIRA** - Create and track JIRA stories
7. **Ship** - Self-ship small stories with AI-generated code

### API Integration

The app uses Claude AI API for intelligent processing. You'll need to:

1. Set up an Anthropic API key
2. Update the API endpoint in `Blueprint.js` if needed

**Note**: The current implementation makes direct API calls from the client. For production, move API calls to server-side API routes.

## Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (React)
- **Styling**: CSS Modules (inline styles in globals.css)
- **AI**: Claude API integration

## Development

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Notes

- JIRA writes are simulated (demo mode)
- API calls require proper authentication
- This is a demonstration/hackathon project

## License

Internal use only - Policybazaar

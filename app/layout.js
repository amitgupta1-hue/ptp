import './globals.css'

export const metadata = {
  title: 'Blueprint - Policybazaar Internal Knowledge Layer',
  description: 'Live JIRA index and codebase knowledge for Phoenix/POSP',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

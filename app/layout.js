import './globals.css'

export const metadata = {
  title: 'AlphaLens — AI Investment Research',
  description: 'Multi-agent AI investment research powered by LangGraph and Gemini. Get comprehensive financial analysis, risk assessment, and investment decisions in seconds.',
  keywords: 'investment research, AI, LangGraph, stock analysis, financial analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#080b11" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

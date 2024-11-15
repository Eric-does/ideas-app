'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)
  
  // Check if user exists in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleSignIn = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    
    const newUser = {
      id: crypto.randomUUID(), // Generate a random ID
      name: username,
      created_at: new Date().toISOString()
    }
    
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
    setUsername('')
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="p-4 border-b">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Ideas App</h1>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Signed in as {user.name}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-48"
                />
                <Button type="submit">
                  Sign In
                </Button>
              </form>
            )}
          </div>
        </header>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}

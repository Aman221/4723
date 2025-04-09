"use client"

import { LogOut, Shield, FileText } from "lucide-react"

interface UserMenuProps {
  onClose: () => void
  username: string
  isDarkMode: boolean
}

export default function UserMenu({ onClose, username, isDarkMode }: UserMenuProps) {
  return (
    <div
      className={`absolute top-20 right-8 z-50 w-64 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl overflow-hidden`}
    >
      <div className={`p-4 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white dark:text-white font-medium">Hi {username}!</p>
            <p className="text-white/70 dark:text-white/70 text-sm">Personal Account</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <a
          href="#"
          className="flex items-center gap-3 p-3 text-white dark:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </a>
      </div>

      <div className={`p-4 border-t ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
        <div className="space-y-2">
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 text-white/70 dark:text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm"
          >
            <Shield className="h-4 w-4" />
            <span>Privacy Policy</span>
          </a>
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 text-white/70 dark:text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Terms of Service</span>
          </a>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Check, Moon, Sun } from "lucide-react"

// Predefined background options
const backgroundOptions = {
  light: [
    {
      id: "solid-light",
      url: "#F5F5F5",
      thumbnail: "#F5F5F5",
      name: "Solid Light",
      isSolidColor: true,
    },
    {
      id: "mountain-light",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=200&auto=format&fit=crop",
      name: "Mountain Landscape",
    },
    {
      id: "forest-light",
      url: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=200&auto=format&fit=crop",
      name: "Forest",
    },
  ],
  dark: [
    {
      id: "solid-dark",
      url: "#1A1A1A",
      thumbnail: "#1A1A1A",
      name: "Solid Dark",
      isSolidColor: true,
    },
    {
      id: "night-sky",
      url: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=2072&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=200&auto=format&fit=crop",
      name: "Night Sky",
    },
    {
      id: "aurora",
      url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=200&auto=format&fit=crop",
      name: "Aurora",
    },
  ],
}

interface SettingsModalProps {
  onClose: () => void
  currentBackground: string
  setCurrentBackground: (url: string) => void
  isDarkMode: boolean
  setIsDarkMode: (isDark: boolean) => void
}

export default function SettingsModal({
  onClose,
  currentBackground,
  setCurrentBackground,
  isDarkMode,
  setIsDarkMode,
}: SettingsModalProps) {
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("")
  const [activeTab, setActiveTab] = useState("backgrounds")

  const handleBackgroundSelect = (url: string, isSolidColor?: boolean) => {
    if (isSolidColor) {
      setCurrentBackground(url)
    } else {
      setCurrentBackground(url)
    }
  }

  const handleModeToggle = (isDark: boolean) => {
    setIsDarkMode(isDark)
    // Automatically select the first background of the selected mode if current doesn't match the mode
    const currentMode = isDark ? "dark" : "light"
    const currentModeBackgrounds = backgroundOptions[currentMode]
    const isCurrentBackgroundInMode = currentModeBackgrounds.some((bg) => bg.url === currentBackground)

    if (!isCurrentBackgroundInMode) {
      setCurrentBackground(currentModeBackgrounds[0].url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className={`${isDarkMode ? "bg-gray-800" : "bg-gray-100"} rounded-xl border ${isDarkMode ? "border-white/20" : "border-gray-400"} shadow-xl w-full max-w-2xl mx-4 overflow-hidden`}
      >
        <div
          className={`flex justify-between items-center p-4 border-b ${isDarkMode ? "border-white/20" : "border-gray-400"}`}
        >
          <h2 className="text-xl font-semibold text-white dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white dark:text-white/70 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className={`flex border-b ${isDarkMode ? "border-white/20" : "border-gray-400"} mb-6`}>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "backgrounds" ? "text-white dark:text-white border-b-2 border-white" : "text-white/70 dark:text-white/70"}`}
              onClick={() => setActiveTab("backgrounds")}
            >
              Backgrounds
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "appearance" ? "text-white dark:text-white border-b-2 border-white" : "text-white/70 dark:text-white/70"}`}
              onClick={() => setActiveTab("appearance")}
            >
              Appearance
            </button>
          </div>

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white dark:text-white mb-4">Theme</h3>

              <div className="flex gap-4">
                <button
                  onClick={() => handleModeToggle(false)}
                  className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-lg border ${
                    !isDarkMode
                      ? `border-white ${isDarkMode ? "bg-white/20" : "bg-white/30"}`
                      : `${isDarkMode ? "border-white/20" : "border-gray-400"} hover:bg-white/10`
                  } transition-colors`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-yellow-200 flex items-center justify-center">
                    <Sun className="h-8 w-8 text-yellow-600" />
                  </div>
                  <span className="text-white dark:text-white font-medium">Light Mode</span>
                  {!isDarkMode && (
                    <div className="bg-white/90 rounded-full p-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleModeToggle(true)}
                  className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-lg border ${
                    isDarkMode
                      ? `border-white ${isDarkMode ? "bg-white/20" : "bg-white/30"}`
                      : `${isDarkMode ? "border-white/20" : "border-gray-400"} hover:bg-white/10`
                  } transition-colors`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                    <Moon className="h-8 w-8 text-yellow-200" />
                  </div>
                  <span className="text-white dark:text-white font-medium">Dark Mode</span>
                  {isDarkMode && (
                    <div className="bg-white/90 rounded-full p-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "backgrounds" && (
            <div>
              <h3 className="text-lg font-medium text-white dark:text-white mb-4">Background</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-white dark:text-white font-medium mb-3">
                    {isDarkMode ? "Dark Mode Backgrounds" : "Light Mode Backgrounds"}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {backgroundOptions[isDarkMode ? "dark" : "light"].map((bg) => (
                      <div
                        key={bg.id}
                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 
                          ${currentBackground === bg.url ? "ring-2 ring-white scale-[1.02]" : "hover:scale-[1.02]"}`}
                        onClick={() => handleBackgroundSelect(bg.url, bg.isSolidColor)}
                      >
                        <div className="aspect-video relative">
                          {bg.isSolidColor ? (
                            <div className="w-full h-full" style={{ backgroundColor: bg.url }} />
                          ) : (
                            <Image
                              src={bg.thumbnail || "/placeholder.svg"}
                              alt={bg.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                          {currentBackground === bg.url ? (
                            <div className="bg-white/90 rounded-full p-1">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <span className="text-white dark:text-white font-medium">Select</span>
                          )}
                        </div>
                        <div className="p-2 text-white dark:text-white text-sm font-medium bg-black/30">{bg.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white dark:text-white font-medium mb-3">Custom Background URL</h4>
                  <div className="flex">
                    <input
                      type="url"
                      value={customBackgroundUrl}
                      onChange={(e) => setCustomBackgroundUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`flex-1 ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/80 border-gray-400"} border rounded-l-md px-4 py-2 text-white dark:text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30`}
                    />
                    <button
                      onClick={() => {
                        if (customBackgroundUrl.trim()) {
                          setCurrentBackground(customBackgroundUrl)
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`flex justify-end p-4 border-t ${isDarkMode ? "border-white/20" : "border-gray-400"}`}>
          <button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

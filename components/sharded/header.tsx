"use client"

import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { User, LogOut } from "lucide-react"
import { ModeToggle } from "../mode-toggle"
import { CustomTrigger } from "../custom-sidebar-trigger"

const Header = () => {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const user = Cookies.get("user") 
    setLoggedIn(!!user)
  }, [])

  const handleLogout = () => {
    Cookies.remove("user", { path: "/" })
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="flex h-16 items-center justify-between px-6 max-w-screen-2xl mx-auto">
        
        {/* Left side */}
        <div className="flex items-center gap-3">
          <CustomTrigger />
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              المهدي للمقاولات العامة
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <LogOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm hidden sm:block text-gray-700 dark:text-gray-300">
               Logout
              </span>
            </button>
          ) : (
           null
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header

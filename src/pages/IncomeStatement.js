"use client"

import { useState, useEffect } from "react"
import Header from "../components/Header"
import Sidebar from "../components/SideBar"
import RevenueTracker from "../components/RevenueTracker"
import ExpensesTracker from "../components/ExpenseTracker"
import NetProfitTracker from "../components/NetProfitTracker"

const IncomeStatement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    return savedDarkMode ? JSON.parse(savedDarkMode) : false
  })

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 transition-colors duration-500`}
    >
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar} />}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Income Statement</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <RevenueTracker darkMode={darkMode} />
              <ExpensesTracker darkMode={darkMode} />
              <NetProfitTracker darkMode={darkMode} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default IncomeStatement


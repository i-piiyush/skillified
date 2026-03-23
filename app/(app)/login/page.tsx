"use client"
import axios from 'axios'
import React, { useState } from 'react'

const Page = () => {
    const [data,setData] = useState({
        name: '',
        domain: ''
    })

    const handleSubmit = async (e)=>{
        e.preventDefault()
        try {
            console.log(data)
            const res = await axios.post("/api/start-test",data)
            console.log("res: ",res)
        } catch (error) {
            console.log("error : ",error)
        }
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Login</h1>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.name}
              onChange={(e) => setData({...data, name: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-slate-700 mb-1">
              Domain
            </label>
            <input 
              type="text" 
              id="domain" 
              name="domain" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={data.domain}
              onChange={(e) => setData({...data, domain: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
            onClick={handleSubmit}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default Page
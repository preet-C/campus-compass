import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'

export default function Admin() {
  const [name, setName] = useState(''); const [lat, setLat] = useState('')
  const [lng, setLng] = useState(''); const [cat, setCat] = useState('Academic')

  async function addBuilding() {
    await supabase.from('buildings').insert({ name, category: cat, lat: parseFloat(lat), lng: parseFloat(lng), icon: '📍' })
    alert('Building Added!')
    setName(''); setLat(''); setLng('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="font-bold">Add Building</h2>
          <input placeholder="Name" className="w-full border p-2" value={name} onChange={e => setName(e.target.value)} />
          <select className="w-full border p-2" value={cat} onChange={e => setCat(e.target.value)}>
            <option>Academic</option><option>Food</option><option>Hostel</option><option>Admin</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Lat" className="border p-2" value={lat} onChange={e => setLat(e.target.value)} />
            <input placeholder="Lng" className="border p-2" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
          <button onClick={addBuilding} className="w-full bg-green-600 text-white py-2 rounded">Add</button>
        </div>
      </div>
    </div>
  )
}
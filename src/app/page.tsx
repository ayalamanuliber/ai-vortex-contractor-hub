export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">AI Vortex - Contractor Intelligence Hub</h1>
        <p className="text-lg mb-8">System is loading...</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Intelligence Mode</h3>
            <p className="text-slate-300">Contractor analysis and insights</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Execution Mode</h3>
            <p className="text-slate-300">Campaign management and tracking</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Data Integration</h3>
            <p className="text-slate-300">CSV and JSON data processing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
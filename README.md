# AI Vortex - Contractor Intelligence Hub

A complete Next.js application for contractor intelligence analysis and campaign execution.

## 🚀 Features

- **Intelligence Mode**: View contractor completion scores, website performance, and business insights
- **Execution Mode**: Manage email campaigns, track progress, and monitor responses
- **Real-time Data**: CSV/JSON integration with bidirectional sync
- **Advanced Filtering**: Filter by location, scores, categories, and campaign status
- **Campaign Calendar**: Visual campaign scheduling and tracking
- **Responsive Design**: Glassmorphism UI with dark theme

## 📊 Data Integration

- **CSV Integration**: Contractor master sheet (46MB+) with lazy loading
- **Campaign Data**: JSON database with email sequences and timing
- **Business ID Matching**: Automatic sync between CSV and campaign data

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design
- **State Management**: Zustand
- **Data Processing**: PapaParse for CSV handling
- **UI Components**: Custom built with Lucide React icons
- **Deployment**: Optimized for Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd contractor-intelligence-hub-v4
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add your data files:**
   - Place your contractor CSV file in `public/data/contractors.csv`
   - Place your campaign JSON file in `public/data/campaigns.json`

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Vercel

### Option 1: Direct Import from Git

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Vortex Contractor Hub"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/ayalamanuliber/ai-vortex-contractor-hub.git
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub repository
   - Deploy automatically!

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   │   ├── contractors/
│   │   └── campaigns/
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/          # React components
│   ├── Navigation/     # Top navigation
│   ├── Sidebar/        # Filter sidebar
│   ├── ContractorCard/ # Intelligence & execution cards
│   ├── Calendar/       # Campaign calendar
│   └── ProfileModal/   # Contractor profiles
├── lib/                # Utilities and services
│   ├── services/       # Data services
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
└── stores/             # Zustand stores
```

## 🎨 Features

### Intelligence Mode
- Completion score visualization
- Website performance metrics
- Business health indicators
- Review activity analysis

### Execution Mode
- Campaign progress tracking
- Email sequence management
- Timing optimization
- Status monitoring

### Advanced Filtering
- Location-based filtering
- Score range selection
- Category grouping
- Campaign status sorting

## 📈 Performance Optimizations

- **Lazy Loading**: Load contractors in chunks of 100
- **Caching**: API response caching (5 minutes)
- **Memory Management**: Efficient data structures
- **Infinite Scroll**: Load more data on demand

## 🔧 Configuration

The app works with your existing data files:
- `CONTRACTORS - Master_Sheet.csv` (46MB contractor database)
- `MASTER_CAMPAIGN_DATABASE.json` (campaign data)

No additional configuration needed - just deploy and go!

## 🔄 **SYNC MANUAL - Proceso de Sincronización**

### **1. Verificar estado del sistema:**
```bash
cd /Users/manuayala/Documents/LAGOS/03_CONTRACTOR_INTELLIGENCE_HUB/contractor-intelligence-hub-v4
python3 scripts/sync_system.py --status
```

### **2. Sync de nombres pendientes:**
```bash
# Ver cambios pendientes de nombres
curl http://localhost:3000/api/contractors/update-nombre

# Aplicar cambios pendientes al CSV principal
python3 scripts/sync_system.py --sync-master-to-working
```

### **3. Sync de campaigns:**
```bash
# Copiar campaigns desde root al sistema
cp campaigns.json public/data/campaigns.json
cp campaigns.json /Users/manuayala/Documents/LAGOS/02_CAMPAIGN_GENERATOR/data/MASTER_CAMPAIGN_DATABASE.json

# Ejecutar sync de campaigns
python3 scripts/sync_system.py --sync-campaigns
```

### **4. Sync completo (Todo junto):**
```bash
python3 scripts/sync_system.py --full-sync
```

### **5. Backup antes de cambios importantes:**
```bash
python3 scripts/sync_system.py --backup
```

### **Sistema de Nombres Temporal:**
- ✅ Los nombres se guardan temporalmente en `public/data/nombre_changes.json`
- ✅ Se ven inmediatamente en la app sin necesidad de sync
- ✅ Cuando hagas sync, se aplican permanentemente al CSV
- ✅ Compatible con Vercel (sin dependencias Python en producción)

## 📧 Contact

**GitHub**: ayalamanuliber  
**Email**: canoes.aprons.0k@icloud.com

---

**Ready for Vercel deployment! 🚀**
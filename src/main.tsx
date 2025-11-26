import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './app/globals.css'
import { AuthProvider } from './components/providers/auth-provider'
import { LanguageProvider } from './components/providers/language-provider'
import { Toaster } from 'sonner'
import { TenantDashboard } from './components/tenant/tenant-dashboard'
import { LandlordDashboard } from './components/landlord/landlord-dashboard'
import { Navbar } from './components/layout/navbar'

function App() {
    return (
        <StrictMode>
            <LanguageProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-background">
                            <Navbar />
                            <Routes>
                                <Route path="/" element={
                                    <div className="container mx-auto px-4 py-16">
                                        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Roomivo</h1>
                                        <p className="text-center text-muted-foreground mb-8">
                                            Your trusted housing platform for France
                                        </p>
                                        <div className="flex gap-4 justify-center">
                                            <a href="/tenant" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                                                Tenant Dashboard
                                            </a>
                                            <a href="/landlord" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90">
                                                Landlord Dashboard
                                            </a>
                                        </div>
                                    </div>
                                } />
                                <Route path="/tenant" element={<TenantDashboard />} />
                                <Route path="/landlord" element={<LandlordDashboard />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                        <Toaster />
                    </BrowserRouter>
                </AuthProvider>
            </LanguageProvider>
        </StrictMode>
    )
}

createRoot(document.getElementById('root')!).render(<App />)

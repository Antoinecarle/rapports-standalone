import { useState } from 'react'
import RapportDetail from '@/components/RapportDetail'
import { Toaster } from "@/components/ui/toaster"
import { useRapportData } from '@/hooks/useRapportData'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  const [isOpen, setIsOpen] = useState(true)

  // Charger les données réelles depuis data.json
  const { data, isLoading, isError, error, reload } = useRapportData()

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={reload} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  // Pas de données
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
          <Button onClick={reload} variant="outline">
            Recharger
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <RapportDetail
        rapport={data.rapport}
        rapportData={data}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
      <Toaster />
    </div>
  )
}

export default App


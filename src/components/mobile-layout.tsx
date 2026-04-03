import React from 'react'
import { ChefHat, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface MobileLayoutProps {
  children: React.ReactNode
  title: string
  showBottomNav?: boolean
}

export function MobileLayout({ children, title, showBottomNav = false }: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 py-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Separator />
                <nav className="flex flex-col space-y-2">
                  <Button variant="secondary" className="justify-start" onClick={() => setIsMenuOpen(false)}>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Recipes
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className={showBottomNav ? 'flex-1 pb-16' : 'flex-1'}>{children}</main>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-center px-4">
            <Button variant="secondary" className="flex h-auto flex-col items-center space-y-1 py-2">
              <ChefHat className="h-5 w-5" />
              <span className="text-xs">Recipes</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}

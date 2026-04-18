import React from 'react'
import { CalendarDays, ChefHat, Menu, ScrollText, BookOpen, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export type AppPage =
  | 'recipes'
  | 'menu'
  | 'schedule'
  | 'shopping-list'
  | 'recurring'
  | 'recipe-details'
  | 'recipe-create'

interface MobileLayoutProps {
  children: React.ReactNode
  title: string
  currentPage: AppPage
  onNavigate?: (page: AppPage) => void
  showBottomNav?: boolean
}

const navItems: Array<{ id: AppPage; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'recipes', label: 'Recipes', icon: ChefHat },
  { id: 'menu', label: 'Menu', icon: BookOpen },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'shopping-list', label: 'List', icon: ScrollText },
  { id: 'recurring', label: 'Recurring', icon: RefreshCcw },
]

export function MobileLayout({ children, title, currentPage, onNavigate, showBottomNav = false }: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const handleNavigate = (page: AppPage) => {
    onNavigate?.(page)
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
                  {navItems.map((item) => {
                    const Icon = item.icon

                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'secondary' : 'ghost'}
                        className="justify-start"
                        onClick={() => handleNavigate(item.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    )
                  })}
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div
            className="grid h-16 items-center gap-2 px-4"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'secondary' : 'ghost'}
                  className="flex h-auto flex-col items-center py-2"
                  onClick={() => onNavigate?.(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

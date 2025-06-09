"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, Search, Heart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon, User } from "lucide-react"
import { SearchInput } from "@/components/search-input"
import Image from "next/image"

export default function Navbar() {
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [pathname] = useState(usePathname())
  const router = useRouter()
  const isMobile = useMobile()
  const { user, logout, isAuthenticated } = useAuth()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const wishlistCount = wishlist.length

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/images/snapbuy-logo.jpeg"
                alt="SnapBuy Logo"
                fill
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 dark:from-white dark:to-gray-300 animate-shimmer logo-text">
                Snap
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-300 relative animate-shimmer logo-text">
                Buy
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse logo-dot"></span>
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>
          </Link>
        </div>

        {!isMobile && !isSearchOpen && (
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/add-product" className="text-sm font-medium transition-colors hover:text-primary">
              Add Product
            </Link>
            <div className="relative group">
              <button className="text-sm font-medium transition-colors hover:text-primary flex items-center">
                Categories
              </button>
              <div className="absolute left-0 top-full mt-2 w-48 rounded-md shadow-lg bg-card border hidden group-hover:block">
                <div className="py-1">
                  <Link href="/category/electronics" className="block px-4 py-2 text-sm hover:bg-muted">
                    Electronics
                  </Link>
                  <Link href="/category/clothing" className="block px-4 py-2 text-sm hover:bg-muted">
                    Clothing
                  </Link>
                  <Link href="/category/accessories" className="block px-4 py-2 text-sm hover:bg-muted">
                    Accessories
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isSearchOpen ? (
            <div className="flex-1 max-w-sm mr-2">
              <SearchInput placeholder="Search products..." showSuggestions={true} showHistory={false} />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="mr-2">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <ModeToggle />

          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {wishlistCount}
                </Badge>
              )}
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          )}
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="container pb-3">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/wishlist" className="text-sm font-medium transition-colors hover:text-primary">
              Wishlist
            </Link>
            <Link href="/add-product" className="text-sm font-medium transition-colors hover:text-primary">
              Add Product
            </Link>
            <details className="group">
              <summary className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Categories
              </summary>
              <div className="mt-2 ml-4 space-y-2">
                <Link href="/category/electronics" className="block text-sm hover:text-primary">
                  Electronics
                </Link>
                <Link href="/category/clothing" className="block text-sm hover:text-primary">
                  Clothing
                </Link>
                <Link href="/category/accessories" className="block text-sm hover:text-primary">
                  Accessories
                </Link>
              </div>
            </details>
          </nav>
        </div>
      )}
    </header>
  )
}

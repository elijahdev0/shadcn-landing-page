import {
  CircleUser,
  Menu,
  Package2,
  Search,
} from "lucide-react"

// Avatar components removed as they are no longer used in the simplified dashboard
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "react-router-dom" // Using Link from react-router-dom
import { useAuth } from "../contexts/AuthContext" // To get user info and logout
// import { useNavigate } from 'react-router-dom'; // Already imported at the bottom, ensure only one import
 
 // Unused example data removed
 // const recentSales = [ ... ];
 // const recentTransactions = [ ... ];
 
 export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // from react-router-dom, if needed for programmatic navigation

  const handleLogout = async () => {
    await logout();
    // navigate('/login'); // Or let ProtectedRoute handle redirect
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            to="#" // Changed from href
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" /> {/* TODO: Replace Package2 with your Logo Component/Image */}
            <span className="sr-only">EventSaaS</span> {/* Updated Brand Name */}
          </Link>
          <Link
            to="/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/guest-lists" // Added Guest Lists
            className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
          >
            Guest Lists
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                to="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" /> {/* TODO: Replace Package2 with your Logo Component/Image */}
                <span className="sr-only">EventSaaS</span> {/* Updated Brand Name */}
              </Link>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                to="/guest-lists" // Added Guest Lists
                className="text-muted-foreground hover:text-foreground"
              >
                Guest Lists
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || user?.email || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Placeholder for "Create New Event" Button */}
        <div className="mb-6">
          <Button size="lg" onClick={() => navigate('/create-event')}> {/* Ensure navigate is defined and imported if used here, or handle navigation differently */}
            Create New Event
          </Button>
        </div>

        {/* Placeholder for User's Events List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Events</h2>
          {/*
            This is where the list of events will be rendered.
            You might use a grid of Cards or a Table component.
            Example structure for an event item (to be repeated/mapped):
            <Card onClick={() => navigate('/event/EVENT_ID')} className="cursor-pointer">
              <CardHeader>
                <CardTitle>Event Name</CardTitle>
                <CardDescription>Event Date - Event Status</CardDescription>
              </CardHeader>
              <CardContent>
                <p>RSVPs: X / Y</p>
              </CardContent>
            </Card>
          */}
          <div className="border-dashed border-2 border-gray-300 p-8 rounded-lg text-center">
            <p className="text-muted-foreground">Your events will appear here.</p>
            <p className="text-sm text-muted-foreground">Click "Create New Event" to get started.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

// Need to add useNavigate import if not already present at the top
import { useNavigate } from 'react-router-dom';
import {
  CircleUser,
  Menu,
  Package2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Added useNavigate

  const handleLogout = async () => {
    await logout();
    // navigate('/login'); // Or let ProtectedRoute handle redirect
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="/dashboard" // Changed from # to /dashboard for a default home link
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
          to="/guest-lists"
          className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
        >
          Guest Lists
        </Link>
        {/* Add other main navigation links here if needed */}
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
              to="/dashboard" // Changed from #
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" /> {/* TODO: Replace Package2 with your Logo Component/Image */}
              <span className="sr-only">EventSaaS</span> {/* Updated Brand Name */}
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link
              to="/guest-lists"
              className="text-muted-foreground hover:text-foreground"
            >
              Guest Lists
            </Link>
            {/* Add other main navigation links here for mobile if needed */}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..." // Generic placeholder
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
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem> {/* Example navigation */}
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
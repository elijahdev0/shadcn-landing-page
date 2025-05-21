import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link and useNavigate
import { useAuth } from "../contexts/AuthContext"; // Added useAuth
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button, buttonVariants } from "./ui/button"; // Added Button
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { LogoIcon } from "./Icons";

interface RouteProps {
  href?: string; // Made href optional
  label: string;
  to?: string; // Optional: for react-router Link
  isExternal?: boolean;
  onClick?: () => void;
}

const routeList: RouteProps[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#testimonials",
    label: "Testimonials",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false); // Added state for scroll tracking
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false); // Close mobile menu if open
    navigate("/"); // Redirect to home after logout
  };

  const authRoutes: RouteProps[] = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { label: "Logout", onClick: handleLogout },
      ]
    : [
        { to: "/login", label: "Login" },
        // { to: "/signup", label: "Sign Up", isExternal: false }, // Removed Sign Up
      ];
  
  const allMobileRoutes = [...routeList, ...authRoutes]; // Removed GitHub from mobile routes


  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white dark:bg-background transition-shadow duration-200 ${
        scrolled ? "shadow-md border-b-[1px] dark:border-b-slate-700" : "border-b-[1px] border-transparent"
      }`}
    >
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <Link // Changed to Link
              to="/"
              className="ml-2 font-bold text-xl flex items-center" // Added items-center
            >
              <LogoIcon />
              <span className="ml-2">Eazy Invites</span> {/* Added span and ml-2 for spacing */}
            </Link>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <ModeToggle />

            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    Shadcn/React
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {allMobileRoutes.map((route) => (
                    route.to ? (
                      <Link
                        key={route.label}
                        to={route.to}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        {route.label}
                      </Link>
                    ) : route.onClick ? (
                       <Button
                        key={route.label}
                        variant="ghost"
                        onClick={() => { route.onClick?.(); setIsOpen(false);}}
                        className="w-full"
                      >
                        {route.label}
                      </Button>
                    ) : (
                      <a
                        key={route.label}
                        href={route.href}
                        target={route.isExternal ? "_blank" : undefined}
                        rel={route.isExternal ? "noreferrer noopener" : undefined}
                        onClick={() => setIsOpen(false)}
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        {route.label === "Github" && <GitHubLogoIcon className="mr-2 w-5 h-5" />}
                        {route.label}
                      </a>
                    )
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          {/* Landing page section links */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener" // Keep for hash links
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          {/* Auth links and other actions */}
          <div className="hidden md:flex gap-2 items-center"> {/* Added items-center */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-[17px] ${buttonVariants({ variant: "ghost" })}`}
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-[17px] ${buttonVariants({ variant: "ghost" })}`}
                >
                  Login
                </Link>
                {/* <Link
                  to="/signup"
                  className={`text-[17px] ${buttonVariants({ variant: "default" })}`} // Default for primary action
                >
                  Sign Up
                </Link> */} {/* Removed Sign Up button */}
              </>
            )}
            {/* GitHub link removed */}
            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

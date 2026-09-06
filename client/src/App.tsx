import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { About, CaseStudies, Contact, Home, Installations, NotFoundPage, Privacy, Repairs, Terms } from "./pages/SitePages";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/repairs" component={Repairs} /><Route path="/installations" component={Installations} /><Route path="/about" component={About} /><Route path="/case-studies" component={CaseStudies} /><Route path="/contact" component={Contact} /><Route path="/privacy" component={Privacy} /><Route path="/terms" component={Terms} /><Route component={NotFoundPage} /></Switch>;
}

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }

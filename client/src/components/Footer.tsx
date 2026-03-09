import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>© 2025 Cigar Calendar</span>
          <a
            href="https://instagram.com/cigarcalendar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md transition-all"
            data-testid="link-instagram"
          >
            <Instagram className="w-4 h-4" />
            <span>@cigarcalendar</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

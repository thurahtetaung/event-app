import Link from "next/link"
import { cn } from "@/lib/utils"
import { themeConfig } from "@/lib/theme"

interface SiteFooterProps {
  className?: string
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("w-full border-t bg-background", className)}>
      <div className="container h-16 flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          © 2024 {themeConfig.name}. All rights reserved.
        </p>
        <nav className="flex gap-4">
          {themeConfig.footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
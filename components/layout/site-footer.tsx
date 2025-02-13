import Link from "next/link"
import { themeConfig } from "@/lib/theme"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-between">
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
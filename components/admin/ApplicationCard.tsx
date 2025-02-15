"use client"

import { Building2, Calendar, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Application } from "@/types/admin"

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link href={`/admin/applications/${application.id}`} className="block mb-4">
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{application.organizationName}</h3>
                <Badge
                  variant={
                    application.status === "approved"
                      ? "success"
                      : application.status === "rejected"
                      ? "destructive"
                      : "default"
                  }
                  className={cn(
                    "capitalize",
                    application.status === "pending" && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {application.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{application.user.name}</span>
                <span>•</span>
                <span>{application.user.email}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={application.submittedAt}>
                    {format(new Date(application.submittedAt), "PPP")}
                  </time>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
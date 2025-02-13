import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const recentApplications = [
  { id: 1, orgName: "TechConf Inc.", email: "info@techconf.com", status: "pending" },
  { id: 2, orgName: "MusicFest Productions", email: "contact@musicfest.com", status: "approved" },
  { id: 3, orgName: "SportEvents LLC", email: "info@sportevents.com", status: "rejected" },
  { id: 4, orgName: "ArtGallery Co.", email: "gallery@artevents.com", status: "pending" },
]

export default function RecentApplications() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentApplications.map((app) => (
          <TableRow key={app.id}>
            <TableCell className="font-medium">{app.orgName}</TableCell>
            <TableCell>{app.email}</TableCell>
            <TableCell>
              <Badge
                variant={app.status === "approved" ? "success" : app.status === "rejected" ? "destructive" : "default"}
              >
                {app.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  getFacetedRowModel,
  getFacetedUniqueValues,
  FilterFn,
} from "@tanstack/react-table"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { Badge } from "@/components/ui/badge"
import { ApplicationActions } from "@/components/admin/ApplicationActions"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Application {
  id: string
  organizationName: string
  contactName: string
  email: string
  status: string
  submittedDate: string
}

// In a real app, this would be fetched from an API
const mockApplications: Application[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  organizationName: `Organization ${i + 1}`,
  contactName: `Contact ${i + 1}`,
  email: `org${i + 1}@example.com`,
  status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "approved" : "rejected",
  submittedDate: "2024-02-15",
}))

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "organizationName",
    header: "Organization",
  },
  {
    accessorKey: "contactName",
    header: "Contact Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "submittedDate",
    header: "Submitted Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "approved"
              ? "success"
              : status === "rejected"
              ? "destructive"
              : "outline"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ApplicationActions
        applicationId={row.original.id}
        applicationStatus={row.original.status}
      />
    ),
  },
]

const filters = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Approved", value: "approved" },
      { label: "Rejected", value: "rejected" },
    ],
  },
]

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const searchValue = value.toLowerCase()
  const orgName = row.getValue("organizationName")?.toString().toLowerCase() ?? ""
  const email = row.getValue("email")?.toString().toLowerCase() ?? ""

  return orgName.includes(searchValue) || email.includes(searchValue)
}

export default function ApplicationsPage() {
  const [data] = useState(mockApplications)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Review and manage organizer applications
        </p>
      </div>

      <Card>
        <DataTableToolbar
          table={table}
          globalFilter={true}
          placeholder="Search by organization or email..."
          filters={filters}
        />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    "group"
                  )}
                  onClick={() => window.location.href = `/admin/applications/${row.original.id}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="border-t">
          <DataTablePagination table={table} />
        </div>
      </Card>
    </div>
  )
}


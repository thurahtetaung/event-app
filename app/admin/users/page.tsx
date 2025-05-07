"use client"

import { useState, useEffect } from "react"
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
import { UserActions } from "@/components/admin/UserActions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await apiClient.admin.users.getAll();
      console.log("Users response:", response);
      return response as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  // Function to update user status
  const updateUserStatus = async (userId: string, status: "active" | "inactive" | "banned") => {
    try {
      console.log(`Updating user ${userId} status to ${status}`);
      const response = await apiClient.admin.users.updateUser(userId, { status });
      console.log("Update response:", response);
      return response;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  };

  // Function to delete a user
  const deleteUser = async (userId: string) => {
    try {
      console.log(`Deleting user ${userId}`);
      const response = await apiClient.admin.users.deleteUser(userId);
      console.log("Delete response:", response);
      return response;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  // Handler for status change
  const handleStatusChange = async (userId: string, newStatus: "active" | "inactive" | "banned") => {
    try {
      console.log(`Status change requested for user ${userId} to ${newStatus}`);
      const updatedUser = await updateUserStatus(userId, newStatus);

      // Update the local state
      setData(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error in handleStatusChange:", error);
    }
  };

  // Handler for user deletion
  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);

      // Update the local state
      setData(prev => prev.filter(user => user.id !== userId));

      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error in handleDelete:", error);
    }
  };

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const users = await fetchUsers();
        setData(users);
      } catch (error) {
        toast.error("Failed to load users");
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Define table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span>{`${row.original.firstName} ${row.original.lastName}`}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("role")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "active" ? "success" : "destructive"}
            className="capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <UserActions
          userId={row.original.id}
          userStatus={row.original.status}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "User", value: "user" },
        { label: "Organizer", value: "organizer" },
        { label: "Admin", value: "admin" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Banned", value: "banned" },
      ],
    },
  ];

  // Define fuzzy filter function
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const searchValue = value.toLowerCase();
    const name = `${row.original.firstName} ${row.original.lastName}`.toLowerCase();
    const email = row.getValue("email")?.toString().toLowerCase() ?? "";

    return name.includes(searchValue) || email.includes(searchValue);
  };

  // Initialize table
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
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <Card>
        <DataTableToolbar
          table={table}
          globalFilter={true}
          placeholder="Search by name or email..."
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    "group"
                  )}
                  onClick={(e) => {
                    // Don't navigate if the click was on or inside the actions cell
                    if (e.target instanceof Node && 
                        e.currentTarget.querySelector('[data-column="actions"]')?.contains(e.target)) {
                      return;
                    }
                    window.location.href = `/admin/users/${row.original.id}`;
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} data-column={cell.column.id}>
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
  );
}


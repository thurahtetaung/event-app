"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Ban, CheckCircle2, Trash2 } from "lucide-react"

interface UserActionsProps {
  userId: string
  userStatus: string
  onStatusChange: (userId: string, newStatus: "active" | "inactive" | "banned") => void | Promise<void>
  onDelete: (userId: string) => void | Promise<void>
}

export function UserActions({ userId, userStatus, onStatusChange, onDelete }: UserActionsProps): JSX.Element {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive" | "banned" | null>(null)
  const [status, setStatus] = useState(userStatus)
  const [isLoading, setIsLoading] = useState(false)

  const openStatusDialog = (newStatus: "active" | "inactive" | "banned") => {
    setPendingStatus(newStatus)
    setIsStatusDialogOpen(true)
  }

  const handleStatusConfirm = async () => {
    if (!pendingStatus) return

    setIsLoading(true)
    try {
      console.log(`UserActions: Confirmed status change to ${pendingStatus} for user ${userId}`)
      await onStatusChange(userId, pendingStatus)
      setStatus(pendingStatus)
      toast.success(`User status updated to ${pendingStatus}`)
    } catch {
      toast.error("Failed to update user status")
    } finally {
      setIsLoading(false)
      setIsStatusDialogOpen(false)
      setPendingStatus(null)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(userId);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const getStatusDialogContent = () => {
    if (pendingStatus === "active") {
      return {
        title: "Activate User",
        description: "Are you sure you want to activate this user? They will regain access to the platform.",
        action: "Activate",
      }
    } else if (pendingStatus === "inactive" || pendingStatus === "banned") {
      return {
        title: pendingStatus === "inactive" ? "Deactivate User" : "Ban User",
        description: `Are you sure you want to ${pendingStatus === "inactive" ? "deactivate" : "ban"} this user? They will lose access to the platform.`,
        action: pendingStatus === "inactive" ? "Deactivate" : "Ban",
      }
    }
    return { title: "", description: "", action: "" }
  }

  const { title, description, action } = getStatusDialogContent()

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "active" ? (
            <DropdownMenuItem
              onClick={() => openStatusDialog("inactive")}
              className="text-destructive focus:text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Deactivate User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => openStatusDialog("active")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Activate User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={pendingStatus === "active" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
            >
              {action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
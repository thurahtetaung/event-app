"use client"

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
import { Loader2 } from "lucide-react"

interface ApproveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading: boolean
  application: {
    application: {
      organizationName: string
    }
    applicant: {
      firstName: string
      lastName: string
    }
  }
}

export function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  application,
}: ApproveModalProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve the application for{" "}
            <span className="font-medium text-foreground">
              {application.application.organizationName}
            </span>{" "}
            submitted by{" "}
            <span className="font-medium text-foreground">
              {application.applicant.firstName} {application.applicant.lastName}
            </span>
            ?
            <br />
            <br />
            This will:
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Grant organizer privileges to the user</li>
              <li>Create an organization profile</li>
              <li>Send an approval notification email</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Approving..." : "Approve Application"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
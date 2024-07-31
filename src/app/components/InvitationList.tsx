"use client"

import { useOrganization } from '@clerk/nextjs';
import { OrganizationCustomRoleKey } from '@clerk/types';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

export const OrgMembersParams = {
  memberships: { pageSize: 5, keepPreviousData: true },
};

export const OrgInvitationsParams = {
  invitations: { pageSize: 5, keepPreviousData: true },
};

export const InviteMember = () => {
  const { isLoaded, organization, invitations } = useOrganization(OrgInvitationsParams)
  const [emailAddress, setEmailAddress] = useState("")
  const [role, setRole] = useState<OrganizationCustomRoleKey | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  if (!isLoaded || !organization) {
    return <div className="flex justify-center items-center h-32">Loading...</div>
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!emailAddress || !role) return

    setIsSubmitting(true)
    try {
      await organization.inviteMember({ emailAddress, role })
      await invitations?.revalidate?.()
      setEmailAddress("")
      setRole("")
      setMessage("Invitation sent successfully!")
    } catch (error) {
      setMessage("Failed to send invitation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite New Member</CardTitle>
        <CardDescription>Send an invitation to join your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <SelectRole
              value={role}
              onChange={(value) => setRole(value as OrganizationCustomRoleKey)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Invite Member
              </>
            )}
          </Button>
        </form>
        {message && (
          <Alert className={`mt-4 ${message.includes('successfully') ? 'bg-green-100' : 'bg-red-100'}`}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

type SelectRoleProps = {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const SelectRole = ({ value, onChange, isDisabled = false }: SelectRoleProps) => {
  const { organization } = useOrganization()
  const [fetchedRoles, setRoles] = useState<OrganizationCustomRoleKey[]>([])
  const isPopulated = useRef(false)

  useEffect(() => {
    if (isPopulated.current) return
    organization?.getRoles({ pageSize: 20, initialPage: 1 })
      .then((res) => {
        isPopulated.current = true
        setRoles(res.data.map((role) => role.key as OrganizationCustomRoleKey))
      })
  }, [organization?.id])

  if (fetchedRoles.length === 0) return null

  return (
    <Select value={value} onValueChange={onChange} disabled={isDisabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {fetchedRoles.map((roleKey) => (
          <SelectItem key={roleKey} value={roleKey}>
            {roleKey}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const InvitationList = () => {
  const { isLoaded, invitations, memberships } = useOrganization({
    ...OrgInvitationsParams,
    ...OrgMembersParams,
  });

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Manage invitations to your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations?.data?.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.emailAddress}</TableCell>
                <TableCell>{inv.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{inv.role}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await inv.revoke();
                      await Promise.all([
                        memberships?.revalidate,
                        invitations?.revalidate,
                      ]);
                    }}
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={!invitations?.hasPreviousPage || invitations?.isFetching}
            onClick={() => invitations?.fetchPrevious?.()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!invitations?.hasNextPage || invitations?.isFetching}
            onClick={() => invitations?.fetchNext?.()}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrganizationMembersManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <InviteMember />
      <InvitationList />
    </div>
  );
}
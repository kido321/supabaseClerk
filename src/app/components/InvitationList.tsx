"use client"

import { useOrganization } from '@clerk/nextjs';
import { OrganizationCustomRoleKey } from '@clerk/types';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';

export const OrgMembersParams = {
  memberships: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

export const OrgInvitationsParams = {
  invitations: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

// Form to invite a new member to the organization.
export const InviteMember = () => {
  const { isLoaded, organization, invitations } = useOrganization(OrgInvitationsParams)
  const [emailAddress, setEmailAddress] = useState("")
  const [disabled, setDisabled] = useState(false)

  if (!isLoaded || !organization) {
    return <>Loading</>
  }

  const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    const submittedData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as {
      email: string | undefined
      role: OrganizationCustomRoleKey | undefined
    }

    if (!submittedData.email || !submittedData.role) {
      return
    }

    setDisabled(true)
    await organization.inviteMember({
      emailAddress: submittedData.email,
      role: submittedData.role,
    })
    await invitations?.revalidate?.()
    setEmailAddress("")
    setDisabled(false)
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        name="email"
        type="text"
        placeholder="Email address"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <label>Role</label>
      <SelectRole fieldName={"role"} />
      <button type="submit" disabled={disabled}>
        Invite
      </button>
    </form>
  )
}

type SelectRoleProps = {
  fieldName?: string
  isDisabled?: boolean
  onChange?: ChangeEventHandler<HTMLSelectElement>
  defaultRole?: string
}

const SelectRole = (props: SelectRoleProps) => {
  const { fieldName, isDisabled = false, onChange, defaultRole } = props
  const { organization } = useOrganization()
  const [fetchedRoles, setRoles] = useState<OrganizationCustomRoleKey[]>([])
  const isPopulated = useRef(false)

  useEffect(() => {
    if (isPopulated.current) return
    organization
      ?.getRoles({
        pageSize: 20,
        initialPage: 1,
      })
      .then((res) => {
        isPopulated.current = true
        setRoles(
          res.data.map((roles) => roles.key as OrganizationCustomRoleKey)
        )
      })
  }, [organization?.id])

  if (fetchedRoles.length === 0) return null

  return (
    <select
      name={fieldName}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onChange={onChange}
      defaultValue={defaultRole}
    >
      {fetchedRoles?.map((roleKey) => (
        <option key={roleKey} value={roleKey}>
          {roleKey}
        </option>
      ))}
    </select>
  )
}

// List of pending invitations to an organization.
export const InvitationList = () => {
  const { isLoaded, invitations, memberships } = useOrganization({
    ...OrgInvitationsParams,
    ...OrgMembersParams,
  });

  if (!isLoaded) {
    return <>Loading</>;
  }

  return (
    <>
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b border-gray-200">User</th>
          <th className="py-2 px-4 border-b border-gray-200">Invited</th>
          <th className="py-2 px-4 border-b border-gray-200">Role</th>
          <th className="py-2 px-4 border-b border-gray-200">Actions</th>
        </tr>
      </thead>
      <tbody>
        {invitations?.data?.map((inv) => (
          <tr key={inv.id} className="hover:bg-gray-100">
            <td className="py-2 px-4 border-b border-gray-200">{inv.emailAddress}</td>
            <td className="py-2 px-4 border-b border-gray-200">{inv.createdAt.toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b border-gray-200">{inv.role}</td>
            <td className="py-2 px-4 border-b border-gray-200">
              <button
                className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-700"
                onClick={async () => {
                  await inv.revoke();
                  await Promise.all([
                    memberships?.revalidate,
                    invitations?.revalidate,
                  ]);
                }}
              >
                Revoke
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  
    <div className="mt-4 flex justify-between">
      <button
        className="bg-blue-500 text-white py-1 px-4 rounded disabled:opacity-50"
        disabled={!invitations?.hasPreviousPage || invitations?.isFetching}
        onClick={() => invitations?.fetchPrevious?.()}
      >
        Previous
      </button>
  
      <button
        className="bg-blue-500 text-white py-1 px-4 rounded disabled:opacity-50"
        disabled={!invitations?.hasNextPage || invitations?.isFetching}
        onClick={() => invitations?.fetchNext?.()}
      >
        Next
      </button>
    </div>
  </>
  
  );
};
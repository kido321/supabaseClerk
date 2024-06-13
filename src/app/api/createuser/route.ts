import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    
    
//     const response = await clerkClient.users.createUser({
//     firstName: "Test",
//     lastName: "User",
//     emailAddress: [ "testclerk123@gmail.com" ],
//     password: "kidusnega3",
//   })

//   console.log(response);
  const {userId, getToken ,orgId} = auth();

  const userid  = userId ? userId : "";
  console.log('userid',userid);
    console.log('orgid',orgId);

const response = await clerkClient.organizations.createOrganizationInvitation
({
     organizationId: orgId ? orgId : "",
     emailAddress: 'udemyfishaddisu@gmail.com', 
     inviterUserId: userid, 
     role: 'org:just_driver', redirectUrl: "http://localhost:3000/supabase" })

console.log(response);

}
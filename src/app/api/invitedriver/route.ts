import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: Request) {
    


  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }


const {userId,orgId} = auth();

const userid  = userId ? userId : "";


const response = await clerkClient.organizations.createOrganizationInvitation
({
     organizationId: orgId ? orgId : "",
     emailAddress:  email, 
     inviterUserId: userid, 
     role: 'org:just_driver', redirectUrl: "http://localhost:3000/signup" })
    // Here, you would handle the email invitation logic.
    // For example, sending an invitation email, saving to a database, etc.
//console.log(response);
    return NextResponse.json({ message: 'Invitation sent successfully!' }, { status: 200 });
  
  
  } catch (error:any) {
    console.log(error.errors[0].longMessage);
    return NextResponse.json({ message: error.errors[0].message}, { status: 500 });
  }
}

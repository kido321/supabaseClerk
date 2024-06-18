import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createSupabaseClient}  from "../../lib/supabase";
import { clerkClient } from '@clerk/nextjs/server';

const client = createSupabaseClient();

const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

const getUser_data = async (userId:string) => {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
    
    if (error) {
      console.error('Error fetching data:', error)
      return null
    } else {
      console.log('Data fetched:', data)
      return data
    }
  }

  const updateUser = async (userId:string, org_id:string , role:string) => {
    const { data, error } = await client
      .from('users')
      .update({ org_id: org_id  , role:role })
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating data:', error)
    } else {
      console.log('Data updated:', data)
    }
  }

export async function POST(req: Request) {

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }


  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id } = evt.data;
  const eventType = evt.type;

//   if(eventType === 'user.created'){
//     await delay(2000) 
// //
//     //const Org = await clerkClient.users.getOrganizationMembershipList({ userId: evt.data.id });
//   //  console.log(Org.data[0].organization)
//   await client.from("users").insert({
//     first_name: evt.data.first_name? evt.data.first_name : null,
//    // role: Org ? Org.data[0].role : null,
//     //org_id: Org ? Org.data[0].organization.id : null,
//     last_name: evt.data.last_name? evt.data.last_name : null,
//     email: evt.data.email_addresses?.[0]?.email_address? evt.data.email_addresses[0].email_address : null,
//     user_id: evt.data.id ? evt.data.id : null,
//     phone_number: evt.data.phone_numbers?.length > 0 ? evt.data.phone_numbers[0].phone_number : null,
//   });
//   }


// if(eventType === 'organizationInvitation.accepted'){
//     console.log('Organization invitation accepted')
//     await delay(2000) 
//     console.log('Delay done')
//     try{
//   const user:any =  getUser(evt.data.id);
//   if (user){
//     const newOrgid = evt.data.organization_id
//     const newRole = evt.data.role
//     await updateUser(evt.data.id, newOrgid , newRole)
//     console.log('User updated')
//   }
//   else{
//     console.log('User not found')
//   }
// }catch(e){
// console.log(e);
// }
//   }

console.log(eventType)

if(eventType === 'organizationMembership.created'){
  console.log('Organization membership updated')
  await delay(2000) 
 
const org_id = evt.data.organization.id;
const user_id  = evt.data.public_user_data.user_id;
const role = evt.data.role;
const user_object = await clerkClient.users.getUser(user_id);
const user_email = user_object.emailAddresses[0].emailAddress;
const user_phone = user_object.phoneNumbers[0] ?  user_object.phoneNumbers[0] : null ;
console.log(org_id,  user_id, role, user_email, user_phone)
const user:any =  getUser_data(user_id);
console.log('user', user)


  if (user){
    await updateUser(user_id, org_id , role)
  }

else{
  await client.from("users").insert({
    first_name: evt.data.public_user_data.first_name? evt.data.public_user_data.first_name : null,
    role: role ? role : null,
    org_id: org_id ? org_id : null,
    last_name: evt.data.public_user_data.last_name? evt.data.public_user_data.last_name : null,
    email: user_email ? user_email : null,
    user_id: user_id ? user_id : null,
    phone_number:  user_phone ? user_phone : null,
  });
}

 
}






  
  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  return new Response('', { status: 200 })
}
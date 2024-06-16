import { NextResponse } from 'next/server';

let drivers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  // Add more mock drivers as needed
];

export async function GET() {
  return NextResponse.json(drivers, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name } = body;

  if (!email || !name) {
    return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
  }

  const newDriver = {
    id: drivers.length + 1,
    name,
    email,
  };

  drivers.push(newDriver);

  return NextResponse.json(newDriver, { status: 201 });
}
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request) {
  try {
   
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/lines`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
        cache: "no-store", // prevent caching so we always get fresh data
      }
    );

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch lines" },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

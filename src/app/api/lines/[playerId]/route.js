import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { playerId } = params;

  try {
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lines/player/${playerId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch lines by player" },
        { status: apiResponse.status }
      );
    }

    console.log("API RESPONSE FOR GETTING LINES BY PLAYER");

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

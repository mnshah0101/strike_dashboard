import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(request, { params }) {
  const { lineId } = params;

  try {
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bets/line/${lineId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch bets by line" },
        { status: apiResponse.status }
      );
    }
    console.log("API RESPONSE FOR GETTING BETS BY LINE");

    console.log(apiResponse);

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

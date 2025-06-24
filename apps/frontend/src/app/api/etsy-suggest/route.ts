import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const etsyUrl = `https://www.etsy.com/search/suggestions?prefix=${encodeURIComponent(q)}`;
    const res = await fetch(etsyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    if (!res.ok) {
      console.error(`Etsy API request failed with status: ${res.status}`);
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const suggestions = (data.results || []).map((r: any) => r.query);
    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Error in etsy-suggest API route:", error);
    return NextResponse.json({ suggestions: [], error: "Failed to fetch suggestions" }, { status: 500 });
  }
} 
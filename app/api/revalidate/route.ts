import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");

  const expectedSecret = process.env.REVALIDATION_SECRET || "aninext-secret";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  if (!tag) {
    return NextResponse.json({ message: "Missing 'tag' parameter" }, { status: 400 });
  }

  try {
    const profileParam = searchParams.get("profile");
    const profile = profileParam || { expire: 0 };
    revalidateTag(tag, profile);
    return NextResponse.json({
      revalidated: true,
      tag,
      profile: profileParam || "immediate (expire: 0)",
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to revalidate tag", error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

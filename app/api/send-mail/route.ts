import { SendMail } from "@/src/lib/Mailer/Sendmail.lib";
import { NextRequest, NextResponse } from "next/server";

interface apiSendMailInterface {
  email: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  const request: apiSendMailInterface = await req.json();
  try {
    const config = new SendMail();
    const getTemplate = config.getTemplateHtml("notify.html");
    await config.sendTo({
      to: request.email,
      typeofmessage: "html",
      html: getTemplate,
      subject: "Thanks for subscribing! We'll notify you when C2 Panel launches.",
    });
    return NextResponse.json({ status: 200, message: "Thanks for subscribing!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

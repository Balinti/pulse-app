import { ServerClient } from 'postmark'

const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN!)

export async function sendDailyReminder(
  toEmail: string,
  userName: string
) {
  const htmlBody = `
    <p>Hi ${userName || 'there'},</p>
    <p>It's time for your daily check-in. Take 10 seconds to log how you're feeling today.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/checkin" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Check in now</a></p>
    <p>— Pulse</p>
  `

  const textBody = `Hi ${userName || 'there'},\n\nIt's time for your daily check-in. Take 10 seconds to log how you're feeling today.\n\nCheck in now: ${process.env.NEXT_PUBLIC_APP_URL}/checkin\n\n— Pulse`

  await client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: toEmail,
    Subject: 'Your daily Pulse check-in',
    HtmlBody: htmlBody,
    TextBody: textBody,
    MessageStream: 'outbound',
  })
}

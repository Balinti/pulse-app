import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const supabase = await createClient()

  const { error } = await supabase
    .from('calendar_accounts')
    .update({
      revoked_at: new Date().toISOString(),
      access_token_enc: '',
      refresh_token_enc: '',
    })
    .eq('user_id', user.id)
    .eq('provider', 'google')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Log audit event
  await supabase.from('audit_events').insert({
    user_id: user.id,
    type: 'calendar_disconnected',
    meta: { provider: 'google' },
  })

  return NextResponse.json({ ok: true })
}

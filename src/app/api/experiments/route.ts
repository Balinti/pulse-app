import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const { error: authError } = await requireUser()
  if (authError) return authError

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('experiments')
    .select('slug, title, duration_seconds, category, steps')
    .eq('is_active', true)
    .order('category')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ experiments: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const checkInSchema = z.object({
  date_local: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  energy: z.number().int().min(0).max(10),
  stress: z.number().int().min(0).max(10),
  tag_slugs: z.array(z.string()),
  note: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = checkInSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('checkins')
      .upsert(
        {
          user_id: user.id,
          date_local: validated.date_local,
          energy: validated.energy,
          stress: validated.stress,
          tag_slugs: validated.tag_slugs,
          note: validated.note || null,
        },
        { onConflict: 'user_id,date_local' }
      )
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ checkin_id: data.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const supabase = await createClient()

  let query = supabase
    .from('checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('date_local', { ascending: false })

  if (from) {
    query = query.gte('date_local', from)
  }
  if (to) {
    query = query.lte('date_local', to)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ checkins: data })
}

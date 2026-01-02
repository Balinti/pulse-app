import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { createClient } from '@/lib/supabase/server'
import { getExperimentBySlug } from '@/lib/db/queries'
import { z } from 'zod'

const logSchema = z.object({
  experiment_slug: z.string(),
  date_local: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['started', 'completed', 'skipped']),
})

const updateSchema = z.object({
  log_id: z.string().uuid(),
  next_day_outcome: z.enum(['better', 'same', 'worse']),
})

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = logSchema.parse(body)

    const experiment = await getExperimentBySlug(validated.experiment_slug)
    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('experiment_logs')
      .upsert(
        {
          user_id: user.id,
          experiment_id: experiment.id,
          date_local: validated.date_local,
          status: validated.status,
        },
        { onConflict: 'user_id,experiment_id,date_local' }
      )
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ log_id: data.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const supabase = await createClient()

    const { error } = await supabase
      .from('experiment_logs')
      .update({ next_day_outcome: validated.next_day_outcome })
      .eq('id', validated.log_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

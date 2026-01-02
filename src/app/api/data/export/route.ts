import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { exportUserData } from '@/lib/privacy/export'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    const data = await exportUserData(user.id)

    // Store as JSON in Supabase Storage (temp bucket)
    const supabase = await createClient()
    const fileName = `export-${user.id}-${Date.now()}.json`
    const fileContent = JSON.stringify(data, null, 2)

    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(fileName, fileContent, {
        contentType: 'application/json',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Fallback: return data directly
      return NextResponse.json(data)
    }

    // Generate signed URL (10 minutes)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(fileName, 600)

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError)
      return NextResponse.json(data)
    }

    // Log audit event
    await supabase.from('audit_events').insert({
      user_id: user.id,
      type: 'export_requested',
      meta: {},
    })

    return NextResponse.json({
      download_url: signedUrlData.signedUrl,
      expires_in_seconds: 600,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

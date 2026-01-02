import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { deleteUserAccount } from '@/lib/privacy/delete'

export async function POST() {
  const { user, error: authError } = await requireUser()
  if (authError) return authError

  try {
    await deleteUserAccount(user.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}

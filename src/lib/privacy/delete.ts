import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function deleteUserAccount(userId: string) {
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  // 1. Revoke calendar tokens
  await supabase
    .from('calendar_accounts')
    .update({
      revoked_at: new Date().toISOString(),
      access_token_enc: '',
      refresh_token_enc: '',
    })
    .eq('user_id', userId)

  // 2. Log audit event
  await supabase.from('audit_events').insert({
    user_id: userId,
    type: 'account_deleted',
    meta: { deleted_at: new Date().toISOString() },
  })

  // 3. Delete user from auth (this will cascade to all user data via foreign keys)
  const { error } = await serviceSupabase.auth.admin.deleteUser(userId)

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  return { success: true }
}

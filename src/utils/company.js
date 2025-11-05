import { supabase } from '@/supabaseClient'

export async function getCompanyProfile() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  if (error) {
    console.error('Gagal ambil profil perusahaan:', error)
    return null
  }
  return data
}

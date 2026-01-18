import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return NextResponse.json(data)
    } else {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dishes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('dishes')
      .insert([body])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dish' }, { status: 500 })
  }
}

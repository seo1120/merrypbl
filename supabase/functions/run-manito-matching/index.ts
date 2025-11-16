// @ts-ignore - Deno runtime imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore - Deno global
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch all participants
    const { data: participants, error: fetchError } = await supabase
      .from('manito_participants')
      .select('user_id')
      .order('joined_at', { ascending: true })

    if (fetchError) {
      throw fetchError
    }

    if (!participants || participants.length < 2) {
      return new Response(
        JSON.stringify({ error: '최소 2명 이상의 참가자가 필요합니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if matches already exist
    const { data: existingMatches, error: checkError } = await supabase
      .from('manito_matches')
      .select('id')
      .limit(1)

    if (checkError) {
      throw checkError
    }

    if (existingMatches && existingMatches.length > 0) {
      return new Response(
        JSON.stringify({ error: '이미 매칭이 완료되었습니다.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Randomize the list
    const shuffled = [...participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Create pairings (A->B, B->C, ..., Z->A)
    const matches = []
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i]
      const receiver = shuffled[(i + 1) % shuffled.length] // Wrap around to first person
      
      matches.push({
        giver_user_id: giver.user_id,
        receiver_user_id: receiver.user_id,
      })
    }

    // Insert matches into database
    const { data: insertedMatches, error: insertError } = await supabase
      .from('manito_matches')
      .insert(matches)
      .select()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${matches.length}개의 매칭이 완료되었습니다.`,
        matchesCount: matches.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})


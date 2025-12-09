// // useEmotionEvents.tsx (hook)
// import { supabase } from "../lib/supabaseClient"
// import { useEffect, useState } from 'react'

// export interface EmotionEvent {
// //   id: string
//   user_id: string
//   emotion: string
//   timestamp: any // shape depends on your engine; tighten as needed
// //   created_at: string
// }

// export function useEmotionEvents(userId?: string) {
//   const [events, setEvents] = useState<EmotionEvent[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     let isMounted = true
//     async function fetchEvents() {
//       setLoading(true)
//       setError(null)
//       try {
//         const query = supabase
//           .from('user_emotions')
//           .select('user_id, emotion, timestamp')
//           .order('created_at', { ascending: false })
//           .limit(200)

//         const finalQuery = userId ? query.eq('user_id', userId) : query

//         const { data, error } = await finalQuery

//         if (!isMounted) return

//         if (error) {
//           setError(error.message)
//           setEvents([])
//         } else {
//           setEvents(data || [])
//         }
//       } catch (err: any) {
//         setError(err.message)
//       } finally {
//         if (isMounted) setLoading(false)
//       }
//     }

//     fetchEvents()

//     return () => {
//       isMounted = false
//     }
//   }, [userId])

//   return { events, loading, error }
// }

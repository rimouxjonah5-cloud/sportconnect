import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DayPicker } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { format, isSameDay, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { listEvents, joinEvent } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import { EventCard } from '../components/EventCard'
import { EventForm } from '../components/EventForm'
import { SectionTitle } from '../components/SectionTitle'

export function Calendrier() {
  const { profile, userId } = useProfile()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showForm, setShowForm] = useState(false)

  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: listEvents })
  const events = eventsQuery.data ?? []
  const eventDates = events.map((e) => parseISO(e.event_date))
  const dayEvents = events.filter((e) => isSameDay(parseISO(e.event_date), selectedDate))

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="sc-calendar rounded-3xl border border-white/10 bg-white/[0.04] p-3">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          locale={fr}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{ hasEvent: 'has-event' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold capitalize text-white">
          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0b1020] hover:opacity-90"
        >
          <Plus size={16} />
          Évènement
        </button>
      </div>

      <section>
        <SectionTitle>Évènements du jour</SectionTitle>
        {dayEvents.length === 0 && <p className="text-sm text-white/40">Aucun évènement ce jour-là.</p>}
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              joined={userId ? event.participants.includes(userId) : false}
              onJoin={() => joinMutation.mutate(event.id)}
            />
          ))}
        </div>
      </section>

      {showForm && (
        <EventForm
          date={selectedDate}
          profile={profile}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['events'] })
          }}
        />
      )}
    </div>
  )
}

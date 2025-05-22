import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // For is_public
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/contexts/AuthContext'; // Assuming supabase client is exported from AuthContext
import { AppHeader } from '@/components/AppHeader';

export function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(''); // Consider using a date picker component
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create an event.');
      return;
    }
    if (!eventName.trim()) {
      setError('Event name is required.');
      return;
    }
    if (!eventDate) {
        setError('Event date is required.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          name: eventName,
          description,
          event_date: new Date(eventDate).toISOString(), // Ensure correct date format
          location,
          is_public: isPublic,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newEvent) {
        navigate(`/events/${newEvent.id}`); // Navigate to the new event's detail page
      } else {
        // Fallback if newEvent data isn't returned, though it should be with .single()
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex flex-1 justify-center items-start p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>Fill in the details below to create your event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Summer Music Festival"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about your event..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date & Time</Label>
                <Input
                  id="eventDate"
                  type="datetime-local" // HTML5 datetime input
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Central Park or Online"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic">Make event public?</Label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                      Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Event'}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
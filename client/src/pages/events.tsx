import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Users, Trophy, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const eventSignupSchema = z.object({
  motivation: z.string().min(10, "Please tell us why you want to join (minimum 10 characters)"),
  experience: z.string().min(1, "Please select your experience level"),
  expectations: z.string().min(5, "Please share your expectations (minimum 5 characters)"),
  dietaryRestrictions: z.string().optional(),
  emergencyContact: z.string().min(5, "Please provide emergency contact info"),
  tshirtSize: z.string().min(1, "Please select a t-shirt size"),
});

type EventSignupForm = z.infer<typeof eventSignupSchema>;

export default function EventsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchOnWindowFocus: false,
  });

  const { data: userEvents } = useQuery({
    queryKey: ["/api/user/events"],
    enabled: isAuthenticated,
  });

  const form = useForm<EventSignupForm>({
    resolver: zodResolver(eventSignupSchema),
    defaultValues: {
      motivation: "",
      experience: "",
      expectations: "",
      dietaryRestrictions: "",
      emergencyContact: "",
      tshirtSize: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: EventSignupForm & { eventId: number }) => {
      return await apiRequest("/api/user/events/" + data.eventId + "/participate", "POST", {
        expGained: 50,
        ...data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully signed up for the event!",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/user/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to sign up for events.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to sign up for event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access events and sign up.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-slate-500';
      case 'upcoming':
        return 'bg-[var(--accent-purple)]';
      case 'ongoing':
        return 'bg-[var(--accent-blue)]';
      default:
        return 'bg-slate-500';
    }
  };

  const isUserRegistered = (eventId: number) => {
    return Array.isArray(userEvents) && userEvents.some((participation: any) => participation.eventId === eventId);
  };

  const handleSignup = (event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    
    // Pre-fill form with user data if available
    if (user && typeof user === 'object' && 'email' in user) {
      form.setValue("emergencyContact", (user as any).email || "");
    }
  };

  const onSubmit = (data: EventSignupForm) => {
    if (selectedEvent) {
      signupMutation.mutate({
        ...data,
        eventId: selectedEvent.id,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--dark-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-[var(--dark-primary)] pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Club Events</h1>
            <p className="text-slate-400">Discover and join exciting game development events</p>
          </div>
          <Link
            href="/"
            className="bg-[var(--dark-secondary)] hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="gaming-card animate-pulse">
                <div className="h-48 bg-slate-600 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-6 bg-slate-500 rounded mb-3"></div>
                  <div className="h-16 bg-slate-600 rounded mb-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && Array.isArray(events) && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              const isRegistered = isUserRegistered(event.id);
              const isUpcoming = event.status.toLowerCase() === 'upcoming';
              
              return (
                <Card key={event.id} className="gaming-card card-hover-effect">
                  <div className="relative">
                    <img 
                      src={event.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&w=400&h=200&fit=crop"} 
                      alt={event.title} 
                      className="w-full h-48 object-cover rounded-t-lg" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-primary)]/80 via-transparent to-transparent rounded-t-lg"></div>
                    <Badge className={`absolute top-4 right-4 ${getStatusColor(event.status)} text-white`}>
                      {event.status}
                    </Badge>
                    {isRegistered && (
                      <Badge className="absolute top-4 left-4 bg-[var(--gaming-green)] text-white">
                        Registered
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-[var(--accent-blue)]">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Users className="h-4 w-4 mr-1" />
                        {event.participants}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3">{event.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-slate-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        Skill: <span className="text-[var(--accent-purple)] ml-1">{event.skillGained}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(event.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                    </div>
                    
                    {isRegistered ? (
                      <Button 
                        className="w-full bg-[var(--gaming-green)] hover:bg-green-600 text-white"
                        disabled
                      >
                        Already Registered
                      </Button>
                    ) : isUpcoming ? (
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] hover:from-blue-600 hover:to-purple-600 text-white"
                            onClick={() => handleSignup(event)}
                          >
                            Sign Up Now
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    ) : (
                      <Button 
                        className="w-full bg-slate-600 text-slate-400"
                        disabled
                      >
                        Event {event.status}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No events available at the moment</p>
          </div>
        )}

        {/* Event Signup Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="gaming-card max-w-2xl max-h-[80vh] overflow-y-auto dialog-content-no-scroll">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                Sign Up for: {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Why do you want to join this event?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us what motivates you to participate..."
                          className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[var(--dark-secondary)] border-slate-600 text-white">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">What do you expect to learn?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your learning goals and expectations..."
                          className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Emergency Contact</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Phone number or email"
                            className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tshirtSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">T-Shirt Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[var(--dark-secondary)] border-slate-600 text-white">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="xs">XS</SelectItem>
                            <SelectItem value="s">S</SelectItem>
                            <SelectItem value="m">M</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="xl">XL</SelectItem>
                            <SelectItem value="xxl">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Dietary Restrictions (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Any allergies or dietary requirements..."
                          className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {signupMutation.isPending ? "Signing Up..." : "Complete Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
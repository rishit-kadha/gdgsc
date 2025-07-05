import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Award, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Shield,
  Star,
  Trophy,
  Target,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["upcoming", "ongoing", "completed"]),
  participants: z.number().min(0, "Participants must be 0 or greater"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  skillGained: z.string().min(1, "Skill gained is required"),
});

const badgeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional(),
  color: z.string().optional(),
  requiredExp: z.number().min(0, "Required experience must be 0 or greater"),
});

const userExpFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  expToAdd: z.number().min(1, "Experience points must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
});

const userBadgeFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  badgeId: z.number().min(1, "Badge selection is required"),
});

const userRoleFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["member", "moderator", "admin"]),
});

type EventForm = z.infer<typeof eventFormSchema>;
type BadgeForm = z.infer<typeof badgeFormSchema>;
type UserExpForm = z.infer<typeof userExpFormSchema>;
type UserBadgeForm = z.infer<typeof userBadgeFormSchema>;
type UserRoleForm = z.infer<typeof userRoleFormSchema>;

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [isExpDialogOpen, setIsExpDialogOpen] = useState(false);
  const [isBadgeAssignDialogOpen, setIsBadgeAssignDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Check if user is admin (you can modify this logic based on your admin setup)
  const isAdmin = (user as any)?.email === "rkadha226@gmail.com"; // Replace with your admin email

  // Queries
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/badges"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: eventParticipations } = useQuery({
    queryKey: ["/api/admin/event-participations"],
    enabled: isAuthenticated && isAdmin,
  });

  // Forms
  const eventForm = useForm<EventForm>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      status: "upcoming",
      participants: 0,
      imageUrl: "",
      skillGained: "",
    },
  });

  const badgeForm = useForm<BadgeForm>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "",
      requiredExp: 0,
    },
  });

  const userExpForm = useForm<UserExpForm>({
    resolver: zodResolver(userExpFormSchema),
    defaultValues: {
      userId: "",
      expToAdd: 0,
      reason: "",
    },
  });

  const userBadgeForm = useForm<UserBadgeForm>({
    resolver: zodResolver(userBadgeFormSchema),
    defaultValues: {
      userId: "",
      badgeId: 0,
    },
  });

  const userRoleForm = useForm<UserRoleForm>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      return await apiRequest("/api/events", "POST", {
        ...data,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event created successfully!" });
      setIsEventDialogOpen(false);
      eventForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: handleMutationError,
  });

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      return await apiRequest(`/api/events/${editingEvent.id}`, "PUT", {
        ...data,
        date: new Date(data.date).toISOString(),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event updated successfully!" });
      setIsEventDialogOpen(false);
      setEditingEvent(null);
      eventForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: handleMutationError,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest(`/api/events/${eventId}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Event deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: handleMutationError,
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (data: BadgeForm) => {
      return await apiRequest("/api/badges", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Badge created successfully!" });
      setIsBadgeDialogOpen(false);
      badgeForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
    },
    onError: handleMutationError,
  });

  const addUserExpMutation = useMutation({
    mutationFn: async (data: UserExpForm) => {
      return await apiRequest("/api/admin/users/exp", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Experience points added successfully!" });
      setIsExpDialogOpen(false);
      userExpForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: handleMutationError,
  });

  const assignBadgeMutation = useMutation({
    mutationFn: async (data: UserBadgeForm) => {
      return await apiRequest("/api/admin/users/badge", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Badge assigned successfully!" });
      setIsBadgeAssignDialogOpen(false);
      userBadgeForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: handleMutationError,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: UserRoleForm) => {
      return await apiRequest("/api/admin/users/role", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User role updated successfully!" });
      setIsRoleDialogOpen(false);
      userRoleForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: handleMutationError,
  });

  function handleMutationError(error: Error) {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "Please log in again.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toast({
      title: "Error",
      description: error.message || "An error occurred. Please try again.",
      variant: "destructive",
    });
  }

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    eventForm.reset({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
      status: event.status,
      participants: event.participants,
      imageUrl: event.imageUrl || "",
      skillGained: event.skillGained,
    });
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--dark-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--dark-primary)] pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-[var(--accent-blue)]" />
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400">Manage your gaming club</p>
            </div>
          </div>
          <Link
            href="/"
            className="bg-[var(--dark-secondary)] hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">{(stats as any)?.members || 0}</p>
                </div>
                <Users className="h-8 w-8 text-[var(--accent-blue)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{stats?.events || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-[var(--accent-purple)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{stats?.projects || 0}</p>
                </div>
                <Target className="h-8 w-8 text-[var(--gaming-green)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Awards</p>
                  <p className="text-2xl font-bold text-white">{stats?.awards || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-[var(--accent-gold)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[var(--dark-secondary)]">
            <TabsTrigger value="events" className="text-white">Events</TabsTrigger>
            <TabsTrigger value="users" className="text-white">Users</TabsTrigger>
            <TabsTrigger value="badges" className="text-white">Badges</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Events</h2>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white"
                    onClick={() => {
                      setEditingEvent(null);
                      eventForm.reset({
                        title: "",
                        description: "",
                        date: "",
                        status: "upcoming",
                        participants: 0,
                        imageUrl: "",
                        skillGained: "",
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="gaming-card max-w-2xl dialog-content-no-scroll">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(editingEvent ? updateEventMutation.mutate : createEventMutation.mutate)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={eventForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="skillGained"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Skill Gained</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={eventForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={eventForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[var(--dark-secondary)] border-slate-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                  <SelectItem value="ongoing">Ongoing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name="participants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Participants</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={eventForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="https://example.com/image.jpg"
                                className="bg-[var(--dark-secondary)] border-slate-600 text-white"
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
                          onClick={() => {
                            setIsEventDialogOpen(false);
                            setEditingEvent(null);
                            eventForm.reset({
                              title: "",
                              description: "",
                              date: "",
                              status: "upcoming",
                              participants: 0,
                              imageUrl: "",
                              skillGained: "",
                            });
                          }}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createEventMutation.isPending || updateEventMutation.isPending}
                          className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white"
                        >
                          {editingEvent ? "Update Event" : "Create Event"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-blue)] mx-auto"></div>
                </div>
              ) : events && events.length > 0 ? (
                events.map((event: any) => (
                  <Card key={event.id} className="gaming-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={`${
                          event.status === 'completed' ? 'bg-slate-500' :
                          event.status === 'upcoming' ? 'bg-[var(--accent-purple)]' :
                          'bg-[var(--accent-blue)]'
                        } text-white`}>
                          {event.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEvent(event)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                      <div className="space-y-1 text-xs text-slate-500">
                        <div>Date: {new Date(event.date).toLocaleDateString()}</div>
                        <div>Participants: {event.participants}</div>
                        <div>Skill: {event.skillGained}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">No events found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Users</h2>
              <div className="flex space-x-4">
                <Dialog open={isExpDialogOpen} onOpenChange={setIsExpDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[var(--gaming-green)] hover:bg-green-600 text-white">
                      <Star className="mr-2 h-4 w-4" />
                      Add EXP
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="gaming-card">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Experience Points</DialogTitle>
                    </DialogHeader>
                    <Form {...userExpForm}>
                      <form onSubmit={userExpForm.handleSubmit(addUserExpMutation.mutate)} className="space-y-4">
                        <FormField
                          control={userExpForm.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">User ID</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Enter user ID"
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userExpForm.control}
                          name="expToAdd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Experience Points</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userExpForm.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Reason</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Why are you adding these points?"
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
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
                            onClick={() => setIsExpDialogOpen(false)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={addUserExpMutation.isPending}
                            className="bg-[var(--gaming-green)] hover:bg-green-600 text-white"
                          >
                            Add EXP
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isBadgeAssignDialogOpen} onOpenChange={setIsBadgeAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[var(--accent-gold)] hover:bg-yellow-600 text-white">
                      <Award className="mr-2 h-4 w-4" />
                      Assign Badge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="gaming-card">
                    <DialogHeader>
                      <DialogTitle className="text-white">Assign Badge to User</DialogTitle>
                    </DialogHeader>
                    <Form {...userBadgeForm}>
                      <form onSubmit={userBadgeForm.handleSubmit(assignBadgeMutation.mutate)} className="space-y-4">
                        <FormField
                          control={userBadgeForm.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">User ID</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Enter user ID"
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userBadgeForm.control}
                          name="badgeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Badge</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger className="bg-[var(--dark-secondary)] border-slate-600 text-white">
                                    <SelectValue placeholder="Select a badge" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {badges && badges.map((badge: any) => (
                                    <SelectItem key={badge.id} value={badge.id.toString()}>
                                      {badge.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsBadgeAssignDialogOpen(false)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={assignBadgeMutation.isPending}
                            className="bg-[var(--accent-gold)] hover:bg-yellow-600 text-white"
                          >
                            Assign Badge
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      Update Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="gaming-card">
                    <DialogHeader>
                      <DialogTitle className="text-white">Update User Role</DialogTitle>
                    </DialogHeader>
                    <Form {...userRoleForm}>
                      <form onSubmit={userRoleForm.handleSubmit((data) => updateRoleMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={userRoleForm.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">User ID</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Enter user ID"
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userRoleForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[var(--dark-secondary)] border-slate-600 text-white">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsRoleDialogOpen(false)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={updateRoleMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Update Role
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-blue)] mx-auto"></div>
                </div>
              ) : users && users.length > 0 ? (
                users.map((user: any) => (
                  <Card key={user.id} className="gaming-card">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <img 
                          src={user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-[var(--accent-blue)]" 
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">User ID:</span>
                          <span className="text-white font-mono">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">EXP:</span>
                          <span className="text-[var(--gaming-green)]">{user.experiencePoints || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Level:</span>
                          <span className="text-[var(--accent-blue)]">{user.level || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rank:</span>
                          <span className="text-[var(--accent-purple)]">{user.rank || "Novice"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Role:</span>
                          <Badge className={`${
                            user.role === 'admin' ? 'bg-red-600' :
                            user.role === 'moderator' ? 'bg-orange-600' :
                            'bg-slate-600'
                          } text-white text-xs`}>
                            {user.role || 'member'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Joined:</span>
                          <span className="text-white">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">No users found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Badges</h2>
              <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[var(--accent-gold)] hover:bg-yellow-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Badge
                  </Button>
                </DialogTrigger>
                <DialogContent className="gaming-card">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Badge</DialogTitle>
                  </DialogHeader>
                  <Form {...badgeForm}>
                    <form onSubmit={badgeForm.handleSubmit(createBadgeMutation.mutate)} className="space-y-4">
                      <FormField
                        control={badgeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Badge Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={badgeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={badgeForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Color (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="#FFD700"
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={badgeForm.control}
                          name="requiredExp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Required EXP</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  className="bg-[var(--dark-secondary)] border-slate-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={badgeForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Icon (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="trophy, star, crown, etc."
                                className="bg-[var(--dark-secondary)] border-slate-600 text-white"
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
                          onClick={() => setIsBadgeDialogOpen(false)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createBadgeMutation.isPending}
                          className="bg-[var(--accent-gold)] hover:bg-yellow-600 text-white"
                        >
                          Create Badge
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Badges List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badgesLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-blue)] mx-auto"></div>
                </div>
              ) : badges && badges.length > 0 ? (
                badges.map((badge: any) => (
                  <Card key={badge.id} className="gaming-card">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: badge.color || '#FFD700' }}
                        >
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
                          <p className="text-slate-400 text-sm">{badge.description}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Required EXP:</span>
                          <span className="text-[var(--gaming-green)]">{badge.requiredExp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Created:</span>
                          <span className="text-white">
                            {new Date(badge.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">No badges found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Event Analytics</h2>
              
              {/* Event Participation Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Event Participation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eventParticipations && eventParticipations.length > 0 ? (
                      <div className="space-y-4">
                        {eventParticipations.map((participation: any) => (
                          <div key={participation.id} className="flex justify-between items-center p-3 bg-[var(--dark-secondary)] rounded-lg">
                            <div>
                              <p className="text-white font-semibold">{participation.event?.title}</p>
                              <p className="text-slate-400 text-sm">
                                {participation.user?.firstName} {participation.user?.lastName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[var(--gaming-green)] font-semibold">
                                +{participation.expGained} EXP
                              </p>
                              <p className="text-slate-400 text-sm">
                                {new Date(participation.participationDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">No participation data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Recent User Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {users && users.length > 0 ? (
                      <div className="space-y-4">
                        {users.slice(0, 5).map((user: any) => (
                          <div key={user.id} className="flex items-center space-x-3 p-3 bg-[var(--dark-secondary)] rounded-lg">
                            <img 
                              src={user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                            <div className="flex-1">
                              <p className="text-white font-semibold">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-slate-400 text-sm">
                                Level {user.level || 1} • {user.experiencePoints || 0} EXP
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">No user data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
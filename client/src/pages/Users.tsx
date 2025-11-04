import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export default function Users() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold font-serif mb-8">Users</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold font-serif mb-2">Users</h1>
          <p className="text-muted-foreground">
            {users?.length || 0} registered {users?.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        {!users || users.length === 0 ? (
          <Card className="p-12 text-center">
            <UserIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No users registered yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const initials = user.username
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={user.id} data-testid={`card-user-${user.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1" data-testid={`text-username-${user.id}`}>
                          {user.username}
                        </CardTitle>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span data-testid={`text-email-${user.id}`}>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MessageThread } from "@/components/MessageThread";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  propertyName?: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Is the property still available?",
    time: "10m ago",
    unread: 2,
    propertyName: "Sunset Apartment",
  },
  {
    id: "2",
    name: "Michael Chen",
    lastMessage: "Thank you for the viewing!",
    time: "1h ago",
    unread: 0,
    propertyName: "Ocean View Condo",
  },
  {
    id: "3",
    name: "Emma Wilson",
    lastMessage: "When can I move in?",
    time: "3h ago",
    unread: 1,
    propertyName: "Downtown Loft",
  },
];

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState<Contact>(mockContacts[0]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <Card className="lg:col-span-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedContact.id === contact.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-foreground truncate">{contact.name}</p>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      {contact.propertyName && (
                        <p className="text-xs text-muted-foreground mb-1">{contact.propertyName}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                        {contact.unread > 0 && (
                          <Badge variant="default" className="ml-2">
                            {contact.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-2">
            <MessageThread
              recipientName={selectedContact.name}
              propertyName={selectedContact.propertyName}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

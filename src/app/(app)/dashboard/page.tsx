import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Users, Archive, CalendarCheck, BookOpenText, BarChart3, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Dashboard - Reservista Admin',
};

// Mock data for dashboard cards
const summaryStats = [
  { title: "Today's Reservations", value: "12", icon: CalendarCheck, trend: "+5%", trendColor: "text-green-500" },
  { title: "Pending Approvals", value: "3", icon: AlertTriangle, trendColor: "text-yellow-500" },
  { title: "Occupied Tables", value: "8/15", icon: Archive },
  { title: "Total Menu Items", value: "45", icon: BookOpenText },
];

const quickLinks = [
  { href: "/reservations/new", label: "Add Reservation", icon: CalendarCheck },
  { href: "/tables", label: "Manage Tables", icon: Archive },
  { href: "/menu/new", label: "Add Menu Item", icon: BookOpenText },
  { href: "/users", label: "View Users", icon: Users },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your restaurant's activities.</p>
        </div>
        <Link href="/reservations/new" passHref>
          <Button>
            <CalendarCheck className="mr-2 h-4 w-4" /> New Reservation
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend && <p className={`text-xs ${stat.trendColor} mt-1`}>{stat.trend} from last week</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Links Card */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} passHref>
                <Button variant="outline" className="w-full justify-start text-left h-auto py-3">
                  <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-grow">{link.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Placeholder for a chart */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Reservation Trends</CardTitle>
            <CardDescription>Visual representation of reservations over time.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md">
             <Image src="https://placehold.co/600x300.png?text=Chart+Placeholder" alt="Chart placeholder" data-ai-hint="chart analytics" width={600} height={300} className="opacity-50"/>
            <p className="mt-4 text-muted-foreground text-sm">Reservation chart coming soon</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Placeholder */}
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and actions in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[1,2,3].map(item => (
              <li key={item} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-full">
                     <Users className="h-5 w-5 text-primary" />
                   </div>
                  <div>
                    <p className="text-sm font-medium">New user 'John Doe' registered.</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </li>
            ))}
          </ul>
           <p className="mt-4 text-center text-muted-foreground text-sm">Activity feed coming soon.</p>
        </CardContent>
      </Card>

    </div>
  );
}

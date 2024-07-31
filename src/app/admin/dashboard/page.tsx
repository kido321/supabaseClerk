"use client";

import React, { useState, useEffect } from 'react';
import { createClerkSupabaseClient } from '../../lib/supabase';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar,
  Users,
  Car,
  AlertTriangle,
  Plus,
  List,
  BarChart,
} from 'lucide-react';

type SummaryStats = {
  totalTripsToday: number;
  activeDrivers: number;
  availableVehicles: number;
  completedTripsThisWeek:number;
};
type UpcomingTrip = {
  id: string;
  patientName: string;
  pickupTime: string;
  pickupAddress: string;
};

type DriverStatus = {
  id: string;
  name: string;
  status: 'Available' | 'On Trip' | 'Off Duty';
};

type VehicleUtilization = {
  id: string;
  info: string;
  status: 'In Use' | 'Available' | 'Maintenance';
};

type Alert = {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
};

type PerformanceData = {
  date: string;
  trips: number;
};


export default function DashboardPage() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalTripsToday: 0,
    activeDrivers: 0,
    availableVehicles: 0,
    completedTripsThisWeek: 0,
  });
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
  const [driverStatuses, setDriverStatuses] = useState<DriverStatus[]>([]);
  const [vehicleUtilization, setVehicleUtilization] = useState<VehicleUtilization[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClerkSupabaseClient();
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      fetchDashboardData();
    }
  }, [organization]);

async function test(org_id : string){
  console.log( organization?.id)
  const { data, error } = await supabase.rpc('get_summary_stats', {orgid : org_id})
  if (error) {
    console.error('Error calling function:', error);
  } else {
    console.log('Function result:', data);
  }
}

  useEffect(() => {
    setTimeout(() => {
     test('org_2hmjO5lh50JbtYmRvAMhgmnYVzJ')
    }, 1000);
  }, []);
  const fetchDashboardData = async () => {
    setIsLoading(true);
    console.log(organization?.id)
    try {
      const [
        { data: statsData },
        { data: tripsData },
        { data: driversData },
        { data: vehiclesData },
        // { data: alertsData },
        { data: perfData }
      ] = await Promise.all([
        supabase.rpc('get_summary_stats', { orgid: organization?.id }),
        supabase.rpc('get_upcoming_trips', { orgid: organization?.id, limit_count: 5 }),
        supabase.rpc('get_driver_statuses', { orgid: organization?.id }),
        supabase.rpc('get_vehicle_utilization', { orgid: organization?.id }),
        // supabase.rpc('get_recent_alerts', { org_id: organization?.id, limit_count: 5 }),
        supabase.rpc('get_trips_per_day', { orgid: organization?.id })
      ]);
  
      if (statsData){ setSummaryStats(
        
        {
          totalTripsToday: statsData[0].totalTripsToday,
          activeDrivers: statsData[0].activeDrivers,
          availableVehicles: statsData[0].availableVehicles,
          completedTripsThisWeek: statsData[0].completedTripsThisWeek,
        }
        
        
        
        
        
        
        );
        console.log('statdata' , statsData[0]);
        console.log(summaryStats)
        console.log(typeof(summaryStats.activeDrivers))

      }
      else{
        console.log("gjbdkjfb")
      }
      if (tripsData) setUpcomingTrips(tripsData);
      if (driversData) setDriverStatuses(driversData);
      if (vehiclesData) setVehicleUtilization(vehiclesData);
      // if (alertsData) setAlerts(alertsData);
      if (perfData) setPerformanceData(perfData);
  
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Trips Today", value: summaryStats.totalTripsToday, icon: Calendar },
          { title: "Active Drivers", value: summaryStats.activeDrivers, icon: Users },
          { title: "Available Vehicles", value: summaryStats.availableVehicles, icon: Car },
          { title: "Completed Trips This Week", value: summaryStats.completedTripsThisWeek, icon: Calendar },
        ].map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Trips and Driver Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Pickup Time</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{trip.patientName}</TableCell>
                      <TableCell>{new Date(trip.pickupTime).toLocaleString()}</TableCell>
                      <TableCell>{trip.pickupAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Driver Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverStatuses.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          driver.status === 'Available' ? 'bg-green-100 text-green-800' :
                          driver.status === 'On Trip' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Utilization and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleUtilization.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.info}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          vehicle.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                          vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id} className={`flex items-center p-2 rounded ${
                  alert.type === 'error' ? 'bg-red-100 text-red-800' :
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>{alert.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trips Performance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {performanceData.map((data) => {
              const maxTrips = Math.max(...performanceData.map(d => d.trips));
              const percentage = (data.trips / maxTrips) * 100;
              return (
                <div key={data.date} className="flex items-center">
                  <div className="w-24 text-sm">{data.date}</div>
                  <div className="flex-grow">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="w-16 text-right text-sm">{data.trips} trips</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button asChild>
          <Link href="/admin/trips/add" className="flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4" /> Add New Trip
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/drivers" className="flex items-center justify-center">
            <Users className="mr-2 h-4 w-4" /> Manage Drivers
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/vehicles" className="flex items-center justify-center">
            <Car className="mr-2 h-4 w-4" /> Manage Vehicles
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/reports" className="flex items-center justify-center">
            <BarChart className="mr-2 h-4 w-4" /> View Reports
          </Link>
        </Button>
      </div>
    </div>
  );
}
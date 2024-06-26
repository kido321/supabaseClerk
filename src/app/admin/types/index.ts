export type Trip = {
    id: string;
    patient_name: string;
    driver_name: string;
    vehicle_info: string;
    pickup_address: string;
    dropoff_address: string;
    pickup_datetime: string;
    dropoff_datetime: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  };
  
  export type TripInput = Omit<Trip, 'id' | 'status'>;
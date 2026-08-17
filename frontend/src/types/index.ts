export interface Patient {
  id: number;
  name: string;
  email: string;
  password?: string;
  dob: string;
  phone: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  provider_name: string;
  first_appointment: string;
  repeat_schedule: 'none' | 'weekly' | 'biweekly' | 'monthly';
  end_date?: string | null;
}

export interface Prescription {
  id: number;
  patient_id: number;
  medication_name: string;
  dosage: string;
  quantity: number;
  refill_date: string;
  refill_schedule: 'monthly' | 'quarterly' | 'none';
}
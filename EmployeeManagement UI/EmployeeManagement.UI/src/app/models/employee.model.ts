// Creating a new Class/Model/Structure of type 'Employee'

export interface Employee {
    empId: string;
    id?: string;
    firstName: string;
    lastName: string;
    department: string;
    emailId: string;
    mobileNo: string;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    dob?: string | null;
    dateOfJoining: string | null;
    photo?: string | null;
    address?: string | null;
    password: string | null;
    avatar?: string | null;
    phone?: string | null;
    position?: string | null;
    status?: string | null;
    dateJoined?: string | null;
    bio?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
}